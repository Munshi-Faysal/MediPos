using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace Services.Concretes.Base;

public class BaseService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IHttpContextAccessor _httpContextAccessor;

    protected BaseService(UserManager<ApplicationUser> userManager,
        IHttpContextAccessor httpContextAccessor)
    {
        _userManager = userManager;
        _httpContextAccessor = httpContextAccessor;
    }

    protected async Task<ApplicationUser?> GetCurrentUserAsync()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        var userId = user?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is not null)
            return await _userManager.FindByIdAsync(userId);
        return null;
    }

    protected int CurrentUserId
    {
        get
        {
            var userId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(userId, out var id) ? id : 0;
        }
    }

    protected ApplicationUser? CurrentUser => GetCurrentUserAsync().GetAwaiter().GetResult();

    protected async Task<int> GenerateAutoNoByLastNo(string lastNo, char prefix)
    {
        return await Task.Run(() =>
        {
            var startIndex = lastNo.LastIndexOf(prefix) + 1;
            var digitsAfterF = lastNo[startIndex..];
            return int.TryParse(digitsAfterF, out int result) ? result : 0;
        });
    }

    protected void CreateAutoFields(dynamic entity)
    {
        entity.CreatedDate = entity.UpdatedDate = DateTime.Now;
        entity.CreatedBy = entity.UpdatedBy = CurrentUserId;
    }

    protected void UpdateAutoFields(dynamic entity)
    {
        entity.UpdatedDate = DateTime.Now;
        entity.UpdatedBy = CurrentUserId;
    }
}