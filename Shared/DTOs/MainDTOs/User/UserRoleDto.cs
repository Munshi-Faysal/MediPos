using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.User;

public class AssignRoleDto
{
    [Required]
    public int UserId { get; set; }

    [Required]
    public string RoleName { get; set; } = null!;
}

public class UserRoleResponseDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = null!;
    public IEnumerable<string> Roles { get; set; } = new List<string>();
}
