using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.DrugDurationTemplate;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class DrugDurationTemplateService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IDrugDurationTemplateService
{
    public async Task<PaginatedListViewModel<DrugDurationTemplateViewModel>?> GetListAsync(int take, int skip)
    {
        int? doctorId = null;
        if (CurrentUser is not null)
        {
            var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
            if (doctor is not null)
            {
                doctorId = doctor.Id;
            }
        }

        var list = await repository.DrugDurationTemplate.GetListAsync(take, skip, doctorId);
        var listAsList = list.ToList();

        var viewModels = mapper.Map<List<DrugDurationTemplateViewModel>>(listAsList);

        for (int i = 0; i < viewModels.Count; i++)
        {
            viewModels[i].EncryptedId = encryptionHelper.Encrypt(listAsList[i].Id.ToString());
        }

        return new PaginatedListViewModel<DrugDurationTemplateViewModel>(take)
        {
            ItemList = viewModels
        };
    }

    public async Task<DrugDurationTemplateViewModel?> GetDetailsAsync(string encryptedId)
    {
        var entity = await repository.DrugDurationTemplate.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
        return mapper.Map<DrugDurationTemplateViewModel>(entity);
    }

    public async Task<DrugDurationTemplateDto?> GetByIdAsync(string encryptedId)
    {
        var entity = await repository.DrugDurationTemplate.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (entity is not null)
        {
            entity.EncryptedId = encryptedId;
            return mapper.Map<DrugDurationTemplateDto>(entity);
        }
        return default;
    }

    public async Task<bool> CreateAsync(DrugDurationTemplateDto dto)
    {
        var entity = mapper.Map<DrugDurationTemplate>(dto);
        if (!string.IsNullOrEmpty(dto.DoctorEncryptedId))
        {
            entity.DoctorId = encryptionHelper.Decrypt(dto.DoctorEncryptedId);
        }
        else if (CurrentUser is not null)
        {
            var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
            if (doctor is not null)
            {
                entity.DoctorId = doctor.Id;
            }
        }

        CreateAutoFields(entity);
        return await repository.DrugDurationTemplate.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(DrugDurationTemplateDto dto)
    {
        var encryptedId = dto.EncryptedId ?? string.Empty;
        var id = encryptionHelper.Decrypt(encryptedId);
        var existing = await repository.DrugDurationTemplate.FindByIdAsync(id);
        if (existing is null)
            return false;

        mapper.Map(dto, existing);
        existing.Id = id; // Maintain integrity

        if (!string.IsNullOrEmpty(dto.DoctorEncryptedId))
        {
            existing.DoctorId = encryptionHelper.Decrypt(dto.DoctorEncryptedId);
        }
        UpdateAutoFields(existing);

        return await repository.DrugDurationTemplate.UpdateAsync(existing);
    }

    public async Task<bool> ChangeActiveAsync(string encryptedId)
    {
        var existing = await repository.DrugDurationTemplate.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (existing is not null)
        {
            existing.IsActive = !existing.IsActive;
            UpdateAutoFields(existing);
            return await repository.DrugDurationTemplate.UpdateAsync(existing);
        }
        return false;
    }

    public async Task<List<DrugDurationTemplateDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId)
    {
        var doctorId = encryptionHelper.Decrypt(encryptedDoctorId);
        var list = await repository.DrugDurationTemplate.GetActiveByDoctorIdAsync(doctorId);
        return mapper.Map<List<DrugDurationTemplateDto>>(list);
    }

    public async Task<List<DrugDurationTemplateDto>> GetActiveForCurrentUserAsync()
    {
        if (CurrentUser is null) return [];
        var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
        if (doctor is null) return [];
        var list = await repository.DrugDurationTemplate.GetActiveByDoctorIdAsync(doctor.Id);
        return mapper.Map<List<DrugDurationTemplateDto>>(list);
    }
}
