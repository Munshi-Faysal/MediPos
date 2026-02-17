using Microsoft.AspNetCore.Identity;

namespace Shared.DTOs.MainDTOs.Account;

public class LoginResponseDto
{
    public required IdentityResult Result { get; set; }
    public string? Token { get; set; }
    public int? UserId { get; set; }
    public int? DoctorId { get; set; }
    public bool Is2FaRequired { get; set; }
    public bool IsMailConfirmed { get; set; }
}