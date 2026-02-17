using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.OnExamination;
using Shared.DTOs.ViewModels;

namespace Presentation.API.Controllers;

[Route("api/OnExamination")]
[ApiController]
[Authorize]
public class OnExaminationController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    [Route("GetAll")]
    public async Task<IActionResult> GetList(int take, int skip)
    {
        var result = await service.OnExamination.GetListAsync(take, skip);

        return (result is null || !result.ItemList.Any())
            ? NoContent()
            : Ok(new ViewResponseViewModel<OnExaminationViewModel>
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
        var result = await service.OnExamination.GetDetailsAsync(encryptedId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [Route("GetById/{encryptedId}")]
    public async Task<IActionResult> GetById(string encryptedId)
    {
        var result = await service.OnExamination.GetByIdAsync(encryptedId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    [Route("Create")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Create(OnExaminationDto dto)
    {
        return Ok(await service.OnExamination.CreateAsync(dto));
    }

    [HttpPut]
    [Route("Edit")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Edit(OnExaminationDto dto)
    {
        return dto.EncryptedId is null ? NotFound()
            : Ok(await service.OnExamination.UpdateAsync(dto));
    }

    [HttpPatch]
    [Route("ChangeActive/{encryptedId}")]
    public async Task<IActionResult> ChangeActive(string encryptedId)
    {
        return Ok(await service.OnExamination.ChangeActiveAsync(encryptedId));
    }

    [HttpGet]
    [Route("CurrentDoctor")]
    public async Task<IActionResult> GetActiveForCurrentDoctor()
    {
        return Ok(await service.OnExamination.GetActiveForCurrentUserAsync());
    }
}
