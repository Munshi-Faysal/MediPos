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
        var result = await service.Patient.GetAllPatientsAsync(take);
        return Ok(new { data = result });
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string term, [FromQuery] int take = 50)
    {
        var result = await service.Patient.SearchPatientsAsync(term, take);
        return Ok(new { data = result });
    }

    [HttpGet("by-phone/{phone}")]
    public async Task<IActionResult> GetByPhone(string phone)
    {
        var result = await service.Patient.GetByPhoneAsync(phone);
        return Ok(new { data = result });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PatientDto dto)
    {
        var result = await service.Patient.CreateAsync(dto);
        return result ? Ok() : BadRequest();
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] PatientDto dto)
    {
        var result = await service.Patient.UpdateAsync(dto);
        return result ? Ok() : BadRequest();
    }
}
