namespace Shared.DTOs.ViewModels;

public class UserViewModel
{
    public int Id { get; set; }
    public string UserName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
    public List<string> Roles { get; set; } = new();
    public int? DoctorId { get; set; }
}
