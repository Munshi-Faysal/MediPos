using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.ViewModels;

namespace Presentation.API.Controllers;

[Route("api/DrugDose")]
[ApiController]
[Authorize]
public class DrugDoseController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    [Route("GetAll")]
    public async Task<IActionResult> GetList(int take, int skip)
    {
        var result = await service.DrugDose.GetListAsync(take, skip);

        return (result is null || !result.ItemList.Any())
            ? NoContent()
            : Ok(new ViewResponseViewModel<DrugDoseViewModel>
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
        var result = await service.DrugDose.GetDetailsAsync(encryptedId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Route("GetById/{encryptedId}")]
    public async Task<IActionResult> GetById(string encryptedId)
    {
        var result = await service.DrugDose.GetByIdAsync(encryptedId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Route("Doctor/{encryptedDoctorId}")]
    public async Task<IActionResult> GetActiveByDoctorId(string encryptedDoctorId)
    {
        return Ok(await service.DrugDose.GetActiveByDoctorIdAsync(encryptedDoctorId));
    }

    [HttpGet]
    [Route("CurrentDoctor")]
    public async Task<IActionResult> GetActiveForCurrentDoctor()
    {
        return Ok(await service.DrugDose.GetActiveForCurrentUserAsync());
    }

    [HttpPost]
    [Route("Create")]
    [Authorize(Roles = "system-admin,SystemAdmin,System-Admin,SuperAdmin,super-admin,superadmin")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Create(DrugDoseDto dto)
    {
        return Ok(await service.DrugDose.CreateAsync(dto));
    }

    [HttpPut]
    [Route("Edit")]
    [Authorize(Roles = "system-admin,SystemAdmin,System-Admin,SuperAdmin,super-admin,superadmin")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Edit(DrugDoseDto dto)
    {
        return dto.EncryptedId is null ? NotFound()
            : Ok(await service.DrugDose.UpdateAsync(dto));
    }

    [HttpPatch]
    [Route("ChangeActive/{encryptedId}")]
    [Authorize(Roles = "system-admin,SystemAdmin,System-Admin,SuperAdmin,super-admin,superadmin")]
    public async Task<IActionResult> ChangeActive(string encryptedId)
    {
        return Ok(await service.DrugDose.ChangeActiveAsync(encryptedId));
    }
}
