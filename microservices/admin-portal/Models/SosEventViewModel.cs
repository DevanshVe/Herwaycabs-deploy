namespace admin_portal.Models;

public class SosEventViewModel
{
    public long Id { get; set; }
    public long? UserId { get; set; }
    public long? RideId { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? Status { get; set; }
    public string? Note { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
