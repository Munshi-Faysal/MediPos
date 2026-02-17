using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Investigation;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IInvestigationService
{
    Task<PaginatedListViewModel<InvestigationViewModel>?> GetListAsync(int take, int skip);
    Task<InvestigationViewModel?> GetDetailsAsync(string encryptedId);
    Task<InvestigationDto?> GetByIdAsync(string encryptedId);
    Task<bool> CreateAsync(InvestigationDto dto);
    Task<bool> UpdateAsync(InvestigationDto dto);
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<InvestigationDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId);
    Task<List<InvestigationDto>> GetActiveForCurrentUserAsync();
}
