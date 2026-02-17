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

internal sealed class DrugAdviceService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IDrugAdviceService
{
    public async Task<PaginatedListViewModel<DrugAdviceViewModel>?> GetListAsync(int take, int skip)
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

        var list = await repository.DrugAdvice.GetListAsync(take, skip, doctorId);
        var listAsList = list.ToList();

        var viewModels = mapper.Map<List<DrugAdviceViewModel>>(listAsList);

        for (int i = 0; i < viewModels.Count; i++)
        {
            viewModels[i].EncryptedId = encryptionHelper.Encrypt(listAsList[i].Id.ToString());
        }

        return new PaginatedListViewModel<DrugAdviceViewModel>(take)
        {
            ItemList = viewModels
        };
    }

    public async Task<DrugAdviceViewModel?> GetDetailsAsync(string encryptedId)
    {
        var entity = await repository.DrugAdvice.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
        return mapper.Map<DrugAdviceViewModel>(entity);
    }

    public async Task<DrugAdviceDto?> GetByIdAsync(string encryptedId)
    {
        var entity = await repository.DrugAdvice.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (entity is not null)
        {
            entity.EncryptedId = encryptedId;
            return mapper.Map<DrugAdviceDto>(entity);
        }
        return default;
    }

    public async Task<bool> CreateAsync(DrugAdviceDto dto)
    {
        var entity = mapper.Map<DrugAdvice>(dto);
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
        return await repository.DrugAdvice.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(DrugAdviceDto dto)
    {
        var encryptedId = dto.EncryptedId ?? string.Empty;
        var id = encryptionHelper.Decrypt(encryptedId);
        var existing = await repository.DrugAdvice.FindByIdAsync(id);
        if (existing is null)
            return false;

        mapper.Map(dto, existing);
        if (!string.IsNullOrEmpty(dto.DoctorEncryptedId))
        {
            existing.DoctorId = encryptionHelper.Decrypt(dto.DoctorEncryptedId);
        }
        UpdateAutoFields(existing);

        return await repository.DrugAdvice.UpdateAsync(existing);
    }

    public async Task<bool> ChangeActiveAsync(string encryptedId)
    {
        var existing = await repository.DrugAdvice.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (existing is not null)
        {
            existing.IsActive = !existing.IsActive;
            UpdateAutoFields(existing);
            return await repository.DrugAdvice.UpdateAsync(existing);
        }
        return false;
    }

    public async Task<List<DrugAdviceDto>> GetActiveListAsync()
    {
        var list = await repository.DrugAdvice.GetActiveListAsync();
        return mapper.Map<List<DrugAdviceDto>>(list);
    }

    public async Task<List<DrugAdviceDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId)
    {
        var doctorId = encryptionHelper.Decrypt(encryptedDoctorId);
        var list = await repository.DrugAdvice.GetActiveByDoctorIdAsync(doctorId);
        return mapper.Map<List<DrugAdviceDto>>(list);
    }

    public async Task<List<DrugAdviceDto>> GetActiveForCurrentUserAsync()
    {
        if (CurrentUser is null) return [];
        var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
        if (doctor is null) return [];
        var list = await repository.DrugAdvice.GetActiveByDoctorIdAsync(doctor.Id);
        return mapper.Map<List<DrugAdviceDto>>(list);
    }
}
