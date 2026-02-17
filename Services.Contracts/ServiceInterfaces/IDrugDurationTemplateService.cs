using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.DrugDurationTemplate;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IDrugDurationTemplateService
{
    Task<PaginatedListViewModel<DrugDurationTemplateViewModel>?> GetListAsync(int take, int skip);
    Task<DrugDurationTemplateViewModel?> GetDetailsAsync(string encryptedId);
    Task<DrugDurationTemplateDto?> GetByIdAsync(string encryptedId);
    Task<bool> CreateAsync(DrugDurationTemplateDto dto);
    Task<bool> UpdateAsync(DrugDurationTemplateDto dto);
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<DrugDurationTemplateDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId);
    Task<List<DrugDurationTemplateDto>> GetActiveForCurrentUserAsync();
}
