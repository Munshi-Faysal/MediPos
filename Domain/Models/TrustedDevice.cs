using System.ComponentModel.DataAnnotations;

namespace Domain.Models;

public class TrustedDevice
{
    [Key]
    public int Id { get; set; }
    public int UserId { get; set; }
    public Guid DeviceId { get; set; }
    public string? IpAddress { get; set; }
    public string? Browser { get; set; }
    public string? OperatingSystem { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? LastUsedDate { get; set; }
    public bool IsRevoked { get; set; }

    public virtual ApplicationUser? User { get; set; }
}