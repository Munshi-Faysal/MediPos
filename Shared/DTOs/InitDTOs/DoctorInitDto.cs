using Shared.DTOs.BaseDTOs;

namespace Shared.DTOs.InitDTOs;

public class DoctorInitDto
{
    public IEnumerable<DropdownDto> ClinicalDeptList { get; set; } = new List<DropdownDto>();
    public IEnumerable<DropdownDto> OperationStatusList { get; set; } = new List<DropdownDto>();
}
