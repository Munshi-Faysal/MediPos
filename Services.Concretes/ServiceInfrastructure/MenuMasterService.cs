using AutoMapper;
using Domain.Helpers;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs;
using Shared.DTOs.ViewModels;
using Shared.DTOs.ViewModels.WorkflowEngine;
using System.Transactions;

namespace Services.Concretes.ServiceInfrastructure.WorkflowEngine;

internal sealed class MenuMasterService(UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor) : BaseService(userManager, httpContextAccessor), IMenuMasterService
{
    //public async Task<PaginatedListViewModel<MenuMasterViewModel>?> GetListAsync(int take, int skip)
    //{
    //    var (listData, totalCount) = await repository.MenuMaster.GetListAsync(take, skip);
    //    var dataList = mapper.Map<List<MenuMasterViewModel>>(listData);

    //    return new PaginatedListViewModel<MenuMasterViewModel>(take)
    //    {
    //        ItemList = dataList,
    //        TotalRecords = totalCount
    //    };
    //}

    //public async Task<MenuMasterViewModel?> GetDetailsAsync(string encryptedId)
    //{
    //    var menu = await repository.MenuMaster.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
    //    return mapper.Map<MenuMasterViewModel>(menu);
    //}

    //public async Task<MenuMasterDto?> GetByIdAsync(string encryptedId)
    //{
    //    var menu = await repository.MenuMaster.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
    //    if (menu is not null)
    //        menu.EncryptedId = encryptedId;
    //    return mapper.Map<MenuMasterDto>(menu);
    //}

    //public async Task<bool> CreateAsync(MenuMasterDto menuMasterDto)
    //{
    //    var menuMaster = mapper.Map<WfMenuMaster>(menuMasterDto);
    //    CreateAutoFields(menuMaster);

    //    using var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

    //    menuMaster = await repository.MenuMaster.GetInsertedObjAsync(menuMaster);
    //    if (menuMaster is null)
    //        return false;

    //    if (menuMasterDto.BranchMappingIdList.Any())
    //    {
    //        var now = DateTime.Now;
    //        var menuDetails = menuMasterDto.BranchMappingIdList.Select(id => new WfMenuDetail
    //        {
    //            MenuMasterId = menuMaster.Id,
    //            BranchMappingId = id,
    //            CreatedBy = CurrentUser!.Id,
    //            UpdatedBy = CurrentUser.Id,
    //            CreatedDate = now,
    //            UpdatedDate = now
    //        });

    //        var insertSuccess = await repository.MenuDetail.InsertRangeAsync(menuDetails);
    //        if (!insertSuccess)
    //            return false;
    //    }
    //    transactionScope.Complete();
    //    return true;
    //}

    //public async Task<bool> UpdateAsync(MenuMasterDto menuMasterDto)
    //{
    //    var existingMenuMaster = await repository.MenuMaster.FindByIdAsync(encryptionHelper.Decrypt(menuMasterDto.EncryptedId ?? string.Empty));
    //    if (existingMenuMaster is null)
    //        return false;

    //    var updatedMenuMaster = mapper.Map<WfMenuMaster>(menuMasterDto);
    //    updatedMenuMaster.Id = existingMenuMaster.Id;
    //    updatedMenuMaster.CreatedDate = existingMenuMaster.CreatedDate;
    //    updatedMenuMaster.CreatedBy = existingMenuMaster.CreatedBy;

    //    UpdateAutoFields(updatedMenuMaster);

    //    using var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

    //    var updateSuccess = await repository.MenuMaster.UpdateAsync(updatedMenuMaster);
    //    if (!updateSuccess)
    //        return false;

    //    var existingMenuDetails = await repository.MenuDetail.GetAllByMenuMasterAsync(updatedMenuMaster.Id);

    //    if (existingMenuDetails.Any())
    //    {
    //        var deleteSuccess = await repository.MenuDetail.DeleteRangeAsync(existingMenuDetails);
    //        if (!deleteSuccess)
    //            return false;
    //    }

    //    if (menuMasterDto.BranchMappingIdList.Any())
    //    {
    //        var menuDetails = menuMasterDto.BranchMappingIdList.Select(id => new WfMenuDetail
    //        {
    //            MenuMasterId = existingMenuMaster.Id,
    //            BranchMappingId = id,
    //            CreatedBy = CurrentUser!.Id,
    //            UpdatedBy = CurrentUser.Id,
    //            CreatedDate = DateTime.Now,
    //            UpdatedDate = DateTime.Now
    //        });

    //        var insertSuccess = await repository.MenuDetail.InsertRangeAsync(menuDetails);
    //        if (!insertSuccess)
    //            return false;
    //    }
    //    transactionScope.Complete();
    //    return true;
    //}

