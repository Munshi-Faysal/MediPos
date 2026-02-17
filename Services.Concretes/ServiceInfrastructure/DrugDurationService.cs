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

internal sealed class DrugDurationService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IDrugDurationService
{
    public async Task<PaginatedListViewModel<DrugDurationViewModel>?> GetListAsync(int take, int skip)
    {
        var list = await repository.DrugDuration.GetListAsync(take, skip);
        var listAsList = list.ToList();

        var viewModels = mapper.Map<List<DrugDurationViewModel>>(listAsList);

        for (int i = 0; i < viewModels.Count; i++)
        {
            viewModels[i].EncryptedId = encryptionHelper.Encrypt(listAsList[i].Id.ToString());
        }

        return new PaginatedListViewModel<DrugDurationViewModel>(take)
        {
            ItemList = viewModels
        };
    }

    public async Task<DrugDurationViewModel?> GetDetailsAsync(string encryptedId)
    {
        var entity = await repository.DrugDuration.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
        return mapper.Map<DrugDurationViewModel>(entity);
    }

    public async Task<DrugDurationDto?> GetByIdAsync(string encryptedId)
    {
        var entity = await repository.DrugDuration.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (entity is not null)
        {
            entity.EncryptedId = encryptedId;
            return mapper.Map<DrugDurationDto>(entity);
        }
        return default;
    }

    public async Task<bool> CreateAsync(DrugDurationDto dto)
    {
        var entity = mapper.Map<DrugDuration>(dto);
        CreateAutoFields(entity);
        return await repository.DrugDuration.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(DrugDurationDto dto)
    {
        var encryptedId = dto.EncryptedId ?? string.Empty;
        var id = encryptionHelper.Decrypt(encryptedId);
        var existing = await repository.DrugDuration.FindByIdAsync(id);
        if (existing is null)
            return false;

        mapper.Map(dto, existing);
        UpdateAutoFields(existing);

        return await repository.DrugDuration.UpdateAsync(existing);
    }

    public async Task<bool> ChangeActiveAsync(string encryptedId)
    {
        var existing = await repository.DrugDuration.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (existing is not null)
        {
            existing.IsActive = !existing.IsActive;
            UpdateAutoFields(existing);
            return await repository.DrugDuration.UpdateAsync(existing);
        }
        return false;
    }

    public async Task<List<DrugDurationDto>> GetActiveListAsync()
    {
        var list = await repository.DrugDuration.GetActiveListAsync();
        return mapper.Map<List<DrugDurationDto>>(list);
    }

    public async Task<List<DrugDurationDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId)
    {
        var doctorId = encryptionHelper.Decrypt(encryptedDoctorId);
        var list = await repository.DrugDuration.GetActiveByDoctorIdAsync(doctorId);
        return mapper.Map<List<DrugDurationDto>>(list);
    }

    public async Task<List<DrugDurationDto>> GetActiveForCurrentUserAsync()
    {
        if (CurrentUser is null) return [];
        var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
        if (doctor is null) return [];
        var list = await repository.DrugDuration.GetActiveByDoctorIdAsync(doctor.Id);
        return mapper.Map<List<DrugDurationDto>>(list);
    }
}
