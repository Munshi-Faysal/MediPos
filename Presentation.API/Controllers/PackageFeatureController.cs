using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.PackageFeature;
using Shared.DTOs.ViewModels;

namespace Presentation.API.Controllers;

[Authorize]
[Route("api/PackageFeature")]
[ApiController]
public class PackageFeatureController(IServiceManager service, Shared.Cryptography.EncryptionHelper encryptionHelper) : ControllerBase
{
    [HttpGet]
    [Route("GetAll")]
    public async Task<IActionResult> GetList(int take, int skip)
    {
        var result = await service.PackageFeature.GetListAsync(take, skip);

        if (result?.ItemList != null)
        {
            foreach (var item in result.ItemList)
            {
                item.PackageEncryptedId = encryptionHelper.Encrypt(item.PackageId.ToString());
                item.FeatureEncryptedId = encryptionHelper.Encrypt(item.FeatureId.ToString());
            }
        }

        return (result is null || !result.ItemList.Any())
            ? NoContent()
            : Ok(new ViewResponseViewModel<PackageFeatureViewModel>
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
        var packageFeature = await service.PackageFeature.GetDetailsAsync(encryptedId);
        return packageFeature is null ? NotFound() : Ok(packageFeature);
    }

    [HttpGet]
    [Route("GetById/{encryptedId}")]
    public async Task<IActionResult> GetById(string encryptedId)
    {
        var packageFeature = await service.PackageFeature.GetByIdAsync(encryptedId);
        return packageFeature is null ? NotFound() : Ok(packageFeature);
    }

    [HttpPost]
    [Route("Create")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Create(PackageFeatureDto packageFeatureDto)
    {
        if (!string.IsNullOrWhiteSpace(packageFeatureDto.EncryptedPackageId))
            packageFeatureDto.PackageId = encryptionHelper.Decrypt(packageFeatureDto.EncryptedPackageId);
            
        if (!string.IsNullOrWhiteSpace(packageFeatureDto.EncryptedFeatureId))
            packageFeatureDto.FeatureId = encryptionHelper.Decrypt(packageFeatureDto.EncryptedFeatureId);

        return Ok(await service.PackageFeature.CreateAsync(packageFeatureDto));
    }

    [HttpPut]
    [Route("Edit")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Edit(PackageFeatureDto packageFeatureDto)
    {
        return packageFeatureDto.EncryptedId is null ? NotFound()
            : Ok(await service.PackageFeature.UpdateAsync(packageFeatureDto));
    }
}
