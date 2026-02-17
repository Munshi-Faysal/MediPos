using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Role;

namespace Presentation.API.Controllers;

[ApiController]
[Route("api/Role")]
[Authorize] // Require authentication by default
public class RoleController(IServiceManager service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAllRoles()
    {
        return Ok(await service.Role.GetAllRolesAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoleById(int id)
    {
        var role = await service.Role.GetRoleByIdAsync(id);
        return role != null ? Ok(role) : NotFound();
    }

    [HttpPost]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> CreateRole(RoleCreateDto roleCreateDto)
    {
        var result = await service.Role.CreateRoleAsync(roleCreateDto);
        return result ? Ok(true) : BadRequest("Failed to create role.");
    }

    [HttpPatch]
    [ServiceFilter(typeof(ModelStateValidationFilter))]
    public async Task<IActionResult> UpdateRole(RoleUpdateDto roleUpdateDto)
    {
        var result = await service.Role.UpdateRoleAsync(roleUpdateDto);
        return result ? Ok(true) : BadRequest("Failed to update role.");
    }

    [HttpPatch("ChangeActive/{id}")]
    public async Task<IActionResult> ChangeActive(int id)
    {
        var result = await service.Role.ChangeActiveAsync(id);
        return result ? Ok(true) : BadRequest("Failed to change role status.");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRole(int id)
    {
        var result = await service.Role.DeleteRoleAsync(id);
        return result ? Ok(true) : BadRequest("Failed to delete role.");
    }
}
