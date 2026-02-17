using Shared.DTOs.BaseDTOs;

namespace Services.Contracts.Base;

public interface IBaseMainService<TViewModel, TDto> where TViewModel : class where TDto : class
{
    Task<PaginatedListViewModel<TViewModel>?> GetListAsync(int take, int skip);
    Task<TDto?> GetByIdAsync(string encryptedId);
    Task<bool> CreateAsync(TDto entity);
    Task<bool> UpdateAsync(TDto entity);
}