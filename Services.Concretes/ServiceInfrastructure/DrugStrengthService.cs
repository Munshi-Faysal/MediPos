using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.InitDTOs;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class DrugStrengthService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IDrugStrengthService
{
    public async Task<PaginatedListViewModel<DrugStrengthViewModel>?> GetListAsync(int take, int skip)
    {
        var list = await repository.DrugStrength.GetListAsync(take, skip);
        var listAsList = list.ToList();

        var viewModels = mapper.Map<List<DrugStrengthViewModel>>(listAsList);

        for (int i = 0; i < viewModels.Count; i++)
        {
            viewModels[i].EncryptedId = encryptionHelper.Encrypt(listAsList[i].Id.ToString());
        }

        return new PaginatedListViewModel<DrugStrengthViewModel>(take)
        {
            ItemList = viewModels
        };
    }

    public async Task<DrugStrengthViewModel?> GetDetailsAsync(string encryptedId)
    {
        var entity = await repository.DrugStrength.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
        return mapper.Map<DrugStrengthViewModel>(entity);
    }

    public async Task<DrugStrengthDto?> GetByIdAsync(string encryptedId)
    {
        var entity = await repository.DrugStrength.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (entity is not null)
        {
            entity.EncryptedId = encryptedId;
            var dto = mapper.Map<DrugStrengthDto>(entity);
            if (entity.UnitId > 0)
                dto.UnitEncryptedId = encryptionHelper.Encrypt(entity.UnitId.ToString());
            return dto;
        }
        return default;
    }

    public async Task<bool> CreateAsync(DrugStrengthDto dto)
    {
        var entity = mapper.Map<DrugStrength>(dto);
        if (!string.IsNullOrEmpty(dto.UnitEncryptedId))
            entity.UnitId = encryptionHelper.Decrypt(dto.UnitEncryptedId);
        CreateAutoFields(entity);
        return await repository.DrugStrength.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(DrugStrengthDto dto)
    {
        var encryptedId = dto.EncryptedId ?? string.Empty;
        var id = encryptionHelper.Decrypt(encryptedId);
        var existing = await repository.DrugStrength.FindByIdAsync(id);
        if (existing is null)
            return false;

        mapper.Map(dto, existing);
        if (!string.IsNullOrEmpty(dto.UnitEncryptedId))
            existing.UnitId = encryptionHelper.Decrypt(dto.UnitEncryptedId);
        UpdateAutoFields(existing);

        return await repository.DrugStrength.UpdateAsync(existing);
    }

    public async Task<bool> ChangeActiveAsync(string encryptedId)
    {
        var existing = await repository.DrugStrength.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (existing is not null)
        {
            existing.IsActive = !existing.IsActive;
            UpdateAutoFields(existing);
            return await repository.DrugStrength.UpdateAsync(existing);
        }
        return false;
    }

    public async Task<List<DrugStrengthDto>> GetActiveListAsync()
    {
        var list = await repository.DrugStrength.GetActiveListAsync();
        return mapper.Map<List<DrugStrengthDto>>(list);
    }

    public async Task<List<DrugStrengthDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId)
    {
        var doctorId = encryptionHelper.Decrypt(encryptedDoctorId);
        var list = await repository.DrugStrength.GetActiveByDoctorIdAsync(doctorId);
        return mapper.Map<List<DrugStrengthDto>>(list);
    }

    public async Task<List<DrugStrengthDto>> GetActiveForCurrentUserAsync()
    {
        if (CurrentUser is null) return [];
        var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
        if (doctor is null) return [];
        var list = await repository.DrugStrength.GetActiveByDoctorIdAsync(doctor.Id);
        return mapper.Map<List<DrugStrengthDto>>(list);
    }

    public async Task<DrugStrengthInitDto> GetInitObjectAsync()
    {
        return new DrugStrengthInitDto
        {
            UnitList = await repository.Unit.GetDropdownItemsAsync()
        };
    }
}
