using Domain.Models;
using Repositories.Contracts.Base;

namespace Repositories.Contracts.RepositoryInterfaces.WorkflowEngine;

public interface IEmailFormatRepository : IBaseRepository<WfEmailFormat>
{
    Task<IEnumerable<WfEmailFormat>> GetListAsync(int take, int skip);
    Task<WfEmailFormat?> GetDetailsAsync(int id);
    Task<WfEmailFormat?> GetAllByEmailFormatTypeAsync(string emailFormatType);
}