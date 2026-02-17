using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.DrugDoseTemplate;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IDrugDoseTemplateService
{
    Task<PaginatedListViewModel<DrugDoseTemplateViewModel>?> GetListAsync(int take, int skip);
    Task<DrugDoseTemplateViewModel?> GetDetailsAsync(string encryptedId);
    Task<DrugDoseTemplateDto?> GetByIdAsync(string encryptedId);
    Task<bool> CreateAsync(DrugDoseTemplateDto dto);
    Task<bool> UpdateAsync(DrugDoseTemplateDto dto);
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<DrugDoseTemplateDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId);
    Task<List<DrugDoseTemplateDto>> GetActiveForCurrentUserAsync();
}
