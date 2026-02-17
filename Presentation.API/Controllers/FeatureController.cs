using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Feature;
using Shared.DTOs.ViewModels;

namespace Presentation.API.Controllers;

[Authorize]
[Route("api/Feature")]
[ApiController]
public class FeatureController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    [Route("GetAll")]
    public async Task<IActionResult> GetList(int take, int skip)
    {
        var result = await service.Feature.GetListAsync(take, skip);

        return (result is null || !result.ItemList.Any())
            ? NoContent()
            : Ok(new ViewResponseViewModel<FeatureViewModel>
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
        var feature = await service.Feature.GetDetailsAsync(encryptedId);
        return feature is null ? NotFound() : Ok(feature);
    }

    [HttpGet]
    [Route("GetById/{encryptedId}")]
    public async Task<IActionResult> GetById(string encryptedId)
    {
        var feature = await service.Feature.GetByIdAsync(encryptedId);
        return feature is null ? NotFound() : Ok(feature);
    }

    [HttpPost]
    [Route("Create")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Create(FeatureDto featureDto)
    {
        return Ok(await service.Feature.CreateAsync(featureDto));
    }

    [HttpPut]
    [Route("Edit")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Edit(FeatureDto featureDto)
    {
        return featureDto.EncryptedId is null ? NotFound()
            : Ok(await service.Feature.UpdateAsync(featureDto));
    }

    [HttpPatch]
    [Route("ChangeActive/{encryptedId}")]
    public async Task<IActionResult> ChangeActive(string encryptedId)
    {
        return Ok(await service.Feature.ChangeActiveAsync(encryptedId));
    }
}
