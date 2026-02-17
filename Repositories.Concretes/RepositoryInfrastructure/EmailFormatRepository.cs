using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces.WorkflowEngine;
using Shared.Cryptography;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class EmailFormatRepository(WfDbContext context, EncryptionHelper encryptionHelper)
    : BaseRepository<WfEmailFormat>(context), IEmailFormatRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<WfEmailFormat>> GetListAsync(int take, int skip)
    {
        return await _context.WfEmailFormats
            .OrderByDescending(d => d.Id)
            .Skip(skip)
            .Take(take)
            .Select(d => new WfEmailFormat
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                EmailFormatType = d.EmailFormatType,
                EmailSubject = d.EmailSubject,
                EmailBody = d.EmailBody,
                IsActive = d.IsActive
            }).ToListAsync();
    }

    public async Task<WfEmailFormat?> GetDetailsAsync(int id)
    {
        return await _context.WfEmailFormats
            .Where(d => d.Id == id)
            .Select(d => new WfEmailFormat
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                EmailFormatType = d.EmailFormatType,
                EmailSubject = d.EmailSubject,
                EmailBody = d.EmailBody,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate,
                Creator = GetUserNameById(d.CreatedBy),
                Modifier = GetUserNameById(d.UpdatedBy)
            }).FirstOrDefaultAsync();
    }

    public async Task<WfEmailFormat?> GetAllByEmailFormatTypeAsync(string emailFormatType)
    {
        return await _context.WfEmailFormats
            .Where(d => d.EmailFormatType.Equals(emailFormatType))
            .Select(d => new WfEmailFormat
            {
                EmailSubject = d.EmailSubject,
                EmailBody = d.EmailBody
            }).FirstOrDefaultAsync();
    }
}