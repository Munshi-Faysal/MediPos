using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.MainDTOs.Drug;

public class DrugDetailDto : BaseDto
{
    public string? StrengthName { get; set; }
    public string? DrugTypeName { get; set; }
    public string? Description { get; set; }
    public decimal UnitPrice { get; set; }


    public int DrugStrengthId { get; set; }
    public int DrugTypeId { get; set; }
    public bool IsActive { get; set; }
}