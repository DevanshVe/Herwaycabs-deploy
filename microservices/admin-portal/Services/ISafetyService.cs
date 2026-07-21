using admin_portal.Models;

namespace admin_portal.Services;

public interface ISafetyService
{
    Task<List<SosEventViewModel>> GetActiveSos();
    Task ResolveSos(long id);
}
