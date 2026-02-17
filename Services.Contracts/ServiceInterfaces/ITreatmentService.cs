using Shared.DTOs.MainDTOs.Treatment;

namespace Services.Contracts.ServiceInterfaces;

public interface ITreatmentService
{
    Task<IEnumerable<TreatmentTemplateViewModel>> GetTemplatesByDoctorIdAsync(string doctorEncryptedId);
    Task<IEnumerable<TreatmentTemplateViewModel>> GetTemplatesByCurrentDoctorAsync();
    Task<TreatmentTemplateViewModel?> GetTemplateWithDrugsAsync(string templateEncryptedId);
    Task<bool> CreateTemplateAsync(TreatmentTemplateDto treatmentTemplateDto);
    Task<bool> UpdateTemplateAsync(TreatmentTemplateDto treatmentTemplateDto);
    Task<bool> DeleteTemplateAsync(string templateEncryptedId);
}
