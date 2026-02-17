using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.DTOs.MainDTOs.OnboardingStep;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class OnboardingStepService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IOnboardingStepService
{
    public async Task<OnboardingStatusDto> GetOnboardingStatusAsync()
    {
        var steps = await repository.OnboardingStep.GetActiveStepsAsync();
        var stepsList = steps.ToList();
        
        var userId = CurrentUser?.Id ?? 0;
        var userProgress = userId > 0 
            ? (await repository.UserOnboardingProgress.GetByUserIdAsync(userId)).ToList()
            : new List<UserOnboardingProgress>();

        var stepDtos = new List<OnboardingStepDto>();

        foreach (var step in stepsList)
        {
            var progress = userProgress.FirstOrDefault(p => p.OnboardingStepId == step.Id);
            var stepDto = mapper.Map<OnboardingStepDto>(step);
            stepDto.Completed = progress?.IsCompleted ?? false;
            stepDtos.Add(stepDto);
        }

        var completedCount = stepDtos.Count(s => s.Completed);
        var totalCount = stepDtos.Count;

        return new OnboardingStatusDto
        {
            Steps = stepDtos,
            CompletedCount = completedCount,
            TotalCount = totalCount,
            IsCompleted = completedCount == totalCount && totalCount > 0,
            ProgressPercentage = totalCount > 0 ? Math.Round((double)completedCount / totalCount * 100, 2) : 0
        };
    }

    public async Task<List<OnboardingStepDto>> GetAllStepsAsync()
    {
        var steps = await repository.OnboardingStep.GetActiveStepsAsync();
        return mapper.Map<List<OnboardingStepDto>>(steps);
    }

    public async Task<bool> CompleteStepAsync(string stepKey)
    {
        var userId = CurrentUser?.Id ?? 0;
        if (userId == 0)
            return false;

        var step = await repository.OnboardingStep.GetByStepKeyAsync(stepKey);
        if (step is null)
            return false;

        var existingProgress = await repository.UserOnboardingProgress.GetByUserAndStepAsync(userId, step.Id);
        
        if (existingProgress is not null)
        {
            if (existingProgress.IsCompleted)
                return true; // Already completed

            existingProgress.IsCompleted = true;
            existingProgress.CompletedAt = DateTime.UtcNow;
            existingProgress.UpdatedDate = DateTime.UtcNow;
            existingProgress.UpdatedBy = userId;
            
            return await repository.UserOnboardingProgress.UpdateAsync(existingProgress);
        }

        var progress = new UserOnboardingProgress
        {
            UserId = userId,
            OnboardingStepId = step.Id,
            IsCompleted = true,
            CompletedAt = DateTime.UtcNow,
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        return await repository.UserOnboardingProgress.InsertAsync(progress);
    }

    public async Task<bool> ResetStepsAsync()
    {
        var userId = CurrentUser?.Id ?? 0;
        if (userId == 0)
            return false;

        var userProgress = await repository.UserOnboardingProgress.GetByUserIdAsync(userId);
        var progressList = userProgress.ToList();

        if (progressList.Count == 0)
            return true;

        return await repository.UserOnboardingProgress.DeleteRangeAsync(progressList);
    }
}
