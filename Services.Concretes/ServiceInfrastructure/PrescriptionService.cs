using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using System.Security.Cryptography;
using System.Globalization;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.MainDTOs.Prescription;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class PrescriptionService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IPrescriptionService
{
    public async Task<PrescriptionDto?> GetByIdAsync(string encryptedId)
    {
        var id = encryptionHelper.Decrypt(encryptedId);
        var entity = await repository.Prescription.GetPrescriptionDetailsAsync(id);
        if (entity is null) return null;

        var dto = mapper.Map<PrescriptionDto>(entity);
        dto.EncryptedId = encryptedId;
        dto.DoctorEncryptedId = encryptionHelper.Encrypt(entity.DoctorId.ToString());
        dto.PatientEncryptedId = encryptionHelper.Encrypt(entity.PatientId.ToString());
        dto.PatientName ??= entity.Patient?.Name;
        dto.PatientPhone ??= entity.Patient?.Phone;
        if (entity.AppointmentId.HasValue)
            dto.AppointmentEncryptedId = encryptionHelper.Encrypt(entity.AppointmentId.Value.ToString());

        for (int i = 0; i < entity.Medicines.Count; i++)
        {
            var medEntity = entity.Medicines.ElementAt(i);
            dto.Medicines[i].MedicineEncryptedId = encryptionHelper.Encrypt(medEntity.DrugDetailId.ToString());
            dto.Medicines[i].EncryptedId = encryptionHelper.Encrypt(medEntity.Id.ToString());
        }

        return dto;
    }

    public async Task<PrescriptionScanViewModel?> GetByScanTokenAsync(string scanToken)
    {
        if (string.IsNullOrWhiteSpace(scanToken) || scanToken.Length > 64)
            return null;

        var entity = await repository.Prescription.GetPrescriptionByScanTokenAsync(scanToken);
        if (entity is null) return null;

        return new PrescriptionScanViewModel
        {
            ScanToken = entity.ScanToken,
            PrescriptionDate = entity.PrescriptionDate,
            Status = entity.Status,
            DoctorName = entity.Doctor?.Name,
            DoctorTitle = entity.Doctor?.Title,
            DoctorSpecialization = entity.Doctor?.Specialization,
            DoctorLicenseNumber = entity.Doctor?.LicenseNumber,
            ClinicName = entity.Doctor?.ClinicName,
            ChamberAddress = entity.Doctor?.ChamberAddress,
            ChamberContact = entity.Doctor?.ChamberContact,
            PatientName = entity.PatientName,
            PatientAge = entity.PatientAge,
            PatientGender = entity.PatientGender,
            PatientWeight = entity.PatientWeight,
            PatientRegNo = entity.PatientRegNo,
            Disease = entity.Disease,
            ChiefComplaint = entity.ChiefComplaint,
            OnExamination = entity.OnExamination,
            Investigation = entity.Investigation,
            Advice = entity.Advice,
            DrugHistory = entity.DrugHistory,
            Diagnosis = entity.Diagnosis,
            Notes = entity.Notes,
            Medicines = entity.Medicines.Select(medicine => new PrescriptionScanMedicineViewModel
            {
                MedicineName = medicine.DrugDetail?.DrugMaster?.Name,
                DrugTypeName = medicine.DrugDetail?.DrugType?.Name,
                StrengthName = medicine.DrugDetail?.DrugStrength?.Quantity,
                Dosage = medicine.Dosage,
                Frequency = medicine.Frequency,
                Duration = medicine.Duration,
                Instructions = medicine.Instructions
            }).ToList()
        };
    }

    public async Task<PrescriptionScanViewModel?> GetByBarcodeCodeAsync(string barcodeCode)
    {
        // The 16 decimal digits encode the first 52 random bits of the scan token.
        if (barcodeCode.Length != 16 || barcodeCode.Any(c => c < '0' || c > '9') ||
            !ulong.TryParse(barcodeCode, NumberStyles.None, CultureInfo.InvariantCulture, out var value) ||
            value >= (1UL << 52))
            return null;

        var prefix = value.ToString("x13", CultureInfo.InvariantCulture);
        var entity = await repository.Prescription.GetPrescriptionByBarcodePrefixAsync(prefix);
        return entity is null ? null : await GetByScanTokenAsync(entity.ScanToken);
    }

    public async Task<IEnumerable<PrescriptionViewModel>> GetPrescriptionsByDoctorAsync()
    {
        if (CurrentUser is null) 
        {
            Console.WriteLine("DEBUG: CurrentUser is null");
            return [];
        }
        
        var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
        if (doctor is null) 
        {
            Console.WriteLine($"DEBUG: Doctor not found for UserId: {CurrentUser.Id}");
            return [];
        }

        Console.WriteLine($"DEBUG: Fetching prescriptions for Doctor ID: {doctor.Id}");
        var list = await repository.Prescription.GetPrescriptionsByDoctorIdAsync(doctor.Id);
        Console.WriteLine($"DEBUG: Found {list.Count()} prescriptions in DB");

        var viewModels = mapper.Map<List<PrescriptionViewModel>>(list);

        var listAsList = list.ToList();
        for (int i = 0; i < viewModels.Count; i++)
        {
            var p = listAsList[i];
            Console.WriteLine($"DEBUG: Prescription {p.Id} has {p.Medicines.Count} medicines.");
            viewModels[i].EncryptedId = encryptionHelper.Encrypt(p.Id.ToString());
            viewModels[i].MedicinesCount = p.Medicines.Count;
        }

        return viewModels;
    }

    public async Task<PrescriptionDto?> CreateAsync(PrescriptionDto dto)
    {
        var entity = mapper.Map<Prescription>(dto);
        for (var attempt = 0; attempt < 5; attempt++)
        {
            var candidate = GenerateScanToken();
            if (await repository.Prescription.BarcodePrefixExistsAsync(candidate[..13])) continue;
            entity.ScanToken = candidate;
            break;
        }
        if (string.IsNullOrEmpty(entity.ScanToken))
            throw new InvalidOperationException("Could not generate a unique prescription barcode.");
        
        if (CurrentUser is not null)
        {
            var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
            if (doctor is not null)
            {
                entity.DoctorId = doctor.Id;
            }
        }

        var patientId = ResolveId(dto.PatientEncryptedId);
        if (patientId <= 0 || !await repository.Patient.AnyAsync(patient => patient.Id == patientId))
            throw new ArgumentException("The selected patient could not be found. Please select the patient again.");
        entity.PatientId = patientId;

        if (!string.IsNullOrEmpty(dto.AppointmentEncryptedId))
        {
            var appointmentId = ResolveId(dto.AppointmentEncryptedId);
            if (appointmentId <= 0 || !await repository.Appointment.AnyAsync(appointment => appointment.Id == appointmentId))
                throw new ArgumentException("The selected appointment could not be found.");
            entity.AppointmentId = appointmentId;
        }

        // Handle Medicines
        foreach (var medDto in dto.Medicines)
        {
            var medEntity = mapper.Map<PrescriptionMedicine>(medDto);
            var medicineId = ResolveId(medDto.MedicineEncryptedId);
            if (medicineId <= 0 || !await repository.DrugDetail.AnyAsync(medicine => medicine.Id == medicineId))
                throw new ArgumentException("One of the selected medicines could not be found. Please select it again.");
            medEntity.DrugDetailId = medicineId;

            CreateAutoFields(medEntity);
            entity.Medicines.Add(medEntity);
        }

        CreateAutoFields(entity);
        var inserted = await repository.Prescription.GetInsertedObjAsync(entity);
        if (inserted is null) return null;

        var created = mapper.Map<PrescriptionDto>(inserted);
        created.EncryptedId = encryptionHelper.Encrypt(inserted.Id.ToString());
        created.DoctorEncryptedId = encryptionHelper.Encrypt(inserted.DoctorId.ToString());
        created.PatientEncryptedId = encryptionHelper.Encrypt(inserted.PatientId.ToString());
        if (inserted.AppointmentId.HasValue)
            created.AppointmentEncryptedId = encryptionHelper.Encrypt(inserted.AppointmentId.Value.ToString());

        for (var i = 0; i < inserted.Medicines.Count; i++)
        {
            var medicine = inserted.Medicines.ElementAt(i);
            created.Medicines[i].EncryptedId = encryptionHelper.Encrypt(medicine.Id.ToString());
            created.Medicines[i].MedicineEncryptedId = encryptionHelper.Encrypt(medicine.DrugDetailId.ToString());
        }

        return created;
    }

    private static string GenerateScanToken()
    {
        return Convert.ToHexString(RandomNumberGenerator.GetBytes(16)).ToLowerInvariant();
    }

    private int ResolveId(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return 0;

        // Several existing list endpoints expose numeric IDs, while detail endpoints use protected IDs.
        // Parse a plain ID first because EncryptionHelper.Decrypt returns 0 instead of throwing on invalid input.
        if (int.TryParse(value, out var plainId) && plainId > 0)
            return plainId;

        return encryptionHelper.Decrypt(value);
    }

    public async Task<PrescriptionDto?> UpdateAsync(PrescriptionDto dto)
    {
        var id = encryptionHelper.Decrypt(dto.EncryptedId!);
        if (id <= 0) return null;

        var existing = await repository.Prescription.GetPrescriptionForUpdateAsync(id);
        if (existing is null) return null;

        var patientId = ResolveId(dto.PatientEncryptedId);
        if (patientId <= 0 || !await repository.Patient.AnyAsync(patient => patient.Id == patientId))
            throw new ArgumentException("The selected patient could not be found. Please select the patient again.");

        int? appointmentId = null;
        if (!string.IsNullOrWhiteSpace(dto.AppointmentEncryptedId))
        {
            var resolvedAppointmentId = ResolveId(dto.AppointmentEncryptedId);
            if (resolvedAppointmentId <= 0 || !await repository.Appointment.AnyAsync(appointment => appointment.Id == resolvedAppointmentId))
                throw new ArgumentException("The selected appointment could not be found.");
            appointmentId = resolvedAppointmentId;
        }

        mapper.Map(dto, existing);
        existing.Id = id;
        existing.PatientId = patientId;
        existing.AppointmentId = appointmentId;

        existing.Medicines.Clear();
        foreach (var medDto in dto.Medicines)
        {
            var medicineId = ResolveId(medDto.MedicineEncryptedId);
            if (medicineId <= 0 || !await repository.DrugDetail.AnyAsync(medicine => medicine.Id == medicineId))
                throw new ArgumentException("One of the selected medicines could not be found. Please select it again.");

            var medicine = mapper.Map<PrescriptionMedicine>(medDto);
            medicine.PrescriptionId = id;
            medicine.DrugDetailId = medicineId;
            CreateAutoFields(medicine);
            existing.Medicines.Add(medicine);
        }

        UpdateAutoFields(existing);
        var updated = await repository.Prescription.UpdateAsync(existing);
        return updated ? await GetByIdAsync(dto.EncryptedId!) : null;
    }

    public async Task<bool> DeleteAsync(string encryptedId)
    {
        var id = encryptionHelper.Decrypt(encryptedId);
        var existing = await repository.Prescription.FindByIdAsync(id);
        if (existing is null) return false;

        return await repository.Prescription.DeleteAsync(existing);
    }
}
