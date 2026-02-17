using AutoMapper;
using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Account;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IPackageService : IBaseService<PackageViewModel, PackageDto>
{
    Task<bool> ChangeActiveAsync(string encryptedId);
    public Task<List<PackageDto>> GetAvailablePackagesAsync();
}

