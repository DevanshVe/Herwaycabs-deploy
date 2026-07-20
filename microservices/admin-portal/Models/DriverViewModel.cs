namespace admin_portal.Models;

public class DriverViewModel
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    public bool IsAvailable { get; set; }
    public bool OnTrip { get; set; }
    public string? DocumentPath { get; set; }
}
