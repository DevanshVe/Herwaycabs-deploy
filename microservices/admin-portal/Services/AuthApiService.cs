using System.Text;
using System.Text.Json;
using admin_portal.Models;

namespace admin_portal.Services;

public class AuthApiService : IAuthApiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public AuthApiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<AuthResponse?> Authenticate(string email, string password)
    {
        var url = $"{_configuration["ApiSettings:GatewayUrl"]}/auth/authenticate";
        var payload = JsonSerializer.Serialize(new { email, password });
        using var content = new StringContent(payload, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(url, content);
        if (!response.IsSuccessStatusCode)
        {
            return null; // invalid credentials (auth returns 401/403)
        }

        var body = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<AuthResponse>(
            body,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }
}
