using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Disease;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IDiseaseService
{
    Task<PaginatedListViewModel<DiseaseViewModel>?> GetListAsync(int take, int skip);
    Task<DiseaseViewModel?> GetDetailsAsync(string encryptedId);
    Task<DiseaseDto?> GetByIdAsync(string encryptedId);
    Task<bool> CreateAsync(DiseaseDto dto);
    Task<bool> UpdateAsync(DiseaseDto dto);
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<DiseaseDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId);
    Task<List<DiseaseDto>> GetActiveForCurrentUserAsync();
}
