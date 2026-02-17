using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;

namespace Services.Concretes.Identity;

public class NumericTokenProvider<TUser>(IMemoryCache memoryCache) : IUserTwoFactorTokenProvider<TUser> where TUser : class
{
    private readonly TimeSpan _expiry = TimeSpan.FromMinutes(5);
    private const int MaxFailedAttempts = 3;

    public async Task<string> GenerateAsync(string purpose, UserManager<TUser> userManager, TUser user)
    {
        var otp = new Random().Next(100000, 999999).ToString();
        var userId = await userManager.GetUserIdAsync(user);
        var otpKey = GetCacheKey(userId, purpose);
        var failKey = GetFailKey(userId, purpose);

        memoryCache.Set(otpKey, otp, _expiry);
        memoryCache.Remove(failKey);
        return await Task.FromResult(otp);
    }

    public async Task<bool> ValidateAsync(string purpose, string token, UserManager<TUser> userManager, TUser user)
    {
        var userId = await userManager.GetUserIdAsync(user);
        var otpKey = GetCacheKey(userId, purpose);
        var failKey = GetFailKey(userId, purpose);

        if (memoryCache.TryGetValue(otpKey, out string? cachedOtp))
        {
            if (cachedOtp == token)
            {
                memoryCache.Remove(otpKey);
                memoryCache.Remove(failKey);
                return await Task.FromResult(true);
            }

            int failCount = memoryCache.TryGetValue(failKey, out int count) ? count + 1 : 1;
            if (failCount >= MaxFailedAttempts)
            {
                memoryCache.Remove(otpKey);
                memoryCache.Remove(failKey);
            }
            else
            {
                memoryCache.Set(failKey, failCount, _expiry);
            }

            return await Task.FromResult(false);
        }
        return await Task.FromResult(false);
    }

    public async Task<bool> CanGenerateTwoFactorTokenAsync(UserManager<TUser> userManager, TUser user)
    {
        return await Task.FromResult(true);
    }

    private static string GetCacheKey(string userId, string purpose)
    {
        return $"OTP_{purpose}_{userId}";
    }

    private static string GetFailKey(string userId, string purpose)
    {
        return $"OTP_FAIL_{purpose}_{userId}";
    }
}