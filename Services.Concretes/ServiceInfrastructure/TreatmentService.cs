using AutoMapper;
using Shared.Cryptography;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.DTOs.MainDTOs.Treatment;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class TreatmentService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), ITreatmentService
{
    private bool IsValidId(string? id) => !string.IsNullOrWhiteSpace(id) && id != "null" && id != "undefined";

    public async Task<IEnumerable<TreatmentTemplateViewModel>> GetTemplatesByDoctorIdAsync(string doctorEncryptedId)
    {
        if (!IsValidId(doctorEncryptedId)) return [];
        var doctorId = encryptionHelper.Decrypt(doctorEncryptedId);
        var templates = await repository.Treatment.GetTemplatesByDoctorIdAsync(doctorId);
        
        return templates.Select(t => new TreatmentTemplateViewModel
        {
            EncryptedId = encryptionHelper.Encrypt(t.Id.ToString()),
            Name = t.Name,
            DrugCount = t.TreatmentDrugs.Count,
            CreatedDate = t.CreatedDate
        });
    }

    public async Task<IEnumerable<TreatmentTemplateViewModel>> GetTemplatesByCurrentDoctorAsync()
    {
        if (CurrentUser is null) return [];
        var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
        if (doctor is null) return [];
        var templates = await repository.Treatment.GetTemplatesByDoctorIdAsync(doctor.Id);

        return templates.Select(t => new TreatmentTemplateViewModel
        {
            EncryptedId = encryptionHelper.Encrypt(t.Id.ToString()),
            Name = t.Name,
            DrugCount = t.TreatmentDrugs.Count,
            CreatedDate = t.CreatedDate
        });
    }

    public async Task<TreatmentTemplateViewModel?> GetTemplateWithDrugsAsync(string templateEncryptedId)
    {
        if (!IsValidId(templateEncryptedId)) return null;
        var id = encryptionHelper.Decrypt(templateEncryptedId);
        var entity = await repository.Treatment.GetTemplateWithDrugsAsync(id);
        if (entity == null) return null;

        return new TreatmentTemplateViewModel
        {
            EncryptedId = encryptionHelper.Encrypt(entity.Id.ToString()),
            Name = entity.Name,
            DrugCount = entity.TreatmentDrugs.Count,
            CreatedDate = entity.CreatedDate,
            TreatmentDrugs = entity.TreatmentDrugs.Select(td => new TreatmentDrugViewModel
            {
                EncryptedId = encryptionHelper.Encrypt(td.Id.ToString()),
                DrugDetailEncryptedId = encryptionHelper.Encrypt(td.DrugDetailId.ToString()),
                BrandName = td.DrugDetail?.DrugMaster?.Name,
                GenericName = td.DrugDetail?.DrugMaster?.Generic?.Name,
                Strength = td.DrugDetail?.DrugStrength?.Quantity,
                Type = td.DrugDetail?.DrugType?.Name,
                Company = td.DrugDetail?.DrugMaster?.DrugCompany?.Name,
                Dose = td.Dose,
                Duration = td.Duration,
                DurationType = td.DurationType,
                Instruction = td.Instruction,
                InstructionText = td.InstructionText
            }).ToList()
        };
    }

    public async Task<bool> CreateTemplateAsync(TreatmentTemplateDto dto)
    {
        var doctorId = dto.DoctorId;
        if (doctorId == 0 && IsValidId(dto.DoctorEncryptedId))
        {
            doctorId = encryptionHelper.Decrypt(dto.DoctorEncryptedId!);
        }

        var entity = new TreatmentTemplate
        {
            Name = dto.Name,
            DoctorId = doctorId,
            IsActive = true
        };
        CreateAutoFields(entity);

        foreach (var drugDto in dto.TreatmentDrugs)
        {
            var drugDetailId = drugDto.DrugDetailId;
            if (drugDetailId == 0 && IsValidId(drugDto.DrugDetailEncryptedId))
            {
                drugDetailId = encryptionHelper.Decrypt(drugDto.DrugDetailEncryptedId!);
            }

            var drugEntity = new TreatmentDrug
            {
                DrugDetailId = drugDetailId,
                Dose = drugDto.Dose,
                Duration = drugDto.Duration,
                DurationType = drugDto.DurationType,
                Instruction = drugDto.Instruction,
                InstructionText = drugDto.InstructionText,
                IsActive = true
            };
            CreateAutoFields(drugEntity);
            entity.TreatmentDrugs.Add(drugEntity);
        }

        return await repository.Treatment.InsertAsync(entity);
    }

    public async Task<bool> UpdateTemplateAsync(TreatmentTemplateDto dto)
    {
        var id = dto.Id ?? 0;
        if (id == 0 && IsValidId(dto.EncryptedId))
        {
            id = encryptionHelper.Decrypt(dto.EncryptedId!);
        }

        var entity = await repository.Treatment.GetTemplateWithDrugsAsync(id);
        if (entity == null) return false;

        entity.Name = dto.Name;
        UpdateAutoFields(entity);

        // Remove old drugs
        if (entity.TreatmentDrugs.Any())
        {
            await repository.TreatmentDrug.DeleteRangeAsync(entity.TreatmentDrugs);
            entity.TreatmentDrugs.Clear();
        }

        // Add new drugs
        foreach (var drugDto in dto.TreatmentDrugs)
        {
            var drugDetailId = drugDto.DrugDetailId;
            if (drugDetailId == 0 && IsValidId(drugDto.DrugDetailEncryptedId))
            {
                drugDetailId = encryptionHelper.Decrypt(drugDto.DrugDetailEncryptedId!);
            }

            var drugEntity = new TreatmentDrug
            {
                TreatmentTemplateId = entity.Id,
                DrugDetailId = drugDetailId,
                Dose = drugDto.Dose,
                Duration = drugDto.Duration,
                DurationType = drugDto.DurationType,
                Instruction = drugDto.Instruction,
                InstructionText = drugDto.InstructionText,
                IsActive = true
            };
            CreateAutoFields(drugEntity);
            entity.TreatmentDrugs.Add(drugEntity);
        }

        return await repository.Treatment.UpdateAsync(entity);
    }

    public async Task<bool> DeleteTemplateAsync(string templateEncryptedId)
    {
        if (!IsValidId(templateEncryptedId)) return false;
        var id = encryptionHelper.Decrypt(templateEncryptedId);
        var entity = await repository.Treatment.FindByIdAsync(id);
        if (entity == null) return false;

        entity.IsActive = false; // Soft delete
        UpdateAutoFields(entity);
        return await repository.Treatment.UpdateAsync(entity);
    }
}
