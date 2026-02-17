using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.ViewModels;

namespace Presentation.API.Controllers;

[Route("api/DrugCompany")]
[ApiController]
[Authorize]
public class DrugCompanyController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    [Route("GetAll")]
    public async Task<IActionResult> GetList(int take, int skip)
    {
        var result = await service.DrugCompany.GetListAsync(take, skip);

        return (result is null || !result.ItemList.Any())
            ? NoContent()
            : Ok(new ViewResponseViewModel<DrugCompanyViewModel>
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
        var result = await service.DrugCompany.GetDetailsAsync(encryptedId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Route("GetById/{encryptedId}")]
    public async Task<IActionResult> GetById(string encryptedId)
    {
        var result = await service.DrugCompany.GetByIdAsync(encryptedId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Route("ActiveList")]
    public async Task<IActionResult> GetActiveList()
    {
        return Ok(await service.DrugCompany.GetActiveListAsync());
    }

    [HttpPost]
    [Route("Create")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Create(DrugCompanyDto dto)
    {
        return Ok(await service.DrugCompany.CreateAsync(dto));
    }

    [HttpPut]
    [Route("Edit")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Edit(DrugCompanyDto dto)
    {
        return dto.EncryptedId is null ? NotFound()
            : Ok(await service.DrugCompany.UpdateAsync(dto));
    }

    [HttpPatch]
    [Route("ChangeActive/{encryptedId}")]
    public async Task<IActionResult> ChangeActive(string encryptedId)
    {
        return Ok(await service.DrugCompany.ChangeActiveAsync(encryptedId));
    }
}
