using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.API.ActionFilters;
using Services.Contracts.Base;
using Shared.DTOs.BaseDTOs;

namespace Presentation.API.Controllers;

[Authorize]
[Route("api/Menu")]
[ApiController]
public class MenuController() : ControllerBase
{
    //[HttpGet]
    //[Route("GetAll")]
    ////[RequirePermission("menu_view")]
    //public async Task<IActionResult> GetList(int take, int skip)
    //{
    //    var result = await service.MenuMaster.GetListAsync(take, skip);

    //    return (result is null || !result.ItemList.Any())
    //        ? NoContent()
    //        : Ok(new ViewResponseViewModel<MenuMasterViewModel>
    //        {
    //            IsSuccess = true,
    //            Message = "Menus retrieved successfully.",
    //            Data = result
    //        });
    //}

    //[HttpGet]
    //[Route("Details/{encryptedId}")]
    ////[RequirePermission("menu_view")]
    //public async Task<IActionResult> Details(string encryptedId)
    //{
    //    var menu = await service.MenuMaster.GetDetailsAsync(encryptedId);
    //    return menu is null ? NotFound() : Ok(menu);
    //}

    //[HttpGet]
    //[Route("GetById/{encryptedId}")]
    ////[RequirePermission("menu_view")]
    //public async Task<IActionResult> GetById(string encryptedId)
    //{
    //    var menu = await service.MenuMaster.GetByIdAsync(encryptedId);
    //    return menu is null ? NotFound() : Ok(menu);
    //}

    //[HttpPost]
    //[Route("Create")]
    ////[RequirePermission("menu_create")]
    //[ServiceFilter(typeof(ModelStateValidationFilter))]
    //public async Task<IActionResult> Create(MenuMasterDto menuMasterDto)
    //{
    //    return Ok(await service.MenuMaster.CreateAsync(menuMasterDto));
    //}

    //[HttpPut]
    //[Route("Edit")]
    ////[RequirePermission("menu_edit")]
    //[ServiceFilter(typeof(ModelStateValidationFilter))]
    //public async Task<IActionResult> Edit(MenuMasterDto menuMasterDto)
    //{
    //    return menuMasterDto.EncryptedId is null ? NotFound()
    //        : Ok(await service.MenuMaster.UpdateAsync(menuMasterDto));
    //}

    //[HttpGet]
    //[Route("Init/{encryptedId}")]
    ////[RequirePermission("menu_view")]
    //public async Task<IActionResult> GetInitObject(string encryptedId)
    //{
    //    return Ok(await service.MenuMaster.GetInitObjectAsync(encryptedId));
    //}

    //[HttpGet]
    //[Route("GetUserMenus")]
    //public async Task<IActionResult> GetUserMenus()
    //{
    //    return Ok(await service.MenuMaster.GetUserMenusAsync());
    //}

    //#region Menu Permission Endpoints

    ///// <summary>
    ///// Get initialization data for menu permission configuration
    ///// Returns available actions and currently granted permissions for a specific menu detail
    ///// </summary>
    //[HttpGet]
    //[Route("Permission/Init/{encryptedMenuDetailId}")]
    ////[RequirePermission("menu_edit")]
    //public async Task<IActionResult> GetMenuPermissionInit(string encryptedMenuDetailId)
    //{
    //    var result = await service.MenuMaster.GetMenuPermissionInitAsync(encryptedMenuDetailId);
    //    return Ok(result);
    //}

    ///// <summary>
    ///// Get all permissions for a specific menu detail by ID
    ///// </summary>
    //[HttpGet]
    //[Route("Permission/{menuDetailId:int}")]
    ////[RequirePermission("menu_view")]
    //public async Task<IActionResult> GetMenuPermissions(int menuDetailId)
    //{
    //    var result = await service.MenuMaster.GetMenuPermissionsAsync(menuDetailId);
    //    return Ok(result);
    //}

    ///// <summary>
    ///// Get permission keys for a specific menu detail
    ///// </summary>
    //[HttpGet]
    //[Route("Permission/{encryptedMenuDetailId}/Keys")]
    ////[RequirePermission("menu_view")]
    //public async Task<IActionResult> GetMenuPermissionKeys(string encryptedMenuDetailId)
    //{
    //    var result = await service.MenuMaster.GetMenuPermissionKeysAsync(encryptedMenuDetailId);
    //    return Ok(result);
    //}

    ///// <summary>
    ///// Save menu permissions for a specific menu detail
    ///// Allows configuring read/edit/delete/export permissions through check/uncheck options
    ///// </summary>
    //[HttpPost]
    //[Route("Permission/Save")]
    ////[RequirePermission("menu_edit")]
    //[ServiceFilter(typeof(ModelStateValidationFilter))]
    //public async Task<IActionResult> SaveMenuPermissions(SaveMenuPermissionsDto dto)
    //{
    //    var result = await service.MenuMaster.SaveMenuPermissionsAsync(dto);
    //    return result 
    //        ? Ok(new { success = true, message = "Menu permissions saved successfully." })
    //        : BadRequest(new { success = false, message = "Failed to save menu permissions." });
    //}

    //#endregion
}