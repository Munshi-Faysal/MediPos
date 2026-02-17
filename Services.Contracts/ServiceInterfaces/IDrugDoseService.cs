using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IDrugDoseService : IBaseService<DrugDoseViewModel, DrugDoseDto>
{
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<DrugDoseDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId);
    Task<List<DrugDoseDto>> GetActiveForCurrentUserAsync();
}
