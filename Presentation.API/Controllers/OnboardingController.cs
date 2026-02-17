using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Onboarding;

namespace Presentation.API.Controllers;

[Authorize(Roles = "system-admin,SystemAdmin")]
[ApiController]
[Route("api/[controller]")]
public class OnboardingController(IServiceManager service) : ControllerBase
{
    [HttpGet("registrations")]
    public async Task<IActionResult> GetRegistrations()
    {
        var result = await service.Onboarding.GetAllRegistrationsAsync();
        return Ok(result);
    }

    [HttpGet("registrations/pending")]
    public async Task<IActionResult> GetPendingRegistrations()
    {
        var result = await service.Onboarding.GetPendingRegistrationsAsync();
        return Ok(result);
    }

    [HttpGet("registrations/{id:int}")]
    public async Task<IActionResult> GetRegistrationById(int id)
    {
        var result = await service.Onboarding.GetRegistrationByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("approve")]
    public async Task<IActionResult> ApproveRegistration([FromBody] ApprovalDto approvalDto)
    {
        var result = await service.Onboarding.ApproveRegistrationAsync(approvalDto);
        if (result) return Ok(new { message = "Registration approved successfully" });
        return BadRequest(new { message = "Failed to approve registration" });
    }

    [HttpPost("reject")]
    public async Task<IActionResult> RejectRegistration([FromBody] RejectionDto rejectionDto)
    {
        var result = await service.Onboarding.RejectRegistrationAsync(rejectionDto);
        if (result) return Ok(new { message = "Registration rejected successfully" });
        return BadRequest(new { message = "Failed to reject registration" });
    }
}
