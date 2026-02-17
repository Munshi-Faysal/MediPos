using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Investigation;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class InvestigationService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IInvestigationService
{
    public async Task<PaginatedListViewModel<InvestigationViewModel>?> GetListAsync(int take, int skip)
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

        var list = await repository.Investigation.GetListAsync(take, skip, doctorId);
        var listAsList = list.ToList();

        var viewModels = mapper.Map<List<InvestigationViewModel>>(listAsList);

        for (int i = 0; i < viewModels.Count; i++)
        {
            viewModels[i].EncryptedId = encryptionHelper.Encrypt(listAsList[i].Id.ToString());
        }

        return new PaginatedListViewModel<InvestigationViewModel>(take)
        {
            ItemList = viewModels
        };
    }

    public async Task<InvestigationViewModel?> GetDetailsAsync(string encryptedId)
    {
        var entity = await repository.Investigation.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
        return mapper.Map<InvestigationViewModel>(entity);
    }

    public async Task<InvestigationDto?> GetByIdAsync(string encryptedId)
    {
        var entity = await repository.Investigation.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (entity is not null)
        {
            entity.EncryptedId = encryptedId;
            return mapper.Map<InvestigationDto>(entity);
        }
        return default;
    }

    public async Task<bool> CreateAsync(InvestigationDto dto)
    {
        var entity = mapper.Map<Investigation>(dto);
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
        return await repository.Investigation.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(InvestigationDto dto)
    {
        var encryptedId = dto.EncryptedId ?? string.Empty;
        var id = encryptionHelper.Decrypt(encryptedId);
        var existing = await repository.Investigation.FindByIdAsync(id);
        if (existing is null)
            return false;

        mapper.Map(dto, existing);
        existing.Id = id; // Maintain Id integrity

        if (!string.IsNullOrEmpty(dto.DoctorEncryptedId))
        {
            existing.DoctorId = encryptionHelper.Decrypt(dto.DoctorEncryptedId);
        }
        UpdateAutoFields(existing);

        return await repository.Investigation.UpdateAsync(existing);
    }

    public async Task<bool> ChangeActiveAsync(string encryptedId)
    {
        var existing = await repository.Investigation.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (existing is not null)
        {
            existing.IsActive = !existing.IsActive;
            UpdateAutoFields(existing);
            return await repository.Investigation.UpdateAsync(existing);
        }
        return false;
    }

    public async Task<List<InvestigationDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId)
    {
        var doctorId = encryptionHelper.Decrypt(encryptedDoctorId);
        var list = await repository.Investigation.GetActiveByDoctorIdAsync(doctorId);
        return mapper.Map<List<InvestigationDto>>(list);
    }

    public async Task<List<InvestigationDto>> GetActiveForCurrentUserAsync()
    {
        if (CurrentUser is null) return [];
        var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
        if (doctor is null) return [];
        var list = await repository.Investigation.GetActiveByDoctorIdAsync(doctor.Id);
        return mapper.Map<List<InvestigationDto>>(list);
    }
}
