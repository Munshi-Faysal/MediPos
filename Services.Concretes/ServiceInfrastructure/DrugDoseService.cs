using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class DrugDoseService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IDrugDoseService
{
    public async Task<PaginatedListViewModel<DrugDoseViewModel>?> GetListAsync(int take, int skip)
    {
        var list = await repository.DrugDose.GetListAsync(take, skip);
        var listAsList = list.ToList();

        var viewModels = mapper.Map<List<DrugDoseViewModel>>(listAsList);

        for (int i = 0; i < viewModels.Count; i++)
        {
            viewModels[i].EncryptedId = encryptionHelper.Encrypt(listAsList[i].Id.ToString());
        }

        return new PaginatedListViewModel<DrugDoseViewModel>(take)
        {
            ItemList = viewModels
        };
    }

    public async Task<DrugDoseViewModel?> GetDetailsAsync(string encryptedId)
    {
        var entity = await repository.DrugDose.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
        return mapper.Map<DrugDoseViewModel>(entity);
    }

    public async Task<DrugDoseDto?> GetByIdAsync(string encryptedId)
    {
        var entity = await repository.DrugDose.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (entity is not null)
        {
            entity.EncryptedId = encryptedId;
            return mapper.Map<DrugDoseDto>(entity);
        }
        return default;
    }

    public async Task<bool> CreateAsync(DrugDoseDto dto)
    {
        var entity = mapper.Map<DrugDose>(dto);
        if (!string.IsNullOrEmpty(dto.DoctorEncryptedId))
        {
            entity.DoctorId = encryptionHelper.Decrypt(dto.DoctorEncryptedId);
        }
        CreateAutoFields(entity);
        return await repository.DrugDose.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(DrugDoseDto dto)
    {
        var encryptedId = dto.EncryptedId ?? string.Empty;
        var id = encryptionHelper.Decrypt(encryptedId);
        var existing = await repository.DrugDose.FindByIdAsync(id);
        if (existing is null)
            return false;

        mapper.Map(dto, existing);
        if (!string.IsNullOrEmpty(dto.DoctorEncryptedId))
        {
            existing.DoctorId = encryptionHelper.Decrypt(dto.DoctorEncryptedId);
        }
        UpdateAutoFields(existing);

        return await repository.DrugDose.UpdateAsync(existing);
    }

    public async Task<bool> ChangeActiveAsync(string encryptedId)
    {
        var existing = await repository.DrugDose.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (existing is not null)
        {
            existing.IsActive = !existing.IsActive;
            UpdateAutoFields(existing);
            return await repository.DrugDose.UpdateAsync(existing);
        }
        return false;
    }

    public async Task<List<DrugDoseDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId)
    {
        var doctorId = encryptionHelper.Decrypt(encryptedDoctorId);
        var list = await repository.DrugDose.GetActiveByDoctorIdAsync(doctorId);
        return mapper.Map<List<DrugDoseDto>>(list);
    }

    public async Task<List<DrugDoseDto>> GetActiveForCurrentUserAsync()
    {
        if (CurrentUser is null) return [];
        var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
        if (doctor is null) return [];
        var list = await repository.DrugDose.GetActiveByDoctorIdAsync(doctor.Id);
        return mapper.Map<List<DrugDoseDto>>(list);
    }
}