    //public async Task<MenuInitDto> GetInitObjectAsync(string encryptedMenuId)
    //{
    //    var menuId = encryptedMenuId.Equals("NA") ? 0 : encryptionHelper.Decrypt(encryptedMenuId);
    //    var branchMappingList = await repository.MenuDetail.GetListForMenuAsync(menuId);
    //    var allActions = await repository.MenuAction.GetAllActiveMenuActionsAsync();

    //    // Map to view models with permissions
    //    var branchMappingViewModels = branchMappingList.Select(d => new MenuDetailViewModel
    //    {
    //        EncryptedMenuDetailId = d.Id > 0 && d.MenuMasterId == menuId ? encryptionHelper.Encrypt(d.Id.ToString()) : null,
    //        MenuDetailId = d.Id,
    //        BranchMappingId = d.BranchMappingId,
    //        BranchName = d.BranchMapping?.Branch?.BranchName,
    //        RoleName = d.BranchMapping?.ApproverMapping?.Role?.Name,
    //        DivisionName = d.BranchMapping?.ApproverMapping?.DepartmentMapping?.Division?.DivisionName,
    //        DepartmentName = d.BranchMapping?.ApproverMapping?.DepartmentMapping?.Department?.DepartmentName,
    //        IsAuthorized = d.IsAuthorized,
    //        Permissions = d.WfMenuPermissions
    //            .Where(p => p.IsGranted)
    //            .Select(p => new MenuDetailPermissionItem
    //            {
    //                ActionId = p.MenuActionId,
    //                ActionName = p.MenuAction?.ActionName ?? string.Empty,
    //                ActionIcon = p.MenuAction?.Icon ?? string.Empty,
    //                ActionColor = p.MenuAction?.ActionColor ?? string.Empty,
    //                PermissionKey = p.PermissionKey,
    //                IsGranted = p.IsGranted
    //            }).ToList()
    //    }).ToList();

    //    return new MenuInitDto
    //    {
    //        ParentMenuList = await repository.MenuMaster.GetDropdownItemsAsync(),
    //        BranchMappingList = branchMappingViewModels,
    //        AvailableActions = allActions.Select(a => new MenuActionItem
    //        {
    //            Id = a.Id,
    //            Name = a.ActionName,
    //            Icon = a.Icon ?? string.Empty,
    //            Color = a.ActionColor ?? string.Empty
    //        }).ToList()
    //    };
    //}

    //public async Task<IEnumerable<SidebarMenuViewModel>> GetUserMenusAsync()
    //{
    //    if (CurrentUser is null)
    //        return [];

    //    var userMenus = await repository.MenuMaster.GetUserMenusAsync(CurrentUser.Id);
    //    return mapper.Map<IEnumerable<SidebarMenuViewModel>>(userMenus);
    //}

    //#region Menu Permission Methods

    //public async Task<MenuPermissionInitDto> GetMenuPermissionInitAsync(string encryptedMenuDetailId)
    //{
    //    var menuDetailId = encryptionHelper.Decrypt(encryptedMenuDetailId);
    //    var menuDetail = await repository.MenuDetail.FindByIdAsync(menuDetailId);

    //    if (menuDetail is null)
    //        return new MenuPermissionInitDto();

    //    var allActions = await repository.MenuAction.GetAllActiveMenuActionsAsync();
    //    var existingPermissions = await repository.MenuPermission.GetByMenuDetailIdAsync(menuDetailId);

    //    var menuMaster = await repository.MenuMaster.FindByIdAsync(menuDetail.MenuMasterId);
    //    var branchMapping = await repository.BranchMapping.FindByIdAsync(menuDetail.BranchMappingId);

    //    return new MenuPermissionInitDto
    //    {
    //        MenuName = menuMaster?.MenuName ?? string.Empty,
    //        BranchName = branchMapping?.Branch?.BranchName ?? string.Empty,
    //        AvailableActions = allActions.Select(a => new MenuActionItem
    //        {
    //            Id = a.Id,
    //            Name = a.ActionName,
    //            Icon = a.Icon ?? string.Empty,
    //            Color = a.ActionColor ?? string.Empty
    //        }).ToList(),
    //        GrantedActionIds = existingPermissions
    //            .Where(p => p.IsGranted)
    //            .Select(p => p.MenuActionId)
    //            .ToList()
    //    };
    //}

    //public async Task<List<MenuPermissionViewModel>> GetMenuPermissionsAsync(int menuDetailId)
    //{
    //    var permissions = await repository.MenuPermission.GetByMenuDetailIdAsync(menuDetailId);

