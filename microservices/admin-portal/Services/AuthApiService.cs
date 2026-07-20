using System.Text;
using System.Text.Json;
using admin_portal.Models;

namespace admin_portal.Services;

public class AuthApiService : IAuthApiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public AuthApiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    private string GatewayUrl => _configuration["ApiSettings:GatewayUrl"] ?? string.Empty;

    public async Task<AuthResponse?> Authenticate(string email, string password)
    {
        var url = $"{GatewayUrl}/auth/authenticate";
        var payload = JsonSerializer.Serialize(new { email, password });
        using var content = new StringContent(payload, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(url, content);
        if (!response.IsSuccessStatusCode)
        {
            return null; // invalid credentials (auth returns 401/403)
        }

        var body = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<AuthResponse>(body, JsonOpts);
    }

    public async Task<List<UserViewModel>> GetAllUsers()
    {
        var response = await _httpClient.GetAsync($"{GatewayUrl}/auth/users");
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<List<UserViewModel>>(body, JsonOpts) ?? new List<UserViewModel>();
    }
}
