using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using admin_portal.Models;
using admin_portal.Services;

namespace admin_portal.Controllers;

[Authorize]
public class AdminController : Controller
{
    private readonly IDriverService _driverService;

    public AdminController(IDriverService driverService)
    {
        _driverService = driverService;
    }

    public async Task<IActionResult> Index()
    {
        List<DriverViewModel> drivers;
        try
        {
            drivers = await _driverService.GetPendingDrivers();
        }
        catch
        {
            // Free-tier: the driver service may be waking up. Don't 500 the page.
            drivers = new List<DriverViewModel>();
            ViewBag.LoadError = true;
        }
        return View(drivers);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Verify(long id)
    {
        try
        {
            await _driverService.VerifyDriver(id);
            TempData["Msg"] = "Driver approved.";
        }
        catch
        {
            TempData["Err"] = "Could not verify the driver — the service may be waking up. Please try again.";
        }
        return RedirectToAction(nameof(Index));
    }
}
