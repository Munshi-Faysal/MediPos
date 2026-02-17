using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IDrugAdviceService : IBaseService<DrugAdviceViewModel, DrugAdviceDto>
{
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<DrugAdviceDto>> GetActiveListAsync();
    Task<List<DrugAdviceDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId);
    Task<List<DrugAdviceDto>> GetActiveForCurrentUserAsync();
}
