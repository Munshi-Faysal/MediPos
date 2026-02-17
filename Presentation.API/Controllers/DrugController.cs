using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.ViewModels;

namespace Presentation.API.Controllers;

[Authorize]
[Route("api/Drug")]
[ApiController]
public class DrugController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    [Route("GetAll")]
    public async Task<IActionResult> GetList(int take, int skip)
    {
        var result = await service.DrugMaster.GetListAsync(take, skip);
        return (result is null || !result.ItemList.Any())
            ? NoContent()
            : Ok(new ViewResponseViewModel<DrugMasterViewModel>
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
        var result = await service.DrugMaster.GetDetailsAsync(encryptedId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Route("GetById/{encryptedId}")]
    public async Task<IActionResult> GetById(string encryptedId)
    {
        var result = await service.DrugMaster.GetByIdAsync(encryptedId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Route("GetWithDetails/{encryptedId}")]
    public async Task<IActionResult> GetWithDetails(string encryptedId)
    {
        var result = await service.DrugMaster.GetWithDetailsAsync(encryptedId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Route("ActiveList")]
    public async Task<IActionResult> GetActiveList()
    {
        return Ok(await service.DrugMaster.GetActiveListAsync());
    }

    [HttpPost]
    [Route("Create")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Create(DrugMasterDto dto)
    {
        return Ok(await service.DrugMaster.CreateAsync(dto));
    }

    [HttpPut]
    [Route("Edit")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Edit(DrugMasterDto dto)
    {
        return dto.EncryptedId is null ? NotFound()
            : Ok(await service.DrugMaster.UpdateAsync(dto));
    }

    [HttpPatch]
    [Route("ChangeActive/{encryptedId}")]
    public async Task<IActionResult> ChangeActive(string encryptedId)
    {
        return Ok(await service.DrugMaster.ChangeActiveAsync(encryptedId));
    }

    [HttpGet]
    [Route("Init")]
    public async Task<IActionResult> GetInitObject()
    {
        return Ok(await service.DrugMaster.GetInitObjectAsync());
    }

    [HttpGet]
    [Route("Search")]
    public async Task<IActionResult> Search(string term, int take = 50)
    {
        return Ok(await service.DrugMaster.SearchAsync(term, take));
    }
}
