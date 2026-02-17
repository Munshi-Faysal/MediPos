using Domain.Models;
using Microsoft.AspNetCore.Identity;
using Shared.DTOs.MainDTOs.Account;
using System.Security.Claims;

namespace Services.Contracts.ServiceInterfaces;

public interface IAccountService
{
    Task<IdentityResult> RegisterAsync(RegisterDto registerDto);
    Task<IdentityResult> RegisterWithPackageAsync(RegisterWithPackageDto registerDto);
    Task<LoginResponseDto> LoginAsync(LoginDto loginDto);
    Task<bool> VerifyLoginOtpAsync(LoginOtpDto loginOtpDto);
    Task<IdentityResult> ChangePasswordAsync(ClaimsPrincipal user, ChangePasswordDto changePasswordDto);
    Task<string?> RequestOtpAsync(ApplicationUser userNameEmail);
    Task<IdentityResult> ResetPasswordAsync(ApplicationUser user, ResetPasswordDto resetPasswordDto);
    Task<IdentityResult> ConfirmEmailAsync(ApplicationUser user, string token);
    Task<bool> SendConfirmationMailAsync(ApplicationUser applicationUser);
    Task<byte[]?> EnableAuthenticatorAsync(ClaimsPrincipal user);
    Task<IdentityResult> VerifyTwoFactorAuthenticationAsync(ClaimsPrincipal user, int code);
}