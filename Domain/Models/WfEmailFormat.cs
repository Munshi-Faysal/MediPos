using Domain.Models.BaseModels;

namespace Domain.Models;

public class WfEmailFormat : BaseEntity
{
    public string EmailFormatType { get; set; } = null!;
    public string EmailSubject { get; set; } = null!;
    public string EmailBody { get; set; } = null!;
}