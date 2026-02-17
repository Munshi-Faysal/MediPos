using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IUnitService : IBaseService<UnitViewModel, UnitDto>
{
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<UnitDto>> GetActiveListAsync();
}