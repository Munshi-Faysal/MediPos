using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Branch;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class BranchService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IBranchService
{
    public async Task<PaginatedListViewModel<BranchViewModel>?> GetListAsync(int take, int skip)
    {
        var branchList = await repository.Branch.GetListAsync(take, skip);
        var branchListAsList = branchList.ToList();

        var branchViewModels = mapper.Map<List<BranchViewModel>>(branchListAsList);

        for (int i = 0; i < branchViewModels.Count; i++)
        {
            branchViewModels[i].EncryptedId = encryptionHelper.Encrypt(branchListAsList[i].Id.ToString());
        }

        return new PaginatedListViewModel<BranchViewModel>(take)
        {
            ItemList = branchViewModels
        };
    }

    public async Task<BranchViewModel?> GetDetailsAsync(string encryptedId)
    {
        var branch = await repository.Branch.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
        return mapper.Map<BranchViewModel>(branch);
    }

    public async Task<BranchDto?> GetByIdAsync(string encryptedId)
    {
        var branch = await repository.Branch.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (branch is not null)
        {
            branch.EncryptedId = encryptedId;
            return mapper.Map<BranchDto>(branch);
        }
        return default;
    }

    public async Task<bool> CreateAsync(BranchDto branchDto)
    {
        var branch = mapper.Map<Branch>(branchDto);
        CreateAutoFields(branch);
        return await repository.Branch.InsertAsync(branch);
    }

    public async Task<bool> CreateFromDtoAsync(CreateBranchDto dto)
    {
        var branch = mapper.Map<Branch>(dto);
        CreateAutoFields(branch);
        return await repository.Branch.InsertAsync(branch);
    }

    public async Task<bool> UpdateAsync(BranchDto branchDto)
    {
        var encryptedId = branchDto.EncryptedId ?? string.Empty;
        var branchId = encryptionHelper.Decrypt(encryptedId);
        var existingBranch = await repository.Branch.FindByIdAsync(branchId);
        if (existingBranch is null)
            return false;

        mapper.Map(branchDto, existingBranch);
        UpdateAutoFields(existingBranch);

        return await repository.Branch.UpdateAsync(existingBranch);
    }

    public async Task<bool> UpdateFromDtoAsync(string encryptedId, UpdateBranchDto dto)
    {
        var branchId = encryptionHelper.Decrypt(encryptedId);
        var existingBranch = await repository.Branch.FindByIdAsync(branchId);
        if (existingBranch is null)
            return false;

        if (dto.Name is not null)
            existingBranch.Name = dto.Name;
        if (dto.Description is not null)
            existingBranch.Description = dto.Description;
        if (dto.Code is not null)
            existingBranch.Code = dto.Code;
        if (dto.Address is not null)
            existingBranch.Address = dto.Address;
        if (dto.IsActive.HasValue)
            existingBranch.IsActive = dto.IsActive.Value;

        UpdateAutoFields(existingBranch);

        return await repository.Branch.UpdateAsync(existingBranch);
    }

    public async Task<List<BranchDto>> GetActiveBranchesAsync()
    {
        var branches = await repository.Branch.GetActiveBranchesAsync();
        return mapper.Map<List<BranchDto>>(branches);
    }

    public async Task<List<BranchDto>> GetBranchesByDivisionIdAsync(string encryptedDivisionId)
    {
        var divisionId = encryptionHelper.Decrypt(encryptedDivisionId);
        var branches = await repository.Branch.GetBranchesByDivisionIdAsync(divisionId);
        return mapper.Map<List<BranchDto>>(branches);
    }

    public async Task<bool> ChangeActiveAsync(string encryptedId)
    {
        var existingBranch = await repository.Branch.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (existingBranch is not null)
        {
            existingBranch.IsActive = !existingBranch.IsActive;
            UpdateAutoFields(existingBranch);
            return await repository.Branch.UpdateAsync(existingBranch);
        }
        return false;
    }
}
