using Shared.DTOs.MainDTOs.Patient;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IPatientService
{
    Task<IEnumerable<PatientViewModel>> GetAllPatientsAsync(int take = 50);
    Task<IEnumerable<PatientViewModel>> SearchPatientsAsync(string term, int take = 50);
    Task<PatientViewModel?> GetByIdAsync(string encryptedId);
    Task<PatientViewModel?> GetByPhoneAsync(string phone);
    Task<bool> CreateAsync(PatientDto dto);
    Task<bool> UpdateAsync(PatientDto dto);
}
