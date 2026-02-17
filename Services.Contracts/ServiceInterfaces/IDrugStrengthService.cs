using Services.Contracts.Base;
using Shared.DTOs.InitDTOs;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IDrugStrengthService : IBaseServiceInit<DrugStrengthViewModel, DrugStrengthDto, DrugStrengthInitDto>
{
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<DrugStrengthDto>> GetActiveListAsync();
    Task<List<DrugStrengthDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId);
    Task<List<DrugStrengthDto>> GetActiveForCurrentUserAsync();
}
