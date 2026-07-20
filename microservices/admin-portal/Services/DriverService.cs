using System.Text.Json;
using admin_portal.Models;

namespace admin_portal.Services;

public class DriverService : IDriverService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public DriverService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    private string BaseUrl =>
        $"{_configuration["ApiSettings:GatewayUrl"]}/drivers";

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public async Task<List<DriverViewModel>> GetPendingDrivers()
    {
        var response = await _httpClient.GetAsync($"{BaseUrl}/pending");
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<List<DriverViewModel>>(content, JsonOpts) ?? new List<DriverViewModel>();
    }

    public async Task<List<DriverViewModel>> GetAllDrivers()
    {
        var response = await _httpClient.GetAsync(BaseUrl);
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<List<DriverViewModel>>(content, JsonOpts) ?? new List<DriverViewModel>();
    }

    public async Task VerifyDriver(long driverId)
    {
        var response = await _httpClient.PostAsync($"{BaseUrl}/{driverId}/verify", null);
        response.EnsureSuccessStatusCode();
    }
}
