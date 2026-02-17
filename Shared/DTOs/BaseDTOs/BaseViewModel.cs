using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.BaseDTOs;

public class BaseViewModel
{
    [Display(Name = "Active")]
    public bool IsActive { get; set; }
    public int Id { get; set; }
    public string? EncryptedId { get; set; }
}