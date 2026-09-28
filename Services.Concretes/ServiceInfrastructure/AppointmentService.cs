using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.MainDTOs.Appointment;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class AppointmentService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IAppointmentService
{
    private static readonly HashSet<string> AllowedStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Scheduled", "Completed", "Cancelled", "No Show"
    };

    private static bool IsValidId(string? id) =>
        !string.IsNullOrWhiteSpace(id) && id != "null" && id != "undefined";

    private int ResolveId(string? id)
    {
        if (!IsValidId(id)) return 0;
        var decryptedId = encryptionHelper.Decrypt(id!);
        if (decryptedId > 0) return decryptedId;
        return int.TryParse(id, out var numericId) ? numericId : 0;
    }

    private async Task<Doctor?> GetCurrentDoctorAsync()
    {
        var user = await GetCurrentUserAsync();
        if (user is null) return null;

        var doctor = await repository.Doctor.GetByUserIdAsync(user.Id);
        return doctor ?? (string.IsNullOrWhiteSpace(user.Email)
            ? null
            : await repository.Doctor.GetByEmailAsync(user.Email));
    }

    private async Task<List<AppointmentViewModel>> ToViewModelsAsync(IEnumerable<Appointment> appointments)
    {
        var entities = appointments.ToList();
        var prescriptionIds = await repository.Prescription
            .GetPrescriptionIdsByAppointmentIdsAsync(entities.Select(appointment => appointment.Id));
        var viewModels = mapper.Map<List<AppointmentViewModel>>(entities);

        for (var index = 0; index < entities.Count; index++)
        {
            var entity = entities[index];
            var viewModel = viewModels[index];
            viewModel.EncryptedId = encryptionHelper.Encrypt(entity.Id.ToString());
            viewModel.PatientEncryptedId = encryptionHelper.Encrypt(entity.PatientId.ToString());

            if (prescriptionIds.TryGetValue(entity.Id, out var prescriptionId))
            {
                viewModel.PrescriptionEncryptedId = encryptionHelper.Encrypt(prescriptionId.ToString());
            }
        }

        return viewModels;
    }

    public async Task<IEnumerable<AppointmentViewModel>> GetAppointmentsByDoctorIdAsync(string doctorEncryptedId)
    {
        var doctorId = ResolveId(doctorEncryptedId);
        if (doctorId == 0) return [];

        var appointments = await repository.Appointment.GetAppointmentsByDoctorIdAsync(doctorId);
        return await ToViewModelsAsync(appointments);
    }

    public async Task<IEnumerable<AppointmentViewModel>> GetAppointmentsByCurrentDoctorAsync()
    {
        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return [];

        var appointments = await repository.Appointment.GetAppointmentsByDoctorIdAsync(doctor.Id);
        return await ToViewModelsAsync(appointments);
    }

    public async Task<IEnumerable<AppointmentViewModel>> GetAppointmentsByDateAsync(
        string doctorEncryptedId,
        DateTime date)
    {
        var doctorId = ResolveId(doctorEncryptedId);
        if (doctorId == 0) return [];

        var appointments = await repository.Appointment.GetAppointmentsByDateAsync(doctorId, date);
        return await ToViewModelsAsync(appointments);
    }

    public async Task<IEnumerable<AppointmentViewModel>> GetAppointmentsByCurrentDoctorAndDateAsync(DateTime date)
    {
        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return [];

        var appointments = await repository.Appointment.GetAppointmentsByDateAsync(doctor.Id, date);
        return await ToViewModelsAsync(appointments);
    }

    public async Task<AppointmentViewModel?> GetByIdAsync(string encryptedId)
    {
        var appointmentId = ResolveId(encryptedId);
        if (appointmentId == 0) return null;

        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return null;

        var entity = await repository.Appointment.GetAppointmentDetailsAsync(appointmentId);
        if (entity is null || entity.DoctorId != doctor.Id) return null;

        return (await ToViewModelsAsync([entity])).Single();
    }

    public async Task<bool> CreateAsync(AppointmentDto dto)
    {
        var appointmentDateTime = ToLocalDateTime(dto.DateTime);
        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null || !await IsValidPatientAsync(dto.PatientId)) return false;
        if (!IsValidAppointmentDate(appointmentDateTime)) return false;
        if (await HasScheduleConflictAsync(doctor.Id, dto.PatientId, appointmentDateTime)) return false;

        var entity = mapper.Map<Appointment>(dto);
        entity.DoctorId = doctor.Id;
        entity.DateTime = appointmentDateTime;
        entity.Status = "Scheduled";
        entity.Type = NormalizeType(dto.Type);
        entity.Reason = dto.Reason?.Trim();
        entity.Notes = dto.Notes?.Trim();
        entity.IsActive = true;
        CreateAutoFields(entity);
        return await repository.Appointment.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(AppointmentDto dto)
    {
        var appointmentDateTime = ToLocalDateTime(dto.DateTime);
        var appointmentId = ResolveId(dto.EncryptedId);
        if (appointmentId == 0 || !await IsValidPatientAsync(dto.PatientId)) return false;

        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null || !IsValidAppointmentDate(appointmentDateTime)) return false;

        var entity = await repository.Appointment.FindByIdAsync(appointmentId);
        if (entity is null || !entity.IsActive || entity.DoctorId != doctor.Id ||
            !entity.Status.Equals("Scheduled", StringComparison.OrdinalIgnoreCase)) return false;

        if (await HasScheduleConflictAsync(doctor.Id, dto.PatientId, appointmentDateTime, appointmentId)) return false;

        entity.PatientId = dto.PatientId;
        entity.DateTime = appointmentDateTime;
        entity.Type = NormalizeType(dto.Type);
        entity.Reason = dto.Reason?.Trim();
        entity.Notes = dto.Notes?.Trim();
        UpdateAutoFields(entity);
        return await repository.Appointment.UpdateAsync(entity);
    }

    public async Task<bool> UpdateStatusAsync(string encryptedId, string status)
    {
        var appointmentId = ResolveId(encryptedId);
        var normalizedStatus = status?.Trim();
        if (appointmentId == 0 || string.IsNullOrWhiteSpace(normalizedStatus) ||
            !AllowedStatuses.Contains(normalizedStatus)) return false;

        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return false;

        var entity = await repository.Appointment.FindByIdAsync(appointmentId);
        if (entity is null || !entity.IsActive || entity.DoctorId != doctor.Id) return false;
        if (entity.Status.Equals(normalizedStatus, StringComparison.OrdinalIgnoreCase)) return true;
        if (!entity.Status.Equals("Scheduled", StringComparison.OrdinalIgnoreCase) ||
            normalizedStatus.Equals("Scheduled", StringComparison.OrdinalIgnoreCase)) return false;

        entity.Status = AllowedStatuses.Single(allowed =>
            allowed.Equals(normalizedStatus, StringComparison.OrdinalIgnoreCase));
        UpdateAutoFields(entity);
        return await repository.Appointment.UpdateAsync(entity);
    }

    private async Task<bool> IsValidPatientAsync(int patientId)
    {
        if (patientId <= 0) return false;
        return await repository.Patient.AnyAsync(patient => patient.Id == patientId && patient.IsActive);
    }

    private async Task<bool> HasScheduleConflictAsync(
        int doctorId,
        int patientId,
        DateTime dateTime,
        int? excludedAppointmentId = null)
    {
        return await repository.Appointment.AnyAsync(appointment =>
            appointment.IsActive &&
            appointment.Id != excludedAppointmentId &&
            appointment.DateTime == dateTime &&
            !appointment.Status.Equals("Cancelled") &&
            (appointment.DoctorId == doctorId || appointment.PatientId == patientId));
    }

    private static bool IsValidAppointmentDate(DateTime dateTime) =>
        dateTime != default && dateTime >= DateTime.Now.AddMinutes(-1);

    private static DateTime ToLocalDateTime(DateTime dateTime) =>
        dateTime.Kind == DateTimeKind.Utc ? dateTime.ToLocalTime() : dateTime;

    private static string NormalizeType(string? type) =>
        string.IsNullOrWhiteSpace(type) ? "New Visit" : type.Trim();
}
