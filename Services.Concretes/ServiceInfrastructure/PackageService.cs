using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Account;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class PackageService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IPackageService
{
    public async Task<PaginatedListViewModel<PackageViewModel>?> GetListAsync(int take, int skip)
    {
        var packageList = await repository.Package.GetListAsync(take, skip);
        var packageListAsList = packageList.ToList();

        var packageViewModels = mapper.Map<List<PackageViewModel>>(packageListAsList);

        for (int i = 0; i < packageViewModels.Count; i++)
        {
            packageViewModels[i].EncryptedId = encryptionHelper.Encrypt(packageListAsList[i].Id.ToString());
        }

        return new PaginatedListViewModel<PackageViewModel>(take)
        {
            ItemList = packageViewModels
        };
    }

    public async Task<PackageViewModel?> GetDetailsAsync(string encryptedId)
    {
        var package = await repository.Package.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
        return mapper.Map<PackageViewModel>(package);
    }

    public async Task<PackageDto?> GetByIdAsync(string encryptedId)
    {
        var package = await repository.Package.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (package is not null)
        {
            package.EncryptedId = encryptedId;
            return mapper.Map<PackageDto>(package);
        }
        return default;
    }

    public async Task<bool> CreateAsync(PackageDto packageDto)
    {
        var package = mapper.Map<Package>(packageDto);
        CreateAutoFields(package);

        // Handle Features
        if (packageDto.FeatureList?.Any() == true)
        {
            foreach (var encId in packageDto.FeatureList)
            {
                var featureId = encryptionHelper.Decrypt(encId);
                if (featureId > 0)
                {
                    var pf = new PackageFeature
                    {
                        FeatureId = featureId,
                        IsActive = true
                    };
                    CreateAutoFields(pf);
                    package.PackageFeatures.Add(pf);
                }
            }
        }

        return await repository.Package.InsertAsync(package);
    }

    public async Task<bool> UpdateAsync(PackageDto packageDto)
    {
        var encryptedId = packageDto.EncryptedId ?? string.Empty;
        var packageId = encryptionHelper.Decrypt(encryptedId);
        var existingPackage = await repository.Package.FindByIdAsync(packageId);
        if (existingPackage is null)
            return false;

        mapper.Map(packageDto, existingPackage);
        UpdateAutoFields(existingPackage);
        
        // Handle Features
        if (packageDto.FeatureList != null)
        {
            // Fetch existing relationships
            var currentFeatures = await repository.PackageFeature.GetByPackageIdAsync(existingPackage.Id);
            
            // Remove all existing (Simple strategy: Delete All, Insert Selected)
            foreach (var cf in currentFeatures)
            {
                // Assuming DeleteAsync exists in IBaseRepository matching InsertAsync pattern
                // If returns void, we use Delete. Ideally InsertAsync implies DeleteAsync exists.
                await repository.PackageFeature.DeleteAsync(cf);
            }

            // Insert new selections
            foreach (var encId in packageDto.FeatureList)
            {
                var featureId = encryptionHelper.Decrypt(encId);
                if (featureId > 0)
                {
                    var pf = new PackageFeature
                    {
                        PackageId = existingPackage.Id,
                        FeatureId = featureId,
                        IsActive = true
                    };
                    CreateAutoFields(pf);
                    await repository.PackageFeature.InsertAsync(pf);
                }
            }
        }

        return await repository.Package.UpdateAsync(existingPackage);
    }

    public async Task<List<PackageDto>> GetAvailablePackagesAsync()
    {
        var packages = await repository.Package.GetActivePackagesAsync();
        return mapper.Map<List<PackageDto>>(packages);
    }

    public async Task<bool> ChangeActiveAsync(string encryptedId)
    {
        var existingPackage = await repository.Package.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (existingPackage is not null)
        {
            existingPackage.IsActive = !existingPackage.IsActive;
            UpdateAutoFields(existingPackage);
            return await repository.Package.UpdateAsync(existingPackage);
        }
        return false;
    }
}
