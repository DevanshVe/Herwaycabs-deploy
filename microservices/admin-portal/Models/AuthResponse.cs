namespace admin_portal.Models;

// Mirrors the auth-service /api/auth/authenticate response.
public class AuthResponse
{
    public string? Token { get; set; }
    public long Id { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
}
