namespace Services.Contracts.Base;

public interface IBaseServiceInit<TViewModel, TDto, TInitDto> : IBaseService<TViewModel, TDto>
    where TDto : class where TViewModel : class where TInitDto : class
{
    Task<TInitDto> GetInitObjectAsync();
}