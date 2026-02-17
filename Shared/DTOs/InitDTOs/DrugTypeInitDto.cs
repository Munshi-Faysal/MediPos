using Shared.DTOs.BaseDTOs;

namespace Shared.DTOs.InitDTOs;

public class DrugTypeInitDto
{
    public IEnumerable<DropdownDto> DoctorList { get; set; } = new List<DropdownDto>();
}
