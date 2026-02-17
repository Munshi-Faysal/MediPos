using Services.Contracts.Base;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs.Branch;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IBranchService : IBaseService<BranchViewModel, BranchDto>
{
    Task<bool> ChangeActiveAsync(string encryptedId);
    Task<List<BranchDto>> GetActiveBranchesAsync();
    Task<List<BranchDto>> GetBranchesByDivisionIdAsync(string encryptedDivisionId);
    Task<bool> CreateFromDtoAsync(CreateBranchDto dto);
    Task<bool> UpdateFromDtoAsync(string encryptedId, UpdateBranchDto dto);
}
