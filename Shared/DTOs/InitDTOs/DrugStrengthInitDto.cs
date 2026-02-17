using Shared.DTOs.BaseDTOs;

namespace Shared.DTOs.InitDTOs;

public class DrugStrengthInitDto
{
    public IEnumerable<DropdownDto> UnitList { get; set; } = new List<DropdownDto>();
}
