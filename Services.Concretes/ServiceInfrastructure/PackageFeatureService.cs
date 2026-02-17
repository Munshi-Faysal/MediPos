using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.PackageFeature;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class PackageFeatureService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IPackageFeatureService
{
    public async Task<PaginatedListViewModel<PackageFeatureViewModel>?> GetListAsync(int take, int skip)
    {
        var packageFeatureList = await repository.PackageFeature.GetListAsync(take, skip);
        var packageFeatureListAsList = packageFeatureList.ToList();

        var packageFeatureViewModels = mapper.Map<List<PackageFeatureViewModel>>(packageFeatureListAsList);

        return new PaginatedListViewModel<PackageFeatureViewModel>(take)
        {
            ItemList = packageFeatureViewModels
        };
    }

    public async Task<PackageFeatureViewModel?> GetDetailsAsync(string encryptedId)
    {
        var packageFeature = await repository.PackageFeature.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
        return mapper.Map<PackageFeatureViewModel>(packageFeature);
    }

    public async Task<PackageFeatureDto?> GetByIdAsync(string encryptedId)
    {
        var packageFeature = await repository.PackageFeature.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (packageFeature is not null)
        {
            var dto = mapper.Map<PackageFeatureDto>(packageFeature);
            dto.EncryptedId = encryptedId;
            return dto;
        }
        return default;
    }

    public async Task<bool> CreateAsync(PackageFeatureDto packageFeatureDto)
    {
        var packageFeature = mapper.Map<PackageFeature>(packageFeatureDto);
        CreateAutoFields(packageFeature);
        return await repository.PackageFeature.InsertAsync(packageFeature);
    }

    public async Task<bool> UpdateAsync(PackageFeatureDto packageFeatureDto)
    {
        var encryptedId = packageFeatureDto.EncryptedId ?? string.Empty;
        var existingPackageFeature = await repository.PackageFeature.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (existingPackageFeature is null)
            return false;

        mapper.Map(packageFeatureDto, existingPackageFeature);
        UpdateAutoFields(existingPackageFeature);
        return await repository.PackageFeature.UpdateAsync(existingPackageFeature);
    }
}
