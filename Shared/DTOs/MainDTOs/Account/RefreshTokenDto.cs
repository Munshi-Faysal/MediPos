using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Account;

public class RefreshTokenDto
{
    [Required]
    public required string RefreshToken { get; set; }
}
