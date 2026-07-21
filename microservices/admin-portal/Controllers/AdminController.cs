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
    private readonly IKycService _kycService;
    private readonly ISafetyService _safetyService;

    public AdminController(IDriverService driverService, IAuthApiService authService, IBookingService bookingService, IKycService kycService, ISafetyService safetyService)
    {
        _driverService = driverService;
        _authService = authService;
        _bookingService = bookingService;
        _kycService = kycService;
        _safetyService = safetyService;
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

    // Pending KYC documents awaiting review
    public async Task<IActionResult> Kyc()
    {
        List<KycDocumentViewModel> docs;
        try
        {
            docs = await _kycService.GetPending();
        }
        catch
        {
            docs = new List<KycDocumentViewModel>();
            ViewBag.LoadError = true;
        }
        return View(docs);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> VerifyKyc(long id, bool approved, string? notes)
    {
        try
        {
            await _kycService.Verify(id, approved, notes);
            TempData["Msg"] = approved ? "Document approved." : "Document rejected.";
        }
        catch
        {
            TempData["Err"] = "Could not update the document — the service may be waking up. Please try again.";
        }
        return RedirectToAction(nameof(Kyc));
    }

    // Active SOS alerts
    public async Task<IActionResult> Sos()
    {
        List<SosEventViewModel> alerts;
        try
        {
            alerts = await _safetyService.GetActiveSos();
        }
        catch
        {
            alerts = new List<SosEventViewModel>();
            ViewBag.LoadError = true;
        }
        return View(alerts);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ResolveSos(long id)
    {
        try
        {
            await _safetyService.ResolveSos(id);
            TempData["Msg"] = "SOS marked as resolved.";
        }
        catch
        {
            TempData["Err"] = "Could not resolve the alert. Please try again.";
        }
        return RedirectToAction(nameof(Sos));
    }
}
