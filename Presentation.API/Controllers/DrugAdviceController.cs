using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.ViewModels;

namespace Presentation.API.Controllers;

[Route("api/DrugAdvice")]
[ApiController]
[Authorize]
public class DrugAdviceController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    [Route("GetAll")]
    public async Task<IActionResult> GetList(int take, int skip)
    {
        var result = await service.DrugAdvice.GetListAsync(take, skip);

        return (result is null || !result.ItemList.Any())
            ? NoContent()
            : Ok(new ViewResponseViewModel<DrugAdviceViewModel>
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
        var drugAdvice = await service.DrugAdvice.GetDetailsAsync(encryptedId);
        return drugAdvice is null ? NotFound() : Ok(drugAdvice);
    }

    [HttpGet]
    [Route("GetById/{encryptedId}")]
    public async Task<IActionResult> GetById(string encryptedId)
    {
        var drugAdvice = await service.DrugAdvice.GetByIdAsync(encryptedId);
        return drugAdvice is null ? NotFound() : Ok(drugAdvice);
    }

    [HttpGet]
    [Route("ActiveList")]
    public async Task<IActionResult> GetActiveList()
    {
        return Ok(await service.DrugAdvice.GetActiveListAsync());
    }

    [HttpGet]
    [Route("Doctor/{encryptedDoctorId}")]
    public async Task<IActionResult> GetActiveByDoctorId(string encryptedDoctorId)
    {
        return Ok(await service.DrugAdvice.GetActiveByDoctorIdAsync(encryptedDoctorId));
    }

    [HttpGet]
    [Route("CurrentDoctor")]
    public async Task<IActionResult> GetActiveForCurrentDoctor()
    {
        return Ok(await service.DrugAdvice.GetActiveForCurrentUserAsync());
    }

    [HttpPost]
    [Route("Create")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Create(DrugAdviceDto dto)
    {
        return Ok(await service.DrugAdvice.CreateAsync(dto));
    }

    [HttpPut]
    [Route("Edit")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Edit(DrugAdviceDto dto)
    {
        return dto.EncryptedId is null ? NotFound()
            : Ok(await service.DrugAdvice.UpdateAsync(dto));
    }

    [HttpPatch]
    [Route("ChangeActive/{encryptedId}")]
    public async Task<IActionResult> ChangeActive(string encryptedId)
    {
        return Ok(await service.DrugAdvice.ChangeActiveAsync(encryptedId));
    }
}
