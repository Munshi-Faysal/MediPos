using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using Services.Contracts.ServiceInterfaces;

namespace Services.Concretes.ServiceInfrastructure;

public sealed class CacheService(IMemoryCache memoryCache) : ICacheService
{
    private static readonly ConcurrentDictionary<string, CancellationTokenSource> _prefixTokens = new();

    public Task<T?> GetAsync<T>(string key)
    {
        if (memoryCache.TryGetValue(key, out T? value))
        {
            return Task.FromResult(value);
        }
        return Task.FromResult<T?>(default);
    }

    public Task SetAsync<T>(string key, T value, TimeSpan? slidingExpiration = null, TimeSpan? absoluteExpiration = null, string? prefix = null)
    {
        if (value == null) return Task.CompletedTask;

        var options = new MemoryCacheEntryOptions
        {
            SlidingExpiration = slidingExpiration ?? TimeSpan.FromMinutes(30),
            AbsoluteExpirationRelativeToNow = absoluteExpiration ?? TimeSpan.FromHours(4)
        };

        if (!string.IsNullOrEmpty(prefix))
        {
            var cts = _prefixTokens.GetOrAdd(prefix, _ => new CancellationTokenSource());
            options.AddExpirationToken(new CancellationChangeToken(cts.Token));
        }

        memoryCache.Set(key, value, options);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key)
    {
        memoryCache.Remove(key);
        return Task.CompletedTask;
    }

    public Task RemoveByPrefixAsync(string prefix)
    {
        if (_prefixTokens.TryRemove(prefix, out var cts))
        {
            try
            {
                cts.Cancel();
                cts.Dispose();
            }
            catch
            {
                // ignore
            }
        }
        return Task.CompletedTask;
    }

    public async Task<T> GetOrCreateAsync<T>(
        string key, 
        Func<Task<T>> factory, 
        TimeSpan? slidingExpiration = null, 
        TimeSpan? absoluteExpiration = null, 
        string? prefix = null)
    {
        if (memoryCache.TryGetValue(key, out T? cachedValue) && cachedValue != null)
        {
            return cachedValue;
        }

        var result = await factory();
        if (result != null)
        {
            await SetAsync(key, result, slidingExpiration, absoluteExpiration, prefix);
        }
        return result;
    }
}
