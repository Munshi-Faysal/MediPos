using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Branch;
using Shared.DTOs.ViewModels;

namespace Presentation.API.Controllers;

[Authorize]
[Route("api/Branch")]
[ApiController]
public class BranchController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    [Route("GetAll")]
    public async Task<IActionResult> GetList(int take, int skip)
    {
        var result = await service.Branch.GetListAsync(take, skip);

        return (result is null || !result.ItemList.Any())
            ? NoContent()
            : Ok(new ViewResponseViewModel<BranchViewModel>
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
        var branch = await service.Branch.GetDetailsAsync(encryptedId);
        return branch is null ? NotFound() : Ok(branch);
    }

    [HttpGet]
    [Route("GetById/{encryptedId}")]
    public async Task<IActionResult> GetById(string encryptedId)
    {
        var branch = await service.Branch.GetByIdAsync(encryptedId);
        return branch is null ? NotFound() : Ok(branch);
    }

    [HttpGet]
    [Route("{encryptedId}")]
    public async Task<IActionResult> GetBranchById(string encryptedId)
    {
        var branch = await service.Branch.GetByIdAsync(encryptedId);
        return branch is null ? NotFound() : Ok(branch);
    }

    [HttpPost]
    [Route("Create")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Create(BranchDto branchDto)
    {
        return Ok(await service.Branch.CreateAsync(branchDto));
    }

    [HttpPut]
    [Route("Edit")]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> Edit(BranchDto branchDto)
    {
        return branchDto.EncryptedId is null ? NotFound()
            : Ok(await service.Branch.UpdateAsync(branchDto));
    }

    [HttpPatch]
    [Route("ChangeActive/{encryptedId}")]
    public async Task<IActionResult> ChangeActive(string encryptedId)
    {
        return Ok(await service.Branch.ChangeActiveAsync(encryptedId));
    }

    [HttpDelete]
    [Route("{encryptedId}")]
    public async Task<IActionResult> Delete(string encryptedId)
    {
        return Ok(await service.Branch.ChangeActiveAsync(encryptedId));
    }

    [HttpGet]
    [Route("active")]
    public async Task<IActionResult> GetActiveBranches()
    {
        return Ok(await service.Branch.GetActiveBranchesAsync());
    }

    [HttpGet]
    [Route("division/{encryptedDivisionId}")]
    public async Task<IActionResult> GetBranchesByDivision(string encryptedDivisionId)
    {
        return Ok(await service.Branch.GetBranchesByDivisionIdAsync(encryptedDivisionId));
    }

    [HttpPost]
    [Route("{encryptedId}/activate")]
    public async Task<IActionResult> Activate(string encryptedId)
    {
        return Ok(await service.Branch.ChangeActiveAsync(encryptedId));
    }

    [HttpPost]
    [Route("{encryptedId}/deactivate")]
    public async Task<IActionResult> Deactivate(string encryptedId)
    {
        return Ok(await service.Branch.ChangeActiveAsync(encryptedId));
    }
}
