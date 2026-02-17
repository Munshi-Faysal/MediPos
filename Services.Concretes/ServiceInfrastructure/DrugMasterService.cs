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

internal sealed class DrugMasterService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IDrugMasterService
{
    private bool IsValidId(string? id) => !string.IsNullOrWhiteSpace(id) && id != "null" && id != "undefined";

    public async Task<PaginatedListViewModel<DrugMasterViewModel>?> GetListAsync(int take, int skip)
    {
        var list = await repository.DrugMaster.GetListAsync(take, skip);
        var viewModels = mapper.Map<List<DrugMasterViewModel>>(list);
        return new PaginatedListViewModel<DrugMasterViewModel>(take) { ItemList = viewModels };
    }

    public async Task<DrugMasterViewModel?> GetDetailsAsync(string id)
    {
        if (!IsValidId(id)) return null;
        var entity = await repository.DrugMaster.GetDetailsAsync(int.Parse(id));
        if (entity is null) return null;
        
        var viewModel = mapper.Map<DrugMasterViewModel>(entity);
        viewModel.EncryptedId = id;
        
        // Map details
        if (entity.DrugDetails.Any())
        {
            viewModel.DrugDetailList = entity.DrugDetails.Select(d => new DrugDetailViewModel
            {
                EncryptedId = d.Id.ToString(),                
                StrengthName = d.DrugStrength != null 
                    ? $"{d.DrugStrength.Quantity}{d.DrugStrength.Unit?.Name}" 
                    : string.Empty,
                DrugTypeName = d.DrugType?.Name,
                Description = d.Description,
                UnitPrice = d.UnitPrice,
                IsActive = d.IsActive
            }).ToList();
        }
        
        return viewModel;
    }

    public async Task<DrugMasterDto?> GetByIdAsync(string id)
    {
        if (!IsValidId(id)) return null;
        var entity = await repository.DrugMaster.FindByIdAsync(int.Parse(id));
        if (entity is not null)
        {
            var dto = mapper.Map<DrugMasterDto>(entity);
            dto.EncryptedId = id;
            return dto;
        }
        return default;
    }

    public async Task<DrugMasterDto?> GetWithDetailsAsync(string id)
    {
        if (!IsValidId(id)) return null;
        var entity = await repository.DrugMaster.GetDetailsAsync(int.Parse(id));
        if (entity is null) return null;
        
        var dto = mapper.Map<DrugMasterDto>(entity);
        dto.EncryptedId = id;
        
        // Map common generic ID
        dto.GenericId = entity.DrugGenericId ?? 0;
        
        // Map details
        dto.DrugDetails = entity.DrugDetails.Select(d => new DrugDetailDto
        {
            EncryptedId = d.Id.ToString(),
            DrugStrengthId = d.DrugStrengthId,
            DrugTypeId = d.DrugTypeId,
            StrengthName = d.DrugStrength?.Quantity,
            DrugTypeName = d.DrugType?.Name,
            Description = d.Description,
            UnitPrice = d.UnitPrice,
            IsActive = d.IsActive
        }).ToList();
        
        return dto;
    }

    public async Task<bool> CreateAsync(DrugMasterDto dto)
    {
        var entity = mapper.Map<DrugMaster>(dto);
        
        if (entity.DrugCompanyId == 0 || !await repository.DrugCompany.AnyAsync(x => x.Id == entity.DrugCompanyId))
            return false;

        CreateAutoFields(entity);
        
        foreach (var detail in entity.DrugDetails)
        {
            detail.IsActive = true;
            detail.CreatedBy = entity.CreatedBy;
            detail.UpdatedBy = entity.UpdatedBy;
            detail.CreatedDate = entity.CreatedDate;
            detail.UpdatedDate = entity.UpdatedDate;
        }
        
        return await repository.DrugMaster.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(DrugMasterDto dto)
    {
        if (!IsValidId(dto.EncryptedId)) return false;
        var existing = await repository.DrugMaster.GetDetailsAsync(int.Parse(dto.EncryptedId!));
        if (existing is null) return false;
        
        mapper.Map(dto, existing);
        
        if (existing.DrugCompanyId == 0 || !await repository.DrugCompany.AnyAsync(x => x.Id == existing.DrugCompanyId))
            return false;
        
        UpdateAutoFields(existing);
        
        // Handle details: remove existing and add mapped ones from DTO properly
        // Note: mapper.Map(dto, existing) with direct collection mapping might cause issues with EF tracking 
        // if we don't manage it carefully. But let's follow the user's "simple way" with AutoMapper.
        
        var currentDetails = existing.DrugDetails.ToList();
        foreach (var detail in currentDetails)
        {
            await repository.DrugDetail.DeleteAsync(detail);
        }
        existing.DrugDetails.Clear();
        
        foreach (var detailDto in dto.DrugDetails)
        {
            if (detailDto.DrugTypeId == 0 || detailDto.DrugStrengthId == 0) continue;

            var detail = new DrugDetail
            {
                DrugMasterId = existing.Id,
                DrugTypeId = detailDto.DrugTypeId,
                DrugStrengthId = detailDto.DrugStrengthId,
                Description = detailDto.Description,
                IsActive = true,
                CreatedBy = existing.UpdatedBy,
                UpdatedBy = existing.UpdatedBy,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now,
                UnitPrice = detailDto.UnitPrice
            };
            
            await repository.DrugDetail.InsertAsync(detail);
        }
        
        return await repository.DrugMaster.UpdateAsync(existing);
    }


    public async Task<bool> ChangeActiveAsync(string id)
    {
        if (!IsValidId(id)) return false;
        var existing = await repository.DrugMaster.FindByIdAsync(int.Parse(id));
        if (existing is null) return false;
        existing.IsActive = !existing.IsActive;
        UpdateAutoFields(existing);
        return await repository.DrugMaster.UpdateAsync(existing);
    }

    public async Task<List<DrugMasterDto>> GetActiveListAsync()
    {
        var list = await repository.DrugMaster.GetActiveListAsync();
        return mapper.Map<List<DrugMasterDto>>(list);
    }

    public async Task<IEnumerable<DrugMasterViewModel>> SearchAsync(string term, int take = 50)
    {
        var entities = await repository.DrugMaster.SearchAsync(term, take);
        var viewModels = entities.Select(e => {
            var vm = mapper.Map<DrugMasterViewModel>(e);
            vm.DrugDetailList = e.DrugDetails.Select(d => new DrugDetailViewModel
            {
                EncryptedId = d.Id.ToString(),
                StrengthName = d.DrugStrength != null 
                    ? $"{d.DrugStrength.Quantity}{d.DrugStrength.Unit?.Name}" 
                    : string.Empty,
                DrugTypeName = d.DrugType?.Name,
                Description = d.Description,
                UnitPrice = d.UnitPrice,
                IsActive = d.IsActive
            }).ToList();
            return vm;
        }).ToList();
        
        return viewModels;
    }

    public async Task<DrugMasterInitDto> GetInitObjectAsync()
    {
        return new DrugMasterInitDto
        {
            DrugCompanyList = await repository.DrugCompany.GetDropdownItemsAsync(),
            DrugTypeList = await repository.DrugType.GetDropdownItemsAsync(),
            DrugDoseList = await repository.DrugDose.GetDropdownItemsAsync(),
            DrugDurationList = await repository.DrugDuration.GetDropdownItemsAsync(),
            GenericList = await repository.Generic.GetDropdownItemsAsync(),
            DrugStrengthList = await repository.DrugStrength.GetDropdownItemsAsync()
        };
    }
}