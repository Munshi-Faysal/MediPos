using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.ViewModels;

namespace Presentation.API.Controllers;

[Route("api/DrugType")]
[ApiController]
[Authorize]
public class DrugTypeController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    [Route("GetAll")]
    public async Task<IActionResult> GetList(int take, int skip)
    {
        var result = await service.DrugType.GetListAsync(take, skip);

        return (result is null || !result.ItemList.Any())
            ? NoContent()
            : Ok(new ViewResponseViewModel<DrugTypeViewModel>
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
        var result = await service.DrugType.GetDetailsAsync(encryptedId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Route("GetById/{encryptedId}")]
    public async Task<IActionResult> GetById(string encryptedId)
    {
        var result = await service.DrugType.GetByIdAsync(encryptedId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Route("Doctor/{encryptedDoctorId}")]
    public async Task<IActionResult> GetActiveByDoctorId(string encryptedDoctorId)
    {
        return Ok(await service.DrugType.GetActiveByDoctorIdAsync(encryptedDoctorId));
    }

    [HttpGet]
    [Route("CurrentDoctor")]
    public async Task<IActionResult> GetActiveForCurrentDoctor()
    {
        return Ok(await service.DrugType.GetActiveForCurrentUserAsync());
    }

    [HttpPost]
    [Route("Create")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Create(DrugTypeDto dto)
    {
        return Ok(await service.DrugType.CreateAsync(dto));
    }

    [HttpPut]
    [Route("Edit")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Edit(DrugTypeDto dto)
    {
        return dto.EncryptedId is null ? NotFound()
            : Ok(await service.DrugType.UpdateAsync(dto));
    }

    [HttpPatch]
    [Route("ChangeActive/{encryptedId}")]
    public async Task<IActionResult> ChangeActive(string encryptedId)
    {
        return Ok(await service.DrugType.ChangeActiveAsync(encryptedId));
    }

    [HttpGet]
    [Route("Init")]
    public async Task<IActionResult> GetInitObject()
    {
        return Ok(await service.DrugType.GetInitObjectAsync());
    }
}
