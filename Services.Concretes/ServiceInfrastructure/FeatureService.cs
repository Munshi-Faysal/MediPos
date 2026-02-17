using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Feature;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class FeatureService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IFeatureService
{
    public async Task<PaginatedListViewModel<FeatureViewModel>?> GetListAsync(int take, int skip)
    {
        var featureList = await repository.Feature.GetListAsync(take, skip);
        var featureListAsList = featureList.ToList();

        var featureViewModels = mapper.Map<List<FeatureViewModel>>(featureListAsList);

        for (int i = 0; i < featureViewModels.Count; i++)
        {
            featureViewModels[i].EncryptedId = encryptionHelper.Encrypt(featureListAsList[i].Id.ToString());
        }

        return new PaginatedListViewModel<FeatureViewModel>(take)
        {
            ItemList = featureViewModels
        };
    }

    public async Task<FeatureViewModel?> GetDetailsAsync(string encryptedId)
    {
        var feature = await repository.Feature.GetDetailsAsync(encryptionHelper.Decrypt(encryptedId));
        return mapper.Map<FeatureViewModel>(feature);
    }

    public async Task<FeatureDto?> GetByIdAsync(string encryptedId)
    {
        var feature = await repository.Feature.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (feature is not null)
        {
            var dto = mapper.Map<FeatureDto>(feature);
            dto.EncryptedId = encryptedId;
            return dto;
        }
        return default;
    }

    public async Task<bool> CreateAsync(FeatureDto featureDto)
    {
        var feature = mapper.Map<Feature>(featureDto);
        CreateAutoFields(feature);
        return await repository.Feature.InsertAsync(feature);
    }

    public async Task<bool> UpdateAsync(FeatureDto featureDto)
    {
        var encryptedId = featureDto.EncryptedId ?? string.Empty;
        var existingFeature = await repository.Feature.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (existingFeature is null)
            return false;

        mapper.Map(featureDto, existingFeature);
        UpdateAutoFields(existingFeature);
        return await repository.Feature.UpdateAsync(existingFeature);
    }

    public async Task<bool> ChangeActiveAsync(string encryptedId)
    {
        var feature = await repository.Feature.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (feature is null)
            return false;

        feature.IsActive = !feature.IsActive;
        UpdateAutoFields(feature);
        return await repository.Feature.UpdateAsync(feature);
    }
}
