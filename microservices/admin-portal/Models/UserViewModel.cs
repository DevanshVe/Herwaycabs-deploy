namespace admin_portal.Models;

public class UserViewModel
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Gender { get; set; }
    public bool IsVerified { get; set; }
}
