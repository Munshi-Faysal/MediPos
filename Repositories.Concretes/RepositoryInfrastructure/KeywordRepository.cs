using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces.WorkflowEngine;
using Shared.DTOs.BaseDTOs;

namespace Repositories.Concretes.RepositoryInfrastructure.WorkflowEngine;

internal sealed class KeywordRepository(WfDbContext context) : BaseRepository<WfBaseKeyword>(context), IKeywordRepository
{
    private readonly WfDbContext _context = context;

    public async Task<List<DropdownDto>> GetDropdownItemsAsync(string keywordType, bool getCode)
    {
        return await _context.WfBaseKeywords
            .Where(d => d.KeywordType.Equals(keywordType) && d.IsActive)
            .OrderBy(d => d.Sequence)
            .Select(d => new DropdownDto
            {
                Id = d.Id,
                Value = getCode ? d.KeywordCode : d.KeywordText
            }).ToListAsync();
    }
}