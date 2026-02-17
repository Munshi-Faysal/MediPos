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

    public async Task<bool> CreateAsync(PrescriptionDto dto)
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

        if (!string.IsNullOrEmpty(dto.PatientEncryptedId))
        {
            // Try to decrypt, if it fails, try to parse as integer (for non-encrypted IDs)
            try
            {
                entity.PatientId = encryptionHelper.Decrypt(dto.PatientEncryptedId);
            }
            catch
            {
                // If decryption fails, try direct conversion (fallback for plain IDs)
                if (int.TryParse(dto.PatientEncryptedId, out int patientId))
                {
                    entity.PatientId = patientId;
                }
            }
        }

        if (!string.IsNullOrEmpty(dto.AppointmentEncryptedId))
        {
            entity.AppointmentId = encryptionHelper.Decrypt(dto.AppointmentEncryptedId);
        }

        // Handle Medicines
        foreach (var medDto in dto.Medicines)
        {
            var medEntity = mapper.Map<PrescriptionMedicine>(medDto);
            if (!string.IsNullOrEmpty(medDto.MedicineEncryptedId))
            {
                // Try to decrypt, if it fails, try to parse as integer
                try
                {
                    medEntity.DrugDetailId = encryptionHelper.Decrypt(medDto.MedicineEncryptedId);
                }
                catch
                {
                    // If decryption fails, try direct conversion (fallback for plain IDs)
                    if (int.TryParse(medDto.MedicineEncryptedId, out int medicineId))
                    {
                        medEntity.DrugDetailId = medicineId;
                    }
                }
            }
            CreateAutoFields(medEntity);
            entity.Medicines.Add(medEntity);
        }

        CreateAutoFields(entity);
        return await repository.Prescription.InsertAsync(entity);
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
