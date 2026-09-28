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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await service.Appointment.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(new { data = result });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AppointmentDto dto)
    {
        var result = await service.Appointment.CreateAsync(dto);
        return result
            ? Ok(new { message = "Appointment scheduled successfully." })
            : BadRequest(new { message = "Unable to schedule the appointment. Check the patient, date and time." });
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] AppointmentDto dto)
    {
        var result = await service.Appointment.UpdateAsync(dto);
        return result
            ? Ok(new { message = "Appointment updated successfully." })
            : BadRequest(new { message = "Unable to update the appointment. Check the patient, date and time." });
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] AppointmentStatusDto dto)
    {
        var result = await service.Appointment.UpdateStatusAsync(id, dto.Status);
        return result
            ? Ok(new { message = "Appointment status updated successfully." })
            : BadRequest(new { message = "Unable to update appointment status." });
    }
}
