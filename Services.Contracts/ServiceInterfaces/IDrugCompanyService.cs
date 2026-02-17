using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IDrugCompanyService : IBaseService<DrugCompanyViewModel, DrugCompanyDto>
{
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<DrugCompanyDto>> GetActiveListAsync();
}
