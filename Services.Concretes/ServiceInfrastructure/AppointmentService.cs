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
    private bool IsValidId(string? id) => !string.IsNullOrWhiteSpace(id) && id != "null" && id != "undefined";

    public async Task<IEnumerable<AppointmentViewModel>> GetAppointmentsByDoctorIdAsync(string doctorEncryptedId)
    {
        if (!IsValidId(doctorEncryptedId)) return [];
        var doctorId = encryptionHelper.Decrypt(doctorEncryptedId);
        var appointments = await repository.Appointment.GetAppointmentsByDoctorIdAsync(doctorId);
        return mapper.Map<IEnumerable<AppointmentViewModel>>(appointments);
    }

    public async Task<IEnumerable<AppointmentViewModel>> GetAppointmentsByCurrentDoctorAsync()
    {
        if (CurrentUser is null) return [];
        var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
        if (doctor is null) return [];
        var appointments = await repository.Appointment.GetAppointmentsByDoctorIdAsync(doctor.Id);
        return mapper.Map<IEnumerable<AppointmentViewModel>>(appointments);
    }

    public async Task<IEnumerable<AppointmentViewModel>> GetAppointmentsByDateAsync(string doctorEncryptedId, DateTime date)
    {
        if (!IsValidId(doctorEncryptedId)) return [];
        var doctorId = encryptionHelper.Decrypt(doctorEncryptedId);
        var appointments = await repository.Appointment.GetAppointmentsByDateAsync(doctorId, date);
        return mapper.Map<IEnumerable<AppointmentViewModel>>(appointments);
    }

    public async Task<IEnumerable<AppointmentViewModel>> GetAppointmentsByCurrentDoctorAndDateAsync(DateTime date)
    {
        if (CurrentUser is null) return [];
        var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
        if (doctor is null) return [];
        var appointments = await repository.Appointment.GetAppointmentsByDateAsync(doctor.Id, date);
        return mapper.Map<IEnumerable<AppointmentViewModel>>(appointments);
    }

    public async Task<AppointmentViewModel?> GetByIdAsync(string encryptedId)
    {
        if (!IsValidId(encryptedId)) return null;
        var id = encryptionHelper.Decrypt(encryptedId);
        var entity = await repository.Appointment.FindByIdAsync(id);
        return entity == null ? null : mapper.Map<AppointmentViewModel>(entity);
    }

    public async Task<bool> CreateAsync(AppointmentDto dto)
    {
        var entity = mapper.Map<Appointment>(dto);
        CreateAutoFields(entity);
        entity.IsActive = true;
        return await repository.Appointment.InsertAsync(entity);
    }

    public async Task<bool> UpdateStatusAsync(string encryptedId, string status)
    {
        if (!IsValidId(encryptedId)) return false;
        var id = encryptionHelper.Decrypt(encryptedId);
        var entity = await repository.Appointment.FindByIdAsync(id);
        if (entity == null) return false;

        entity.Status = status;
        UpdateAutoFields(entity);
        return await repository.Appointment.UpdateAsync(entity);
    }
}
