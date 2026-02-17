using Shared.DTOs.MainDTOs.Appointment;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IAppointmentService
{
    Task<IEnumerable<AppointmentViewModel>> GetAppointmentsByDoctorIdAsync(string doctorEncryptedId);
    Task<IEnumerable<AppointmentViewModel>> GetAppointmentsByCurrentDoctorAsync();
    Task<IEnumerable<AppointmentViewModel>> GetAppointmentsByCurrentDoctorAndDateAsync(DateTime date);
    Task<IEnumerable<AppointmentViewModel>> GetAppointmentsByDateAsync(string doctorEncryptedId, DateTime date);
    Task<AppointmentViewModel?> GetByIdAsync(string encryptedId);
    Task<bool> CreateAsync(AppointmentDto dto);
    Task<bool> UpdateStatusAsync(string encryptedId, string status);
}
