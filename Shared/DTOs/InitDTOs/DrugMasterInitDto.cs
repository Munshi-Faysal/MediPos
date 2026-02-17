using Shared.DTOs.BaseDTOs;

namespace Shared.DTOs.InitDTOs;

public class DrugMasterInitDto
{
    public IEnumerable<DropdownDto> DrugCompanyList { get; set; } = new List<DropdownDto>();
    public IEnumerable<DropdownDto> DrugTypeList { get; set; } = new List<DropdownDto>();
    public IEnumerable<DropdownDto> DrugDoseList { get; set; } = new List<DropdownDto>();
    public IEnumerable<DropdownDto> DrugDurationList { get; set; } = new List<DropdownDto>();
    public IEnumerable<DropdownDto> GenericList { get; set; } = new List<DropdownDto>();
    public IEnumerable<DropdownDto> DrugStrengthList { get; set; } = new List<DropdownDto>();
}
