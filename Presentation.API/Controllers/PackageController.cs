using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Account;
using Shared.DTOs.ViewModels;

namespace Presentation.API.Controllers;

[Authorize]
[Route("api/Package")]
[ApiController]
public class PackageController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    [Route("GetAll")]
    public async Task<IActionResult> GetList(int take, int skip)
    {
        var result = await service.Package.GetListAsync(take, skip);

        return (result is null || !result.ItemList.Any())
            ? NoContent()
            : Ok(new ViewResponseViewModel<PackageViewModel>
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
        var package = await service.Package.GetDetailsAsync(encryptedId);
        return package is null ? NotFound() : Ok(package);
    }

    [HttpGet]
    [Route("GetById/{encryptedId}")]
    public async Task<IActionResult> GetById(string encryptedId)
    {
        var package = await service.Package.GetByIdAsync(encryptedId);
        return package is null ? NotFound() : Ok(package);
    }

    [HttpPost]
    [Route("Create")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Create(PackageDto packageDto)
    {
        return Ok(await service.Package.CreateAsync(packageDto));
    }

    [HttpPut]
    [Route("Edit")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Edit(PackageDto packageDto)
    {
        return packageDto.EncryptedId is null ? NotFound()
            : Ok(await service.Package.UpdateAsync(packageDto));
    }

    [HttpPatch]
    [Route("ChangeActive/{encryptedId}")]
    public async Task<IActionResult> ChangeActive(string encryptedId)
    {
        return Ok(await service.Package.ChangeActiveAsync(encryptedId));
    }

    [HttpGet]
    [AllowAnonymous]
    [Route("AvailablePackages")]
    public async Task<IActionResult> GetAvailablePackages()
    {
        return Ok(await service.Package.GetAvailablePackagesAsync());
    }
}
