using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.User;

namespace Presentation.API.Controllers;

[Route("api/User")]
[ApiController]
public class UserController(IServiceManager service) : ControllerBase
{
    //[Authorize]
    //[HttpGet]
    //[Route("GetUserById/{userId:int}")]
    //public async Task<IActionResult> GetById(int userId)
    //{
    //    var requesterViewModel = await service.User.FindRequesterByRequesterIdAsync(userId);
    //    return requesterViewModel is not null ? Ok(requesterViewModel) : NotFound();
    //}

    [Authorize]
    [HttpGet]
    [Route("GetCurrentUser")]
    public async Task<IActionResult> GetCurrentUser()
    {
        return Ok(await service.User.GetUserAsync(User));
    }

    [Authorize]
    [HttpPost("AssignRole")]
    public async Task<IActionResult> AssignRole([FromBody] AssignRoleDto assignRoleDto)
    {
        var result = await service.User.AssignRoleAsync(assignRoleDto.UserId, assignRoleDto.RoleName);
        return result ? Ok(true) : BadRequest("Failed to assign role.");
    }

    [Authorize]
    [HttpGet("Roles/{userId}")]
    public async Task<IActionResult> GetUserRoles(int userId)
    {
        return Ok(await service.User.GetUserRolesAsync(userId));
    }

    [Authorize]
    [HttpDelete("RemoveRole")]
    public async Task<IActionResult> RemoveRole([FromBody] AssignRoleDto assignRoleDto)
    {
        var result = await service.User.RemoveRoleAsync(assignRoleDto.UserId, assignRoleDto.RoleName);
        return result ? Ok(true) : BadRequest("Failed to remove role.");
    }
}