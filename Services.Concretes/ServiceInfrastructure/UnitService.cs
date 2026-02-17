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

internal sealed class UnitService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IUnitService
{
    public async Task<PaginatedListViewModel<UnitViewModel>?> GetListAsync(int take, int skip)
    {
        var list = await repository.Unit.GetListAsync(take, skip);
        var viewModels = mapper.Map<List<UnitViewModel>>(list);
        return new PaginatedListViewModel<UnitViewModel>(take) { ItemList = viewModels };
    }

    public async Task<UnitViewModel?> GetDetailsAsync(string encryptedId)
    {
        var entity = await repository.Unit.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
        return mapper.Map<UnitViewModel>(entity);
    }

    public async Task<UnitDto?> GetByIdAsync(string encryptedId)
    {
        var entity = await repository.Unit.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (entity is not null)
        {
            entity.EncryptedId = encryptedId;
            return mapper.Map<UnitDto>(entity);
        }
        return default;
    }

    public async Task<bool> CreateAsync(UnitDto dto)
    {
        var entity = mapper.Map<Unit>(dto);
        CreateAutoFields(entity);
        return await repository.Unit.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(UnitDto dto)
    {
        var existing = await repository.Unit.FindByIdAsync(encryptionHelper.Decrypt(dto.EncryptedId ?? string.Empty));
        if (existing is null) return false;
        mapper.Map(dto, existing);
        UpdateAutoFields(existing);
        return await repository.Unit.UpdateAsync(existing);
    }

    public async Task<bool> ChangeActiveAsync(string encryptedId)
    {
        var existing = await repository.Unit.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (existing is null) return false;
        existing.IsActive = !existing.IsActive;
        UpdateAutoFields(existing);
        return await repository.Unit.UpdateAsync(existing);
    }

    public async Task<List<UnitDto>> GetActiveListAsync()
    {
        var list = await repository.Unit.GetActiveListAsync();
        return mapper.Map<List<UnitDto>>(list);
    }
}