namespace Services.Contracts.ServiceInterfaces;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? slidingExpiration = null, TimeSpan? absoluteExpiration = null, string? prefix = null);
    Task RemoveAsync(string key);
    Task RemoveByPrefixAsync(string prefix);
    Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? slidingExpiration = null, TimeSpan? absoluteExpiration = null, string? prefix = null);
}
