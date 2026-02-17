using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.ViewModels;

namespace Presentation.API.Controllers;

[Route("api/DrugDuration")]
[ApiController]
[Authorize]
public class DrugDurationController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    [Route("GetAll")]
    public async Task<IActionResult> GetList(int take, int skip)
    {
        var result = await service.DrugDuration.GetListAsync(take, skip);

        return (result is null || !result.ItemList.Any())
            ? NoContent()
            : Ok(new ViewResponseViewModel<DrugDurationViewModel>
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
        var result = await service.DrugDuration.GetDetailsAsync(encryptedId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Route("GetById/{encryptedId}")]
    public async Task<IActionResult> GetById(string encryptedId)
    {
        var result = await service.DrugDuration.GetByIdAsync(encryptedId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Route("ActiveList")]
    public async Task<IActionResult> GetActiveList()
    {
        return Ok(await service.DrugDuration.GetActiveListAsync());
    }

    [HttpGet]
    [Route("Doctor/{encryptedDoctorId}")]
    public async Task<IActionResult> GetActiveByDoctorId(string encryptedDoctorId)
    {
        return Ok(await service.DrugDuration.GetActiveByDoctorIdAsync(encryptedDoctorId));
    }

    [HttpGet]
    [Route("CurrentDoctor")]
    public async Task<IActionResult> GetActiveForCurrentDoctor()
    {
        return Ok(await service.DrugDuration.GetActiveForCurrentUserAsync());
    }

    [HttpPost]
    [Route("Create")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Create(DrugDurationDto dto)
    {
        return Ok(await service.DrugDuration.CreateAsync(dto));
    }

    [HttpPut]
    [Route("Edit")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Edit(DrugDurationDto dto)
    {
        return dto.EncryptedId is null ? NotFound()
            : Ok(await service.DrugDuration.UpdateAsync(dto));
    }

    [HttpPatch]
    [Route("ChangeActive/{encryptedId}")]
    public async Task<IActionResult> ChangeActive(string encryptedId)
    {
        return Ok(await service.DrugDuration.ChangeActiveAsync(encryptedId));
    }
}
