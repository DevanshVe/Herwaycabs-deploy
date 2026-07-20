using admin_portal.Models;

namespace admin_portal.Services;

public interface IAuthApiService
{
    // Returns the auth response on success, or null on invalid credentials.
    Task<AuthResponse?> Authenticate(string email, string password);
}
