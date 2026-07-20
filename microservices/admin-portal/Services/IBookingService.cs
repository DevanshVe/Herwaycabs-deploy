using admin_portal.Models;

namespace admin_portal.Services;

public interface IBookingService
{
    Task<List<RideViewModel>> GetAllRides();
}
