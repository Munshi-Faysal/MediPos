using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class OnboardingStepRepository(WfDbContext context,
    EncryptionHelper encryptionHelper)
    : BaseRepository<OnboardingStep>(context), IOnboardingStepRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<OnboardingStep>> GetListAsync(int take, int skip)
    {
        return await _context.OnboardingSteps
            .Where(d => d.IsActive)
            .OrderBy(d => d.Title)
            .Skip(skip)
            .Take(take)
            .Select(d => new OnboardingStep
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                StepKey = d.StepKey,
                Title = d.Title,
                Description = d.Description,
                Route = d.Route,
                Icon = d.Icon,
                IsRequired = d.IsRequired,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).ToListAsync();
    }

    public async Task<OnboardingStep?> GetDetailsAsync(int id)
    {
        return await _context.OnboardingSteps
            .Where(s => s.Id == id)
            .Select(d => new OnboardingStep
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                StepKey = d.StepKey,
                Title = d.Title,
                Description = d.Description,
                Route = d.Route,
                Icon = d.Icon,
                IsRequired = d.IsRequired,
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<OnboardingStep>> GetActiveStepsAsync()
    {
        return await _context.OnboardingSteps
            .Where(s => s.IsActive)
            .OrderBy(s => s.Title)
            .Select(d => new OnboardingStep
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                StepKey = d.StepKey,
                Title = d.Title,
                Description = d.Description,
                Route = d.Route,
                Icon = d.Icon,
                IsRequired = d.IsRequired,
                IsActive = d.IsActive
            }).ToListAsync();
    }

    public async Task<OnboardingStep?> GetByStepKeyAsync(string stepKey)
    {
        return await _context.OnboardingSteps
            .Where(s => s.StepKey == stepKey && s.IsActive)
            .Select(d => new OnboardingStep
            {
                EncryptedId = encryptionHelper.Encrypt(d.Id.ToString()),
                Id = d.Id,
                StepKey = d.StepKey,
                Title = d.Title,
                Description = d.Description,
                Route = d.Route,
                Icon = d.Icon,
                IsRequired = d.IsRequired,
                IsActive = d.IsActive
            }).FirstOrDefaultAsync();
    }
}
