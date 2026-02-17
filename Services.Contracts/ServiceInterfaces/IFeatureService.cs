using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Feature;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IFeatureService : IBaseService<FeatureViewModel, FeatureDto>
{
    Task<bool> ChangeActiveAsync(string encryptedId);
}
