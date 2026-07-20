using admin_portal.Models;

namespace admin_portal.Services;

public interface IDriverService
{
    Task<List<DriverViewModel>> GetPendingDrivers();
    Task<List<DriverViewModel>> GetAllDrivers();
    Task VerifyDriver(long driverId);
}
