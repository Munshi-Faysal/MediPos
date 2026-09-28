using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.MainDTOs.Patient;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class PatientService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IPatientService
{
    private static bool IsValidId(string? id) =>
        !string.IsNullOrWhiteSpace(id) && id != "null" && id != "undefined";

    private int ResolveId(string? id)
    {
        if (!IsValidId(id)) return 0;

        var decryptedId = encryptionHelper.Decrypt(id!);
        if (decryptedId > 0) return decryptedId;

        return int.TryParse(id, out var numericId) ? numericId : 0;
    }

    private PatientViewModel ToViewModel(Patient patient, DateTime? lastPrescriptionDate = null)
    {
        var viewModel = mapper.Map<PatientViewModel>(patient);
        viewModel.EncryptedId = encryptionHelper.Encrypt(patient.Id.ToString());
        var lastAppointmentDate = patient.Appointments
            .Where(appointment => appointment.DateTime <= DateTime.Now &&
                !appointment.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase))
            .Select(appointment => (DateTime?)appointment.DateTime)
            .Max();
        viewModel.LastVisit = new[] { lastAppointmentDate, lastPrescriptionDate }.Max();
        return viewModel;
    }

    public async Task<IEnumerable<PatientViewModel>> GetAllPatientsAsync(int take = 50)
    {
        var patients = (await repository.Patient.SearchPatientsAsync(null!, take)).ToList();
        var prescriptionDates = await repository.Prescription
            .GetLastPrescriptionDatesByPatientIdsAsync(patients.Select(patient => patient.Id));
        return patients
            .Select(patient => ToViewModel(
                patient,
                prescriptionDates.GetValueOrDefault(patient.Id)))
            .ToList();
    }

    public async Task<IEnumerable<PatientViewModel>> SearchPatientsAsync(string term, int take = 50)
    {
        var patients = (await repository.Patient.SearchPatientsAsync(term, take)).ToList();
        var prescriptionDates = await repository.Prescription
            .GetLastPrescriptionDatesByPatientIdsAsync(patients.Select(patient => patient.Id));
        return patients
            .Select(patient => ToViewModel(
                patient,
                prescriptionDates.GetValueOrDefault(patient.Id)))
            .ToList();
    }

    public async Task<PatientViewModel?> GetByIdAsync(string encryptedId)
    {
        var id = ResolveId(encryptedId);
        if (id == 0) return null;
        var entity = await repository.Patient.FindByIdAsync(id);
        if (entity is null || !entity.IsActive) return null;

        var appointments = await repository.Appointment.GetAppointmentsByPatientIdAsync(id);
        entity.Appointments = appointments.ToList();
        return ToViewModel(entity);
    }

    public async Task<PatientDetailsViewModel?> GetDetailsAsync(string encryptedId)
    {
        var id = ResolveId(encryptedId);
        if (id == 0) return null;

        var patient = await repository.Patient.FindByIdAsync(id);
        if (patient is null || !patient.IsActive) return null;

        var appointments = (await repository.Appointment.GetAppointmentsByPatientIdAsync(id)).ToList();
        var prescriptions = (await repository.Prescription.GetPrescriptionsByPatientIdAsync(id)).ToList();
        var prescriptionAppointmentIds = prescriptions
            .Where(prescription => prescription.AppointmentId.HasValue)
            .Select(prescription => prescription.AppointmentId!.Value)
            .ToHashSet();

        var prescriptionVisits = prescriptions.Select(prescription => new PatientVisitViewModel
        {
            Date = prescription.PrescriptionDate,
            Diagnosis = prescription.Diagnosis ?? prescription.Disease,
            Doctor = prescription.Doctor?.Name,
            Status = prescription.Status ?? "Completed",
            PrescriptionEncryptedId = encryptionHelper.Encrypt(prescription.Id.ToString())
        });

        var appointmentVisits = appointments
            .Where(appointment => appointment.DateTime <= DateTime.Now &&
                !prescriptionAppointmentIds.Contains(appointment.Id) &&
                !appointment.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase))
            .Select(appointment => new PatientVisitViewModel
            {
                Date = appointment.DateTime,
                Diagnosis = appointment.Reason,
                Doctor = appointment.Doctor?.Name,
                Status = appointment.Status
            });

        var history = prescriptionVisits
            .Concat(appointmentVisits)
            .OrderByDescending(visit => visit.Date)
            .ToList();

        patient.Appointments = appointments;
        var basicDetails = ToViewModel(patient);
        var nextAppointment = appointments
            .Where(appointment => appointment.DateTime >= DateTime.Now &&
                !appointment.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase) &&
                !appointment.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            .OrderBy(appointment => appointment.DateTime)
            .FirstOrDefault();

        return new PatientDetailsViewModel
        {
            Id = patient.Id,
            EncryptedId = basicDetails.EncryptedId,
            IsActive = patient.IsActive,
            Name = patient.Name,
            Age = patient.Age,
            Gender = patient.Gender,
            Phone = patient.Phone,
            Email = patient.Email,
            BloodGroup = patient.BloodGroup,
            Address = patient.Address,
            Image = patient.Image,
            LastVisit = history.Select(visit => (DateTime?)visit.Date).Max(),
            TotalVisits = appointments.Count(appointment =>
                    appointment.DateTime <= DateTime.Now &&
                    !appointment.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase)) +
                prescriptions.Count(prescription => !prescription.AppointmentId.HasValue),
            PrescriptionCount = prescriptions.Count,
            NextAppointment = nextAppointment?.DateTime,
            LatestWeight = prescriptions
                .OrderByDescending(prescription => prescription.PrescriptionDate)
                .Select(prescription => prescription.PatientWeight)
                .FirstOrDefault(weight => !string.IsNullOrWhiteSpace(weight)),
            VisitHistory = history
        };
    }

    public async Task<PatientViewModel?> GetByPhoneAsync(string phone)
    {
        var entity = await repository.Patient.GetPatientByPhoneAsync(phone.Trim());
        if (entity is null) return null;

        var viewModel = mapper.Map<PatientViewModel>(entity);
        viewModel.EncryptedId = encryptionHelper.Encrypt(entity.Id.ToString());
        return viewModel;
    }

    public async Task<PatientViewModel?> CreateAsync(PatientDto dto)
    {
        dto.Name = dto.Name.Trim();
        dto.Phone = dto.Phone.Trim();
        if (await repository.Patient.GetPatientByPhoneAsync(dto.Phone) is not null) return null;

        var entity = mapper.Map<Patient>(dto);
        CreateAutoFields(entity);
        entity.IsActive = true;
        var inserted = await repository.Patient.GetInsertedObjAsync(entity);
        if (inserted is null) return null;

        var viewModel = mapper.Map<PatientViewModel>(inserted);
        viewModel.EncryptedId = encryptionHelper.Encrypt(inserted.Id.ToString());
        return viewModel;
    }

    public async Task<bool> UpdateAsync(PatientDto dto)
    {
        var id = ResolveId(dto.EncryptedId);
        if (id == 0) return false;
        var existing = await repository.Patient.FindByIdAsync(id);
        if (existing is null || !existing.IsActive) return false;

        var duplicate = await repository.Patient.GetPatientByPhoneAsync(dto.Phone.Trim());
        if (duplicate is not null && duplicate.Id != id) return false;

        existing.Name = dto.Name.Trim();
        existing.Age = dto.Age;
        existing.Gender = dto.Gender;
        existing.Phone = dto.Phone.Trim();
        existing.Email = dto.Email?.Trim();
        existing.BloodGroup = dto.BloodGroup;
        existing.Address = dto.Address?.Trim();
        existing.Image = dto.Image;
        UpdateAutoFields(existing);
        return await repository.Patient.UpdateAsync(existing);
    }

    public async Task<bool> DeleteAsync(string encryptedId)
    {
        var id = ResolveId(encryptedId);
        if (id == 0) return false;

        var existing = await repository.Patient.FindByIdAsync(id);
        if (existing is null || !existing.IsActive) return false;

        // Preserve appointment and prescription history while removing the patient from active lists.
        existing.IsActive = false;
        UpdateAutoFields(existing);
        return await repository.Patient.UpdateAsync(existing);
    }
}
