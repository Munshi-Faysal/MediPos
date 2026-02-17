using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.DrugDoseTemplate;
using Shared.DTOs.ViewModels;

namespace Presentation.API.Controllers;

[Route("api/DrugDoseTemplate")]
[ApiController]
[Authorize]
public class DrugDoseTemplateController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    [Route("GetAll")]
    public async Task<IActionResult> GetList(int take, int skip)
    {
        var result = await service.DrugDoseTemplate.GetListAsync(take, skip);

        return (result is null || !result.ItemList.Any())
            ? NoContent()
            : Ok(new ViewResponseViewModel<DrugDoseTemplateViewModel>
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
        var result = await service.DrugDoseTemplate.GetDetailsAsync(encryptedId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Route("GetById/{encryptedId}")]
    public async Task<IActionResult> GetById(string encryptedId)
    {
        var result = await service.DrugDoseTemplate.GetByIdAsync(encryptedId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    [Route("Create")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Create(DrugDoseTemplateDto dto)
    {
        return Ok(await service.DrugDoseTemplate.CreateAsync(dto));
    }

    [HttpPut]
    [Route("Edit")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Edit(DrugDoseTemplateDto dto)
    {
        return dto.EncryptedId is null ? NotFound()
            : Ok(await service.DrugDoseTemplate.UpdateAsync(dto));
    }

    [HttpPatch]
    [Route("ChangeActive/{encryptedId}")]
    public async Task<IActionResult> ChangeActive(string encryptedId)
    {
        return Ok(await service.DrugDoseTemplate.ChangeActiveAsync(encryptedId));
    }

    [HttpGet]
    [Route("Doctor/{encryptedDoctorId}")]
    public async Task<IActionResult> GetActiveByDoctorId(string encryptedDoctorId)
    {
        return Ok(await service.DrugDoseTemplate.GetActiveByDoctorIdAsync(encryptedDoctorId));
    }

    [HttpGet]
    [Route("CurrentDoctor")]
    public async Task<IActionResult> GetActiveForCurrentDoctor()
    {
        return Ok(await service.DrugDoseTemplate.GetActiveForCurrentUserAsync());
    }
}
