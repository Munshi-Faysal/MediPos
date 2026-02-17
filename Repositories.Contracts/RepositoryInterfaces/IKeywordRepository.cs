using Domain.Models;
using Repositories.Contracts.Base;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Contracts.RepositoryInterfaces.WorkflowEngine;

public interface IKeywordRepository : IBaseRepository<WfBaseKeyword>
{
    Task<List<DropdownDto>> GetDropdownItemsAsync(string keywordType, bool getCode = false);
}