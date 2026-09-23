using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
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

    private int ResolveId(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return 0;

        // Several existing list endpoints expose numeric IDs, while detail endpoints use protected IDs.
        // Parse a plain ID first because EncryptionHelper.Decrypt returns 0 instead of throwing on invalid input.
        if (int.TryParse(value, out var plainId) && plainId > 0)
            return plainId;

        return encryptionHelper.Decrypt(value);
    }

    public async Task<bool> UpdateAsync(PrescriptionDto dto)
    {
        var id = encryptionHelper.Decrypt(dto.EncryptedId!);
        var existing = await repository.Prescription.GetPrescriptionDetailsAsync(id);
        if (existing is null) return false;

        mapper.Map(dto, existing);
        existing.Id = id;

        // Simplified: Clear and Re-add medicines for update if needed, 
        // or more complex logic to update existing ones.
        // For now, let's just update header fields. 
        // Real implementation usually replaces the collection or updates by ID.
        
        UpdateAutoFields(existing);
        return await repository.Prescription.UpdateAsync(existing);
    }

    public async Task<bool> DeleteAsync(string encryptedId)
    {
        var id = encryptionHelper.Decrypt(encryptedId);
        var existing = await repository.Prescription.FindByIdAsync(id);
        if (existing is null) return false;

        return await repository.Prescription.DeleteAsync(existing);
    }
}
