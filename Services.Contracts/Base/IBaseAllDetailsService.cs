namespace Services.Contracts.Base;

public interface IBaseAllDetailsService<TViewModel, TViewModelDetails, TDto, TInitDto> : IBaseMainService<TViewModel, TDto> where TViewModel : class where TViewModelDetails : class where TDto : class where TInitDto : class
{
    Task<TViewModelDetails?> GetDetailsAsync(string encryptedId);
    Task<TInitDto> GetInitObject();
}