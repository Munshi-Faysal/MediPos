using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IDrugCompanyService : IBaseService<DrugCompanyViewModel, DrugCompanyDto>
{
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<DrugCompanyDto>> GetActiveListAsync();
    Task<bool> IsNameExistsAsync(string name, string? encryptedExcludeId = null);
}
