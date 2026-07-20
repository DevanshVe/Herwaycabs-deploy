using System.Text.Json;
using admin_portal.Models;

namespace admin_portal.Services;

public class BookingService : IBookingService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public BookingService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    private string BaseUrl =>
        $"{_configuration["ApiSettings:GatewayUrl"]}/bookings";

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public async Task<List<RideViewModel>> GetAllRides()
    {
        var response = await _httpClient.GetAsync($"{BaseUrl}/all");
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<List<RideViewModel>>(content, JsonOpts) ?? new List<RideViewModel>();
    }
}
