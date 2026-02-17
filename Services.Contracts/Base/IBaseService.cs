namespace Services.Contracts.Base;

public interface IBaseService<TViewModel, TDto> : IBaseMainService<TViewModel, TDto> where TViewModel : class where TDto : class
{
    Task<TViewModel?> GetDetailsAsync(string encryptedId);
}