namespace admin_portal.Models;

public class RideViewModel
{
    public long Id { get; set; }
    public long? RiderId { get; set; }
    public long? DriverId { get; set; }
    public string? Status { get; set; }
    public string? CabType { get; set; }
    public string? PickupLocation { get; set; }
    public string? DropLocation { get; set; }
    public double Fare { get; set; }
    public DateTime? RequestTime { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int? DriverRating { get; set; }
    public string? DriverFeedback { get; set; }
}
