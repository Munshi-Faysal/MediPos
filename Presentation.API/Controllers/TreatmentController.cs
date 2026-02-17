using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Treatment;

namespace Presentation.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TreatmentController(IServiceManager service) : ControllerBase
{
    [HttpGet("doctor/{doctorId}")]
    public async Task<IActionResult> GetTemplatesByDoctor(string doctorId)
    {
        var templates = await service.Treatment.GetTemplatesByDoctorIdAsync(doctorId);
        return Ok(new { data = templates });
    }

    [HttpGet("doctor/current")]
    public async Task<IActionResult> GetTemplatesByCurrentDoctor()
    {
        var templates = await service.Treatment.GetTemplatesByCurrentDoctorAsync();
        return Ok(new { data = templates });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTemplate(string id)
    {
        var template = await service.Treatment.GetTemplateWithDrugsAsync(id);
        if (template == null) return NotFound();
        return Ok(new { data = template });
    }

    [HttpPost]
    public async Task<IActionResult> CreateTemplate([FromBody] TreatmentTemplateDto dto)
    {
        var success = await service.Treatment.CreateTemplateAsync(dto);
        if (success) return Ok(new { message = "Template created successfully" });
        return BadRequest(new { message = "Failed to create template" });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateTemplate([FromBody] TreatmentTemplateDto dto)
    {
        var success = await service.Treatment.UpdateTemplateAsync(dto);
        if (success) return Ok(new { message = "Template updated successfully" });
        return BadRequest(new { message = "Failed to update template" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTemplate(string id)
    {
        var success = await service.Treatment.DeleteTemplateAsync(id);
        if (success) return Ok(new { message = "Template deleted successfully" });
        return BadRequest(new { message = "Failed to delete template" });
    }
}
