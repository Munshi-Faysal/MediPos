using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Patient;

namespace Presentation.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PatientController(IServiceManager service) : ControllerBase
{
    [HttpGet("list")]
    public async Task<IActionResult> GetAll([FromQuery] int take = 50)
    {
        var result = await service.Patient.GetAllPatientsAsync(Math.Clamp(take, 1, 1000));
        return Ok(new { data = result });
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string term, [FromQuery] int take = 50)
    {
        var result = await service.Patient.SearchPatientsAsync(term, Math.Clamp(take, 1, 1000));
        return Ok(new { data = result });
    }

    [HttpGet("by-phone/{phone}")]
    public async Task<IActionResult> GetByPhone(string phone)
    {
        var result = await service.Patient.GetByPhoneAsync(phone);
        return Ok(new { data = result });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDetails(string id)
    {
        var result = await service.Patient.GetDetailsAsync(id);
        return result is null ? NotFound() : Ok(new { data = result });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PatientDto dto)
    {
        var result = await service.Patient.CreateAsync(dto);
        return result is not null
            ? Ok(result)
            : BadRequest(new { message = "A patient with this phone number already exists." });
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] PatientDto dto)
    {
        var result = await service.Patient.UpdateAsync(dto);
        return result
            ? Ok(new { message = "Patient updated successfully." })
            : BadRequest(new { message = "Unable to update patient. Check the patient ID and phone number." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await service.Patient.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }
}
