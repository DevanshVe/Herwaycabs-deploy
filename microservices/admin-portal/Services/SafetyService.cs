using System.Text.Json;
using admin_portal.Models;

namespace admin_portal.Services;

public class SafetyService : ISafetyService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public SafetyService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    private string BaseUrl => $"{_configuration["ApiSettings:GatewayUrl"]}/safety";

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public async Task<List<SosEventViewModel>> GetActiveSos()
    {
        var response = await _httpClient.GetAsync($"{BaseUrl}/sos/active");
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<List<SosEventViewModel>>(content, JsonOpts) ?? new List<SosEventViewModel>();
    }

    public async Task ResolveSos(long id)
    {
        var response = await _httpClient.PostAsync($"{BaseUrl}/sos/{id}/resolve", null);
        response.EnsureSuccessStatusCode();
    }
}
