using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Common;
using Shared.DTOs.MainDTOs.Account;

namespace Presentation.API.Controllers;

[ApiController]
[Route("api/Account")]
public class AccountController(IServiceManager service,
    IAccountService accountService) : ControllerBase
{
    [HttpPost]
    [AllowAnonymous]
    [Route("Register")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Register(RegisterDto registerDto)
    {
        var result = await accountService.RegisterAsync(registerDto);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }
        return Ok(true);
    }

    [HttpPost]
    [AllowAnonymous]
    [Route("RegisterWithPackage")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> RegisterWithPackage(RegisterWithPackageDto registerDto)
    {
        var result = await accountService.RegisterWithPackageAsync(registerDto);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }
        return Ok(new { message = "Registration successful. Please check your email for confirmation." });
    }

    [HttpPost]
    [AllowAnonymous]
    [Route("Login")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        var loginResponseDto = await accountService.LoginAsync(loginDto);

        if (loginResponseDto is { IsMailConfirmed: true, Result.Succeeded: false })
        {
            var errorMessage = loginResponseDto.Result.Errors.FirstOrDefault()?.Description ?? "Login failed.";
            return Unauthorized(new { message = errorMessage });
        }
        return Ok(loginResponseDto);
    }

    [HttpPost]
    [AllowAnonymous]
    [Route("VerifyLoginOtp")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> VerifyLoginOtp(LoginOtpDto loginOtpDto)
    {
        return Ok(await accountService.VerifyLoginOtpAsync(loginOtpDto));
    }

    [Authorize]
    [HttpPost]
    [Route("ChangePassword")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
    {
        var result = await accountService.ChangePasswordAsync(User, changePasswordDto);
        return result.Succeeded ? Ok(true) : BadRequest(result.Errors);
    }

    [HttpGet]
    [AllowAnonymous]
    [Route("RequestOtp/{userNameEmail}")]
    public async Task<IActionResult> RequestOtp(string userNameEmail)
    {
        var user = await service.User.FindUserByUserNameOrEmailAsync(userNameEmail);
        if (user is not null)
        {
            var requestMail = await accountService.RequestOtpAsync(user);
            return string.IsNullOrEmpty(requestMail)
                ? BadRequest(new { message = GlobalErrors.InvalidSubmission(nameof(ResetPasswordDto.Otp), typeof(ResetPasswordDto)) })
                : Ok(new { maskedEmail = requestMail });
        }
        return BadRequest(new { message = GlobalErrors.InvalidSubmission(nameof(ResetPasswordDto.UsernameEmail), typeof(ResetPasswordDto)) });
    }

    [HttpPost]
    [AllowAnonymous]
    [Route("ResetPassword")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto resetPasswordDto)
    {
        var user = await service.User.FindUserByUserNameOrEmailAsync(resetPasswordDto.UsernameEmail);
        if (user is not null)
        {
            var result = await accountService.ResetPasswordAsync(user, resetPasswordDto);
            return result.Succeeded ? Ok(true) : BadRequest(result.Errors);
        }
        return BadRequest(new { message = GlobalErrors.InvalidSubmission(nameof(resetPasswordDto.UsernameEmail), typeof(ResetPasswordDto)) });
    }

    [HttpGet]
    [Route("ResendConfirmationEmail/{userNameEmail}")]
    public async Task<IActionResult> ResendConfirmationEmail(string userNameEmail)
    {
        var user = await service.User.FindUserByUserNameOrEmailAsync(userNameEmail);
        return user is not null
            ? Ok(await accountService.SendConfirmationMailAsync(user))
            : BadRequest(GlobalErrors.InvalidSubmission(nameof(ResetPasswordDto.UsernameEmail), typeof(ResetPasswordDto)));
    }

    [HttpGet]
    [AllowAnonymous]
    [Route("ConfirmEmail")]
    public async Task<IActionResult> ConfirmEmail(string userId, string token)
    {
        var user = await service.User.FindByIdAsync(userId);
        if (user is not null)
        {
            var result = await accountService.ConfirmEmailAsync(user, Uri.UnescapeDataString(token));
            return result.Succeeded ? Ok(true) : BadRequest(result.Errors);
        }
        return BadRequest(GlobalErrors.NotFound("User"));
    }

    [Authorize]
    [HttpPost]
    [Route("Enable2Fa")]
    public async Task<IActionResult> EnableAuthenticator()
    {
        var qrImage = await accountService.EnableAuthenticatorAsync(User);
        return qrImage is not null
            ? File(qrImage, "image/png")
            : BadRequest("Failed to Enable Authenticator");
    }

    [Authorize]
    [HttpPost]
    [Route("Verify2Fa")]
    public async Task<IActionResult> VerifyTwoFactorAuthentication([FromBody] int code)
    {
        var result = await accountService.VerifyTwoFactorAuthenticationAsync(User, code);
        return result.Succeeded ? Ok(true) : BadRequest(result.Errors);
    }
}