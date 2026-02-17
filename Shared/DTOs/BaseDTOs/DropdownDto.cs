namespace Shared.DTOs.BaseDTOs;

public class DropdownDto
{
    public dynamic Id { get; set; } = null!;
    public string Value { get; set; } = null!;
    public bool? IsActive { get; set; }
}