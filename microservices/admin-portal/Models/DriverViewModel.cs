namespace admin_portal.Models;

public class DriverViewModel
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    // Nullable — the Java side uses Boolean (can be null, e.g. onTrip on
    // drivers created before the column existed). A non-nullable bool would
    // make System.Text.Json throw on a null value and break the whole list.
    public bool? IsVerified { get; set; }
    public bool? IsAvailable { get; set; }
    public bool? OnTrip { get; set; }
    public string? DocumentPath { get; set; }
}
