using Shared.DTOs.MainDTOs.Prescription;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IPrescriptionService
{
    Task<PrescriptionDto?> GetByIdAsync(string encryptedId);
    Task<IEnumerable<PrescriptionViewModel>> GetPrescriptionsByDoctorAsync();
    Task<bool> CreateAsync(PrescriptionDto dto);
    Task<bool> UpdateAsync(PrescriptionDto dto);
    Task<bool> DeleteAsync(string encryptedId);
}
