using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.ChiefComplaint;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IChiefComplaintService
{
    Task<PaginatedListViewModel<ChiefComplaintViewModel>?> GetListAsync(int take, int skip);
    Task<ChiefComplaintViewModel?> GetDetailsAsync(string encryptedId);
    Task<ChiefComplaintDto?> GetByIdAsync(string encryptedId);
    Task<bool> CreateAsync(ChiefComplaintDto dto);
    Task<bool> UpdateAsync(ChiefComplaintDto dto);
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<ChiefComplaintDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId);
    Task<List<ChiefComplaintDto>> GetActiveForCurrentUserAsync();
}
