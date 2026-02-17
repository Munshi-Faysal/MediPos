using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.OnboardingStep;

namespace Presentation.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OnboardingStepController(IServiceManager service) : ControllerBase
{
    [HttpGet("status")]
    public async Task<IActionResult> GetOnboardingStatus()
    {
        var result = await service.OnboardingStep.GetOnboardingStatusAsync();
        return Ok(result);
    }

    [HttpGet("steps")]
    public async Task<IActionResult> GetAllSteps()
    {
        var result = await service.OnboardingStep.GetAllStepsAsync();
        return Ok(result);
    }

    [HttpPost("complete")]
    public async Task<IActionResult> CompleteStep([FromBody] CompleteStepDto dto)
    {
        var result = await service.OnboardingStep.CompleteStepAsync(dto.StepKey);
        if (result)
            return Ok(new { message = "Step completed successfully" });
        return BadRequest(new { message = "Failed to complete step" });
    }

    [HttpPost("reset")]
    public async Task<IActionResult> ResetSteps()
    {
        var result = await service.OnboardingStep.ResetStepsAsync();
        if (result)
            return Ok(new { message = "Onboarding progress reset successfully" });
        return BadRequest(new { message = "Failed to reset onboarding progress" });
    }
}
