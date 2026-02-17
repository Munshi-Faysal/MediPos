using Services.Contracts.Base;
using Shared.DTOs.InitDTOs;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IDrugTypeService : IBaseServiceInit<DrugTypeViewModel, DrugTypeDto, DrugTypeInitDto>
{
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<DrugTypeDto>> GetActiveByDoctorIdAsync(string encryptedDoctorId);
    Task<List<DrugTypeDto>> GetActiveForCurrentUserAsync();
}
