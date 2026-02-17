using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IGenericService : IBaseService<GenericViewModel, GenericDto>
{
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<GenericDto>> GetActiveListAsync();
}