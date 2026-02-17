using Services.Contracts.Base;
using Shared.DTOs.InitDTOs;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IDrugMasterService : IBaseServiceInit<DrugMasterViewModel, DrugMasterDto, DrugMasterInitDto>
{
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<DrugMasterDto>> GetActiveListAsync();
    Task<DrugMasterDto?> GetWithDetailsAsync(string encryptedId);
    Task<IEnumerable<DrugMasterViewModel>> SearchAsync(string term, int take = 50);
}