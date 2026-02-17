using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Doctor;
using Shared.DTOs.ViewModels;

namespace Presentation.API.Controllers;

[Authorize]
[Route("api/Doctor")]
[ApiController]
public class DoctorsController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    [Route("GetAll")]
    public async Task<IActionResult> GetList(int take, int skip)
    {
        var result = await service.Doctor.GetListAsync(take, skip);

        return (result is null || !result.ItemList.Any())
            ? NoContent()
            : Ok(new ViewResponseViewModel<DoctorViewModel>
            {
                IsSuccess = true,
                Message = "Data retrieved successfully.",
                Data = result
            });
    }

    [HttpGet]
    [Route("Details/{encryptedId}")]
    public async Task<IActionResult> Details(string encryptedId)
    {
        var doctor = await service.Doctor.GetDetailsAsync(encryptedId);
        return doctor is null ? NotFound() : Ok(doctor);
    }

    [HttpGet]
    [Route("GetById/{encryptedId}")]
    public async Task<IActionResult> GetById(string encryptedId)
    {
        var doctor = await service.Doctor.GetByIdAsync(encryptedId);
        return doctor is null ? NotFound() : Ok(doctor);
    }

    [HttpPost]
    [Route("Create")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Create(DoctorDto doctorDto)
    {
        return Ok(await service.Doctor.CreateAsync(doctorDto));
    }

    [HttpPut]
    [Route("Edit")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Edit(DoctorDto doctorDto)
    {
        return doctorDto.EncryptedId is null ? NotFound()
            : Ok(await service.Doctor.UpdateAsync(doctorDto));
    }

    [HttpPatch]
    [Route("ChangeActive/{encryptedId}")]
    public async Task<IActionResult> ChangeActive(string encryptedId)
    {
        return Ok(await service.Doctor.ChangeActiveAsync(encryptedId));
    }

    [HttpGet]
    [Route("Init")]
    public async Task<IActionResult> GetInitObject()
    {
        return Ok(await service.Doctor.GetInitObjectAsync());
    }
}
