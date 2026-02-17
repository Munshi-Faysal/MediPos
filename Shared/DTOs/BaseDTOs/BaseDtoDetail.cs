namespace Shared.DTOs.BaseDTOs;

public class BaseDtoDetail : BaseDtoNonActivable
{
    public bool IsActive { get; set; } = true;
    public string? EncryptedId { get; set; }
}