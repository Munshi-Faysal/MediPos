using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.BaseDTOs;

public class UniqueDto : BaseDto
{
    [Key]
    public int TempId { get; set; }
}