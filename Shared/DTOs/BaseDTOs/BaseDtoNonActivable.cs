namespace Shared.DTOs.BaseDTOs;

public class BaseDtoNonActivable
{
    public DateTime? CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
}