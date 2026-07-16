namespace admin_portal.Models;

public class DriverViewModel
{
    public long Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Gender { get; set; }
    public bool IsVerified { get; set; }
    public bool IsAvailable { get; set; }
    public string DocumentPath { get; set; }
}
