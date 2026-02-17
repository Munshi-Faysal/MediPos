using Shared.DTOs.MainDTOs.Role;

namespace Services.Contracts.ServiceInterfaces;

public interface IRoleService
{
    Task<IEnumerable<RoleDto>> GetAllRolesAsync();
    Task<RoleDto?> GetRoleByIdAsync(int id);
    Task<bool> CreateRoleAsync(RoleCreateDto roleCreateDto);
    Task<bool> UpdateRoleAsync(RoleUpdateDto roleUpdateDto);
    Task<bool> DeleteRoleAsync(int id);
    Task<bool> ChangeActiveAsync(int id);
}
