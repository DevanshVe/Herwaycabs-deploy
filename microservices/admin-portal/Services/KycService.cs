using System.Text.Json;
using admin_portal.Models;

namespace admin_portal.Services;

public class KycService : IKycService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public KycService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    private string BaseUrl => $"{_configuration["ApiSettings:GatewayUrl"]}/kyc";

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public async Task<List<KycDocumentViewModel>> GetPending()
    {
        var response = await _httpClient.GetAsync($"{BaseUrl}/pending");
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<List<KycDocumentViewModel>>(content, JsonOpts) ?? new List<KycDocumentViewModel>();
    }

    public async Task Verify(long documentId, bool approved, string? notes)
    {
        var url = $"{BaseUrl}/{documentId}/verify?approved={approved.ToString().ToLower()}&notes={Uri.EscapeDataString(notes ?? string.Empty)}";
        var response = await _httpClient.PostAsync(url, null);
        response.EnsureSuccessStatusCode();
    }
}
