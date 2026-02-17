using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.ChiefComplaint;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class ChiefComplaintService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IChiefComplaintService
{
    public async Task<PaginatedListViewModel<ChiefComplaintViewModel>?> GetListAsync(int take, int skip)
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

        var list = await repository.ChiefComplaint.GetListAsync(take, skip, doctorId);
        var listAsList = list.ToList();

        var viewModels = mapper.Map<List<ChiefComplaintViewModel>>(listAsList);

        for (int i = 0; i < viewModels.Count; i++)
        {
            viewModels[i].EncryptedId = encryptionHelper.Encrypt(listAsList[i].Id.ToString());
        }

        return new PaginatedListViewModel<ChiefComplaintViewModel>(take)
        {
            ItemList = viewModels
        };
    }

    public async Task<ChiefComplaintViewModel?> GetDetailsAsync(string encryptedId)
    {
        var entity = await repository.ChiefComplaint.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
        return mapper.Map<ChiefComplaintViewModel>(entity);
    }

    public async Task<ChiefComplaintDto?> GetByIdAsync(string encryptedId)
    {
        var entity = await repository.ChiefComplaint.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (entity is not null)
        {
            entity.EncryptedId = encryptedId;
            return mapper.Map<ChiefComplaintDto>(entity);
        }
        return default;
    }

    public async Task<bool> CreateAsync(ChiefComplaintDto dto)
    {
        var entity = mapper.Map<ChiefComplaint>(dto);
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
        return await repository.ChiefComplaint.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(ChiefComplaintDto dto)
    {
        var encryptedId = dto.EncryptedId ?? string.Empty;
        var id = encryptionHelper.Decrypt(encryptedId);
        var existing = await repository.ChiefComplaint.FindByIdAsync(id);
        if (existing is null)
            return false;

        mapper.Map(dto, existing);
        existing.Id = id; // Ensure ID is not modified by mapper

        if (!string.IsNullOrEmpty(dto.DoctorEncryptedId))
        {
            existing.DoctorId = encryptionHelper.Decrypt(dto.DoctorEncryptedId);
        }
        UpdateAutoFields(existing);

        return await repository.ChiefComplaint.UpdateAsync(existing);
    }

    public async Task<bool> ChangeActiveAsync(string encryptedId)
    {
        var existing = await repository.ChiefComplaint.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (existing is not null)
        {
            existing.IsActive = !existing.IsActive;
            UpdateAutoFields(existing);
            return await repository.ChiefComplaint.UpdateAsync(existing);
        }
        return false;
    }

    public async Task<List<ChiefComplaintDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId)
    {
        var doctorId = encryptionHelper.Decrypt(encryptedDoctorId);
        var list = await repository.ChiefComplaint.GetActiveByDoctorIdAsync(doctorId);
        return mapper.Map<List<ChiefComplaintDto>>(list);
    }

    public async Task<List<ChiefComplaintDto>> GetActiveForCurrentUserAsync()
    {
        if (CurrentUser is null) return [];
        var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
        if (doctor is null) return [];
        var list = await repository.ChiefComplaint.GetActiveByDoctorIdAsync(doctor.Id);
        return mapper.Map<List<ChiefComplaintDto>>(list);
    }
}
