using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.OnExamination;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class OnExaminationService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IOnExaminationService
{
    public async Task<PaginatedListViewModel<OnExaminationViewModel>?> GetListAsync(int take, int skip)
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

        var list = await repository.OnExamination.GetListAsync(take, skip, doctorId);
        var listAsList = list.ToList();

        var viewModels = mapper.Map<List<OnExaminationViewModel>>(listAsList);

        for (int i = 0; i < viewModels.Count; i++)
        {
            viewModels[i].EncryptedId = encryptionHelper.Encrypt(listAsList[i].Id.ToString());
        }

        return new PaginatedListViewModel<OnExaminationViewModel>(take)
        {
            ItemList = viewModels
        };
    }

    public async Task<OnExaminationViewModel?> GetDetailsAsync(string encryptedId)
    {
        var entity = await repository.OnExamination.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
        return mapper.Map<OnExaminationViewModel>(entity);
    }

    public async Task<OnExaminationDto?> GetByIdAsync(string encryptedId)
    {
        var entity = await repository.OnExamination.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (entity is not null)
        {
            entity.EncryptedId = encryptedId;
            return mapper.Map<OnExaminationDto>(entity);
        }
        return default;
    }

    public async Task<bool> CreateAsync(OnExaminationDto dto)
    {
        var entity = mapper.Map<OnExamination>(dto);
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
        return await repository.OnExamination.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(OnExaminationDto dto)
    {
        var encryptedId = dto.EncryptedId ?? string.Empty;
        var id = encryptionHelper.Decrypt(encryptedId);
        var existing = await repository.OnExamination.FindByIdAsync(id);
        if (existing is null)
            return false;

        mapper.Map(dto, existing);
        existing.Id = id; // Maintain integrity

        if (!string.IsNullOrEmpty(dto.DoctorEncryptedId))
        {
            existing.DoctorId = encryptionHelper.Decrypt(dto.DoctorEncryptedId);
        }
        UpdateAutoFields(existing);

        return await repository.OnExamination.UpdateAsync(existing);
    }

    public async Task<bool> ChangeActiveAsync(string encryptedId)
    {
        var existing = await repository.OnExamination.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (existing is not null)
        {
            existing.IsActive = !existing.IsActive;
            UpdateAutoFields(existing);
            return await repository.OnExamination.UpdateAsync(existing);
        }
        return false;
    }

    public async Task<List<OnExaminationDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId)
    {
        var doctorId = encryptionHelper.Decrypt(encryptedDoctorId);
        var list = await repository.OnExamination.GetActiveByDoctorIdAsync(doctorId);
        return mapper.Map<List<OnExaminationDto>>(list);
    }

    public async Task<List<OnExaminationDto>> GetActiveForCurrentUserAsync()
    {
        if (CurrentUser is null) return [];
        var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
        if (doctor is null) return [];
        var list = await repository.OnExamination.GetActiveByDoctorIdAsync(doctor.Id);
        return mapper.Map<List<OnExaminationDto>>(list);
    }
}
