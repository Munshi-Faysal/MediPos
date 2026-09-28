using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Repositories.Contracts.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Common;
using Shared.DTOs.MainDTOs.Account;
using Shared.DTOs.MainDTOs.Mail;
using Shared.Enums;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Services.Concretes.ServiceInfrastructure;

public sealed class AccountService(UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IAppMailService appMailService,
    IConfiguration configuration,
    IRepositoryManager repository,
    IOptions<EnvironmentVariables> environmentVariables,
    IOptions<TotpSettings> totp,
    IHttpContextAccessor httpContextAccessor,
    IMapper mapper,
    ICommonService commonService) : IAccountService
{
    private const string TokenTypeClaim = "token_type";
    private const string AccessTokenType = "access";
    private const string RefreshTokenType = "refresh";
    private const string SecurityStampClaim = "security_stamp";
    private const int AccessTokenLifetimeMinutes = 30;
    private const int RefreshTokenLifetimeDays = 30;

    private readonly int _systemUserId = repository.User.GetSystemUserIdAsync();
    private readonly string _frontEndUrl = environmentVariables.Value.FrontEndUrl;

    public async Task<IdentityResult> RegisterAsync(RegisterDto registerDto)
    {
        if (await userManager.FindByEmailAsync(registerDto.Email) is not null)
            return Failed(GlobalErrors.DuplicateSubmission(nameof(RegisterDto.Email)));

        var user = new ApplicationUser
        {
            UserName = registerDto.Username,
            DisplayName = registerDto.DisplayName,
            Email = registerDto.Email,
            AccountName = registerDto.Email,
            CreatedDate = DateTime.Now,
            UpdatedDate = DateTime.Now,
            IsActive = true,
            CreatedBy = _systemUserId,
            UpdatedBy = _systemUserId
        };

        var result = await userManager.CreateAsync(user, registerDto.Password);
        if (result.Succeeded)
            if (!await SendConfirmationMailAsync(user))
                return Failed("User created but failed to send confirmation email.");
        return result;
    }

    public async Task<IdentityResult> RegisterWithPackageAsync(RegisterWithPackageDto registerDto)
    {
        // Check if email already exists
        if (await userManager.FindByEmailAsync(registerDto.Email) is not null)
            return Failed(GlobalErrors.DuplicateSubmission(nameof(RegisterWithPackageDto.Email)));

        // Check if registration with this email already exists
        var existingRegistration = await repository.CompanyRegistration.GetByEmailAsync(registerDto.Email);
        if (existingRegistration is not null)
            return Failed(GlobalErrors.DuplicateSubmission(nameof(RegisterWithPackageDto.Email)));

        // Create user
        var user = new ApplicationUser
        {
            UserName = registerDto.Username,
            DisplayName = registerDto.DisplayName,
            Email = registerDto.Email,
            AccountName = registerDto.Email,
            CreatedDate = DateTime.Now,
            UpdatedDate = DateTime.Now,
            IsActive = true,
            CreatedBy = _systemUserId,
            UpdatedBy = _systemUserId
        };

        var result = await userManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded)
            return result;

        // Create company registration record
        var companyRegistration = new CompanyRegistration
        {
            OrganizationName = registerDto.OrganizationName,
            Email = registerDto.Email,
            Phone = registerDto.Phone,
            PackageId = registerDto.PackageId,
            PackageName = registerDto.PackageName,
            PackagePrice = registerDto.PackagePrice,
            PackageFeatures = registerDto.PackageFeatures,
            PaymentStatus = !string.IsNullOrWhiteSpace(registerDto.CardNumber) ? "Completed" : "Skipped",
            CardNumber = !string.IsNullOrWhiteSpace(registerDto.CardNumber) && registerDto.CardNumber.Length >= 4 
                ? registerDto.CardNumber[^4..] // Store only last 4 digits
                : null,
            CardHolder = registerDto.CardHolder,
            ExpiryDate = registerDto.ExpiryDate,
            UserId = user.Id,
            CreatedDate = DateTime.Now,
            UpdatedDate = DateTime.Now,
            IsActive = true,
            CreatedBy = _systemUserId,
            UpdatedBy = _systemUserId
        };

        var registrationResult = await repository.CompanyRegistration.InsertAsync(companyRegistration);
        if (!registrationResult)
        {
            // If registration record creation fails, delete the user
            await userManager.DeleteAsync(user);
            return Failed("Failed to create registration record.");
        }

        // Send confirmation email
        if (!await SendConfirmationMailAsync(user))
            return Failed("User created but failed to send confirmation email.");

        return result;
    }

    public async Task<LoginResponseDto> LoginAsync(
        LoginDto loginDto)
    {
        var user = await userManager.FindByNameAsync(loginDto.UsernameEmail)
                   ?? await userManager.FindByEmailAsync(loginDto.UsernameEmail);

        if (user is null)
            return FailedToken("User not found.");

        if (!await userManager.IsEmailConfirmedAsync(user))
            return FailedToken("Email is not confirmed.", false);

        if (!await userManager.CheckPasswordAsync(user, loginDto.Password))
            return FailedToken("Invalid password.");

        var tokens = await GenerateTokenPairAsync(user);
        if (tokens is not null)
        {
            var loginResponseDto = new LoginResponseDto
            {
                Result = IdentityResult.Success,
                Token = tokens.Value.AccessToken,
                RefreshToken = tokens.Value.RefreshToken,
                UserId = user.Id,
                IsMailConfirmed = true
            };
            
            var doctor = await repository.Doctor.GetByUserIdAsync(user.Id);
            if (doctor != null)
            {
                loginResponseDto.DoctorId = doctor.Id;
            }

            if (await userManager.GetTwoFactorEnabledAsync(user) &&
                !await IsDeviceTrustedAsync(user, loginDto.DeviceId))
            {
                loginResponseDto.Is2FaRequired = true;
            }
            return loginResponseDto;
        }
        return FailedToken("Can't generate authentication token");
    }

    public async Task<LoginResponseDto> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!)),
                ValidateIssuer = true,
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = configuration["Jwt:Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(refreshToken, validationParameters, out var validatedToken);
            if (validatedToken is not JwtSecurityToken jwtToken ||
                !string.Equals(jwtToken.Header.Alg, SecurityAlgorithms.HmacSha256, StringComparison.OrdinalIgnoreCase) ||
                principal.FindFirstValue(TokenTypeClaim) != RefreshTokenType)
            {
                return FailedToken("Invalid refresh token.");
            }

            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return FailedToken("Invalid refresh token.");

            var user = await userManager.FindByIdAsync(userId);
            if (user is null || !user.IsActive || !await userManager.IsEmailConfirmedAsync(user))
                return FailedToken("User session is no longer valid.");

            var tokenSecurityStamp = principal.FindFirstValue(SecurityStampClaim);
            if (string.IsNullOrEmpty(tokenSecurityStamp) ||
                !string.Equals(tokenSecurityStamp, user.SecurityStamp, StringComparison.Ordinal))
            {
                return FailedToken("User session is no longer valid.");
            }

            var tokens = await GenerateTokenPairAsync(user);
            if (tokens is null)
                return FailedToken("Can't renew authentication token.");

            var response = new LoginResponseDto
            {
                Result = IdentityResult.Success,
                Token = tokens.Value.AccessToken,
                RefreshToken = tokens.Value.RefreshToken,
                UserId = user.Id,
                IsMailConfirmed = true
            };

            var doctor = await repository.Doctor.GetByUserIdAsync(user.Id);
            if (doctor is not null)
                response.DoctorId = doctor.Id;

            return response;
        }
        catch (SecurityTokenException)
        {
            return FailedToken("Invalid or expired refresh token.");
        }
        catch (ArgumentException)
        {
            return FailedToken("Invalid refresh token.");
        }
    }

    public async Task<bool> VerifyLoginOtpAsync(LoginOtpDto loginOtpDto)
    {
        var user = await userManager.FindByIdAsync(loginOtpDto.UserId.ToString());
        if (user is not null)
        {
            var isValidOtp = await userManager.VerifyTwoFactorTokenAsync(user,
                TokenOptions.DefaultAuthenticatorProvider, loginOtpDto.Otp.ToString());

            if (isValidOtp)
            {
                if (loginOtpDto is { DeviceId: not null, Browser: not null, OperatingSystem: not null })
                {
                    return await SaveTrustedDeviceAsync(loginOtpDto);
                }
                return true;
            }
        }
        return false;
    }

    public async Task<bool> SendConfirmationMailAsync(ApplicationUser user)
    {
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);
        //var confirmationLink = $"{_frontEndUrl}/#/confirmEmail/{user.Id}/{encodedToken}";
        var confirmationLink = $"{_frontEndUrl}/#/confirmEmail?userId={user.Id}&token={encodedToken}";
        var mailConfirmationDto = new MailConfirmationDto
        {
            InitiatorName = user.DisplayName,
            Subject = $"Confirm Email Address - {user.DisplayName}",
            EmailTemplate = nameof(EmailTemplates.MailConfirmation),
            ToEmail = user.Email!,
            ConfirmationLink = confirmationLink
        };

        return await appMailService.SendEmailAsync(mailConfirmationDto);
    }

    public async Task<byte[]?> EnableAuthenticatorAsync(ClaimsPrincipal user)
    {
        var applicationUser = await userManager.GetUserAsync(user);
        if (applicationUser is not null)
        {
            _ = await userManager.ResetAuthenticatorKeyAsync(applicationUser);
            var key = await userManager.GetAuthenticatorKeyAsync(applicationUser);
            if (applicationUser.Email is not null && key is not null)
            {
                var totpUri = GenerateQrCodeUri(applicationUser.Email, key);
                return await commonService.GenerateQrCode(totpUri);
            }
        }
        return null;
    }

    public async Task<IdentityResult> VerifyTwoFactorAuthenticationAsync(ClaimsPrincipal user, int code)
    {
        var applicationUser = await userManager.GetUserAsync(user);
        if (applicationUser is not null)
        {
            if (await userManager.VerifyTwoFactorTokenAsync(applicationUser, TokenOptions.DefaultAuthenticatorProvider, code.ToString()))
            {
                return await userManager.SetTwoFactorEnabledAsync(applicationUser, true);
            }
            return Failed(GlobalErrors.InvalidSubmission(nameof(code)));
        }
        return Failed(GlobalErrors.NotFound("User"));
    }

    public async Task<IdentityResult> ChangePasswordAsync(ClaimsPrincipal user, ChangePasswordDto changePasswordDto)
    {
        if (!changePasswordDto.CurrentPassword.Equals(changePasswordDto.NewPassword))
        {
            var applicationUser = await userManager.GetUserAsync(user);
            if (applicationUser is not null)
            {
                var result = await userManager.ChangePasswordAsync(applicationUser, changePasswordDto.CurrentPassword,
                    changePasswordDto.NewPassword);
                if (result.Succeeded)
                    await signInManager.RefreshSignInAsync(applicationUser);
                return result;
            }
            return Failed(GlobalErrors.InvalidSubmission(nameof(LoginDto.UsernameEmail), typeof(LoginDto)));
        }
        return Failed(GlobalErrors.OldPasswordSubmission());
    }

    public async Task<string?> RequestOtpAsync(ApplicationUser user)
    {
        var mailRequestDto = new MailOtpDto
        {
            InitiatorName = user.DisplayName,
            Subject = $"Reset Password - {user.DisplayName}",
            EmailTemplate = nameof(EmailTemplates.OtpEmail),
            ToEmail = user.Email!,
            Otp = await userManager.GenerateUserTokenAsync(user, nameof(CommonKeyword.NumericOtp), nameof(CommonKeyword.PasswordReset))
        };

        return await appMailService.SendEmailAsync(mailRequestDto) ? GlobalMethods.MaskEmail(mailRequestDto.ToEmail) : null;
    }

    public async Task<IdentityResult> ResetPasswordAsync(ApplicationUser user, ResetPasswordDto resetPasswordDto)
    {
        if (!IsCurrentPasswordReused(user, resetPasswordDto.NewPassword))
        {
            if (await userManager.VerifyUserTokenAsync(user, "NumericOtp", "PasswordReset",
                    resetPasswordDto.Otp.ToString()))
            {
                var result = await userManager.RemovePasswordAsync(user);
                if (result.Succeeded)
                {
                    return await userManager.AddPasswordAsync(user, resetPasswordDto.NewPassword);
                }
                return result;
            }
            return Failed("Invalid OTP Provided");
        }
        return Failed(GlobalErrors.OldPasswordSubmission());
    }

    public async Task<IdentityResult> ConfirmEmailAsync(ApplicationUser user, string token)
    {
        return await userManager.ConfirmEmailAsync(user, token);
    }

    private string GenerateQrCodeUri(string email, string key)
    {
        var issuer = Uri.EscapeDataString(totp.Value.Issuer);
        var user = Uri.EscapeDataString(email);
        return $"otpauth://totp/{issuer}:{user}?secret={key}&issuer={issuer}&digits=6";
    }

    private async Task<(string AccessToken, string RefreshToken)?> GenerateTokenPairAsync(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);
        var accessClaims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName ?? ""),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(TokenTypeClaim, AccessTokenType)
        };

        foreach (var role in roles)
        {
            accessClaims.Add(new Claim(ClaimTypes.Role, role));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var accessToken = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: accessClaims,
            expires: DateTime.UtcNow.AddMinutes(AccessTokenLifetimeMinutes),
            signingCredentials: credentials);

        var refreshClaims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(TokenTypeClaim, RefreshTokenType),
            new Claim(SecurityStampClaim, user.SecurityStamp ?? string.Empty)
        };

        var refreshToken = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: refreshClaims,
            expires: DateTime.UtcNow.AddDays(RefreshTokenLifetimeDays),
            signingCredentials: credentials);

        var tokenHandler = new JwtSecurityTokenHandler();
        return (tokenHandler.WriteToken(accessToken), tokenHandler.WriteToken(refreshToken));
    }

    private async Task<bool> SaveTrustedDeviceAsync(LoginOtpDto loginOtpDto)
    {
        var trustedDeviceDto = mapper.Map<TrustedDeviceDto>(loginOtpDto);
        trustedDeviceDto.UserId = loginOtpDto.UserId;
        trustedDeviceDto.CreatedDate = DateTime.Now;
        trustedDeviceDto.IpAddress = httpContextAccessor.HttpContext?.Request.Headers["X-Forwarded-For"].FirstOrDefault()?.Split(',').FirstOrDefault()?.Trim()
            ?? httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString()
                                     ?? nameof(CommonKeyword.Unknown);

        var trustedDevice = mapper.Map<TrustedDevice>(trustedDeviceDto);
        return await repository.TrustedDevice.InsertAsync(trustedDevice);
    }

    private async Task<bool> IsDeviceTrustedAsync(ApplicationUser user, Guid deviceId)
    {
        return await repository.TrustedDevice.IsDeviceTrustedAsync(user.Id, deviceId);
    }

    private static LoginResponseDto FailedToken(string message, bool isMailConfirmed = true)
    {
        return new LoginResponseDto
        {
            Result = IdentityResult.Failed(new IdentityError { Description = message }),
            IsMailConfirmed = isMailConfirmed
        };
    }

    private static IdentityResult Failed(string message)
    {
        return IdentityResult.Failed(new IdentityError { Description = message });
    }

    private static bool IsCurrentPasswordReused(ApplicationUser user, string newPassword)
    {
        var passwordHasher = new PasswordHasher<ApplicationUser>();
        var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash!, newPassword);
        return result == PasswordVerificationResult.Success;
    }
}
