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

internal sealed class DrugTypeService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IDrugTypeService
{
    public async Task<PaginatedListViewModel<DrugTypeViewModel>?> GetListAsync(int take, int skip)
    {
        var list = await repository.DrugType.GetListAsync(take, skip);
        var listAsList = list.ToList();

        var viewModels = mapper.Map<List<DrugTypeViewModel>>(listAsList);

        for (int i = 0; i < viewModels.Count; i++)
        {
            viewModels[i].EncryptedId = encryptionHelper.Encrypt(listAsList[i].Id.ToString());
        }

        return new PaginatedListViewModel<DrugTypeViewModel>(take)
        {
            ItemList = viewModels
        };
    }

    public async Task<DrugTypeViewModel?> GetDetailsAsync(string encryptedId)
    {
        var entity = await repository.DrugType.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
        return mapper.Map<DrugTypeViewModel>(entity);
    }

    public async Task<DrugTypeDto?> GetByIdAsync(string encryptedId)
    {
        var entity = await repository.DrugType.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (entity is not null)
        {
            entity.EncryptedId = encryptedId;
            return mapper.Map<DrugTypeDto>(entity);
        }
        return default;
    }

    public async Task<bool> CreateAsync(DrugTypeDto dto)
    {
        var entity = mapper.Map<DrugType>(dto);
        CreateAutoFields(entity);
        return await repository.DrugType.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(DrugTypeDto dto)
    {
        var encryptedId = dto.EncryptedId ?? string.Empty;
        var id = encryptionHelper.Decrypt(encryptedId);
        var existing = await repository.DrugType.FindByIdAsync(id);
        if (existing is null)
            return false;

        mapper.Map(dto, existing);
        UpdateAutoFields(existing);

        return await repository.DrugType.UpdateAsync(existing);
    }

    public async Task<bool> ChangeActiveAsync(string encryptedId)
    {
        var existing = await repository.DrugType.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (existing is not null)
        {
            existing.IsActive = !existing.IsActive;
            UpdateAutoFields(existing);
            return await repository.DrugType.UpdateAsync(existing);
        }
        return false;
    }

    public async Task<List<DrugTypeDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId)
    {
        var doctorId = encryptionHelper.Decrypt(encryptedDoctorId);
        var list = await repository.DrugType.GetActiveByDoctorIdAsync(doctorId);
        return mapper.Map<List<DrugTypeDto>>(list);
    }

    public async Task<List<DrugTypeDto>> GetActiveForCurrentUserAsync()
    {
        if (CurrentUser is null) return [];
        var doctor = await repository.Doctor.GetByUserIdAsync(CurrentUser.Id);
        if (doctor is null) return [];
        var list = await repository.DrugType.GetActiveByDoctorIdAsync(doctor.Id);
        return mapper.Map<List<DrugTypeDto>>(list);
    }

    public async Task<DrugTypeInitDto> GetInitObjectAsync()
    {
        return new DrugTypeInitDto
        {
            DoctorList = await repository.Doctor.GetDropdownItemsAsync()
        };
    }
}
