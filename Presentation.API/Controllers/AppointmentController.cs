using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Appointment;

namespace Presentation.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AppointmentController(IServiceManager service) : ControllerBase
{
    [HttpGet("doctor/{doctorId}")]
    public async Task<IActionResult> GetByDoctor(string doctorId)
    {
        var result = await service.Appointment.GetAppointmentsByDoctorIdAsync(doctorId);
        return Ok(new { data = result });
    }

    [HttpGet("doctor/current")]
    public async Task<IActionResult> GetByCurrentDoctor()
    {
        return Ok(new { data = await service.Appointment.GetAppointmentsByCurrentDoctorAsync() });
    }

    [HttpGet("doctor/{doctorId}/date/{date}")]
    public async Task<IActionResult> GetByDate(string doctorId, DateTime date)
    {
        var result = await service.Appointment.GetAppointmentsByDateAsync(doctorId, date);
        return Ok(new { data = result });
    }

    [HttpGet("doctor/current/date/{date}")]
    public async Task<IActionResult> GetByCurrentDoctorAndDate(DateTime date)
    {
        return Ok(new { data = await service.Appointment.GetAppointmentsByCurrentDoctorAndDateAsync(date) });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AppointmentDto dto)
    {
        var result = await service.Appointment.CreateAsync(dto);
        return result ? Ok() : BadRequest();
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] string status)
    {
        var result = await service.Appointment.UpdateStatusAsync(id, status);
        return result ? Ok() : BadRequest();
    }
}
