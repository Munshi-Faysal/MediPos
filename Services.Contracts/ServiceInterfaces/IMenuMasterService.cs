using Services.Contracts.Base;
using Shared.DTOs.MainDTOs;
using Shared.DTOs.ViewModels;
using Shared.DTOs.ViewModels.WorkflowEngine;

namespace Services.Contracts.ServiceInterfaces;

public interface IMenuMasterService : IBaseService<MenuMasterViewModel, MenuMasterDto>
{
    Task<IEnumerable<SidebarMenuViewModel>> GetUserMenusAsync();
    Task<List<string>> GetMenuPermissionKeysAsync(string encryptedMenuDetailId);
}