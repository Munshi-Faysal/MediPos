using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Mail;
using Shared.DTOs.ViewModels;

namespace Presentation.API.Controllers;

[Authorize]
[Route("api/EmailFormat")]
[ApiController]
public class EmailFormatController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    [Route("GetAll")]
    public async Task<IActionResult> GetList(int take, int skip)
    {
        var result = await service.EmailFormat.GetListAsync(take, skip);

        return (result is null || !result.ItemList.Any())
            ? NoContent()
            : Ok(new ViewResponseViewModel<EmailFormatViewModel>
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
        var emailFormat = await service.EmailFormat.GetDetailsAsync(encryptedId);
        return emailFormat is null ? NotFound() : Ok(emailFormat);
    }

    [HttpGet]
    [Route("GetById/{encryptedId}")]
    public async Task<IActionResult> GetById(string encryptedId)
    {
        var emailFormat = await service.EmailFormat.GetByIdAsync(encryptedId);
        return emailFormat is null ? NotFound() : Ok(emailFormat);
    }

    [HttpPost]
    [Route("Create")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Create(EmailFormatDto emailFormatDto)
    {
        return Ok(await service.EmailFormat.CreateAsync(emailFormatDto));
    }

    [HttpPut]
    [Route("Edit")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Edit(EmailFormatDto emailFormatDto)
    {
        return emailFormatDto.EncryptedId is null ? NotFound()
            : Ok(await service.EmailFormat.UpdateAsync(emailFormatDto));
    }
}