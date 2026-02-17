using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IDrugDurationService : IBaseService<DrugDurationViewModel, DrugDurationDto>
{
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<DrugDurationDto>> GetActiveListAsync();
    Task<List<DrugDurationDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId);
    Task<List<DrugDurationDto>> GetActiveForCurrentUserAsync();
}
