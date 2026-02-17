using Domain.Models.BaseModels;

namespace Domain.Models;

public partial class ClinicalDept: BaseEntity
{
    public string Name { get; set; } = null!;

    public virtual ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
}
