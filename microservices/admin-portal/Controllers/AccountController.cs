using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using admin_portal.Models;
using admin_portal.Services;

namespace admin_portal.Controllers;

public class AccountController : Controller
{
    private readonly IAuthApiService _authService;

    public AccountController(IAuthApiService authService)
    {
        _authService = authService;
    }

    [HttpGet]
    public IActionResult Login()
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            return RedirectToAction("Index", "Admin");
        }
        return View(new LoginViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        AuthResponse? result;
        try
        {
            result = await _authService.Authenticate(model.Email, model.Password);
        }
        catch
        {
            ModelState.AddModelError(string.Empty, "Can't reach the authentication service right now. Please try again in a moment.");
            return View(model);
        }

        if (result == null || string.IsNullOrEmpty(result.Token))
        {
            ModelState.AddModelError(string.Empty, "Invalid email or password.");
            return View(model);
        }

        if (!string.Equals(result.Role, "ADMIN", StringComparison.OrdinalIgnoreCase))
        {
            ModelState.AddModelError(string.Empty, "This portal is for administrators only.");
            return View(model);
        }

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, result.Id.ToString()),
            new Claim(ClaimTypes.Name, result.Name ?? result.Email ?? "Admin"),
            new Claim(ClaimTypes.Email, result.Email ?? string.Empty),
            new Claim(ClaimTypes.Role, "ADMIN")
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));

        return RedirectToAction("Index", "Admin");
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Login");
    }
}
