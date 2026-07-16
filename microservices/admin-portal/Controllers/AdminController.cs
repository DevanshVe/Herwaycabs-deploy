using Microsoft.AspNetCore.Mvc;
using admin_portal.Services;

namespace admin_portal.Controllers;

public class AdminController : Controller
{
    private readonly IDriverService _driverService;

    public AdminController(IDriverService driverService)
    {
        _driverService = driverService;
    }

    public async Task<IActionResult> Index()
    {
        var drivers = await _driverService.GetPendingDrivers();
        return View(drivers);
    }

    [HttpPost]
    public async Task<IActionResult> Verify(long id)
    {
        await _driverService.VerifyDriver(id);
        return RedirectToAction(nameof(Index));
    }
}
