namespace Shared.DTOs.BaseDTOs;

public class BaseDto
{
    public bool IsActive { get; set; } = true;
    public int? Id { get; set; }
    public string? EncryptedId { get; set; }
}