    //    return permissions.Select(p => new MenuPermissionViewModel
    //    {
    //        EncryptedId = encryptionHelper.Encrypt(p.Id.ToString()),
    //        MenuDetailId = p.MenuDetailId,
    //        MenuName = p.MenuDetail?.MenuMaster?.MenuName ?? string.Empty,
    //        BranchName = p.MenuDetail?.BranchMapping?.Branch?.BranchName ?? string.Empty,
    //        MenuActionId = p.MenuActionId,
    //        ActionName = p.MenuAction?.ActionName ?? string.Empty,
    //        ActionIcon = p.MenuAction?.Icon ?? string.Empty,
    //        PermissionKey = p.PermissionKey,
    //        IsGranted = p.IsGranted,
    //        IsActive = p.IsActive
    //    }).ToList();
    //}

    //public async Task<bool> SaveMenuPermissionsAsync(SaveMenuPermissionsDto dto)
    //{
    //    var menuDetailId = encryptionHelper.Decrypt(dto.EncryptedMenuDetailId);
    //    var menuDetail = await repository.MenuDetail.FindByIdAsync(menuDetailId);

    //    if (menuDetail is null)
    //        return false;

    //    var menuMaster = await repository.MenuMaster.FindByIdAsync(menuDetail.MenuMasterId);
    //    if (menuMaster is null)
    //        return false;

    //    using var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

    //    // Delete existing permissions for this menu detail
    //    await repository.MenuPermission.DeleteByMenuDetailIdAsync(menuDetailId);

    //    // If no actions selected, complete transaction
    //    if (!dto.ActionIds.Any())
    //    {
    //        transactionScope.Complete();
    //        return true;
    //    }

    //    // Get actions to create permission keys
    //    var actions = await repository.MenuAction.GetAllActiveMenuActionsAsync();
    //    var selectedActions = actions.Where(a => dto.ActionIds.Contains(a.Id)).ToList();

    //    var newPermissions = selectedActions.Select(action => 
    //    {
    //        var permission = new WfMenuPermission
    //        {
    //            MenuDetailId = menuDetailId,
    //            MenuActionId = action.Id,
    //            PermissionKey = PermissionHelper.GeneratePermissionKey(menuMaster.MenuName, action.ActionName),
    //            ClaimType = "MenuPermission",
    //            IsGranted = true
    //        };
    //        CreateAutoFields(permission);
    //        return permission;
    //    }).ToList();

    //    if (newPermissions.Any())
    //    {
    //        await repository.MenuPermission.InsertRangeAsync(newPermissions);
    //    }

    //    transactionScope.Complete();
    //    return true;
    //}

    //public async Task<List<string>> GetMenuPermissionKeysAsync(string encryptedMenuDetailId)
    //{
    //    var menuDetailId = encryptionHelper.Decrypt(encryptedMenuDetailId);
    //    return await repository.MenuPermission.GetPermissionKeysByMenuDetailIdAsync(menuDetailId);
    //}

    //Task<MenuMasterViewModel?> IBaseService<MenuMasterViewModel, MenuMasterDto>.GetDetailsAsync(string encryptedId)
    //{
    //    throw new NotImplementedException();
    //}

    //Task<PaginatedListViewModel<MenuMasterViewModel>?> IBaseMainService<MenuMasterViewModel, MenuMasterDto>.GetListAsync(int take, int skip)
    //{
    //    throw new NotImplementedException();
    //}

    //Task<MenuMasterDto?> IBaseMainService<MenuMasterViewModel, MenuMasterDto>.GetByIdAsync(string encryptedId)
    //{
    //    throw new NotImplementedException();
    //}

    //public Task<bool> CreateAsync(MenuMasterDto entity)
    //{
    //    throw new NotImplementedException();
    //}

    //public Task<bool> UpdateAsync(MenuMasterDto entity)
    //{
    //    throw new NotImplementedException();
    //}

    //#endregion
    public Task<bool> CreateAsync(MenuMasterDto entity)
    {
        throw new NotImplementedException();
    }

    public Task<MenuMasterDto?> GetByIdAsync(string encryptedId)
    {
        throw new NotImplementedException();
    }

    public Task<MenuMasterViewModel?> GetDetailsAsync(string encryptedId)
    {
        throw new NotImplementedException();
    }

    public Task<PaginatedListViewModel<MenuMasterViewModel>?> GetListAsync(int take, int skip)
    {
        throw new NotImplementedException();
    }

    public Task<List<string>> GetMenuPermissionKeysAsync(string encryptedMenuDetailId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<SidebarMenuViewModel>> GetUserMenusAsync()
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateAsync(MenuMasterDto entity)
    {
        throw new NotImplementedException();
    }
}