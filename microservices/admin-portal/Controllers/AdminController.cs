using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using admin_portal.Models;
using admin_portal.Services;

namespace admin_portal.Controllers;

[Authorize]
public class AdminController : Controller
{
    private readonly IDriverService _driverService;
    private readonly IAuthApiService _authService;
    private readonly IBookingService _bookingService;

    public AdminController(IDriverService driverService, IAuthApiService authService, IBookingService bookingService)
    {
        _driverService = driverService;
        _authService = authService;
        _bookingService = bookingService;
    }

    // Pending driver verifications
    public async Task<IActionResult> Index()
    {
        List<DriverViewModel> drivers;
        try
        {
            drivers = await _driverService.GetPendingDrivers();
        }
        catch
        {
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

    // All drivers (verified + pending)
    public async Task<IActionResult> Drivers()
    {
        List<DriverViewModel> drivers;
        try
        {
            drivers = await _driverService.GetAllDrivers();
        }
        catch
        {
            drivers = new List<DriverViewModel>();
            ViewBag.LoadError = true;
        }
        return View(drivers);
    }

    // All users (riders / drivers / admins)
    public async Task<IActionResult> Users()
    {
        List<UserViewModel> users;
        try
        {
            users = await _authService.GetAllUsers();
        }
        catch
        {
            users = new List<UserViewModel>();
            ViewBag.LoadError = true;
        }
        return View(users);
    }

    // All rides (ride history across the platform)
    public async Task<IActionResult> Rides()
    {
        List<RideViewModel> rides;
        try
        {
            rides = await _bookingService.GetAllRides();
        }
        catch
        {
            rides = new List<RideViewModel>();
            ViewBag.LoadError = true;
        }
        return View(rides);
    }
}
