using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.PackageFeature;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IPackageFeatureService : IBaseService<PackageFeatureViewModel, PackageFeatureDto>;
