using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.OnExamination;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IOnExaminationService
{
    Task<PaginatedListViewModel<OnExaminationViewModel>?> GetListAsync(int take, int skip);
    Task<OnExaminationViewModel?> GetDetailsAsync(string encryptedId);
    Task<OnExaminationDto?> GetByIdAsync(string encryptedId);
    Task<bool> CreateAsync(OnExaminationDto dto);
    Task<bool> UpdateAsync(OnExaminationDto dto);
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<OnExaminationDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId);
    Task<List<OnExaminationDto>> GetActiveForCurrentUserAsync();
}
