using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Common;
using Shared.Cryptography;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.InitDTOs;
using Shared.DTOs.MainDTOs.Doctor;
using Shared.DTOs.MainDTOs.Mail;
using Shared.DTOs.ViewModels;
using Shared.Enums;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class DoctorService(
    IOptions<DefaultSettings> defaultSettings,
    UserManager<ApplicationUser> userManager,
    RoleManager<ApplicationRole> roleManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IDoctorService
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;

    public async Task<PaginatedListViewModel<DoctorViewModel>?> GetListAsync(int take, int skip)
    {
        var doctorList = await repository.Doctor.GetListAsync(take, skip);
        var doctorListAsList = doctorList.ToList();

        var doctorViewModels = mapper.Map<List<DoctorViewModel>>(doctorListAsList);

        for (int i = 0; i < doctorViewModels.Count; i++)
        {
            doctorViewModels[i].EncryptedId = encryptionHelper.Encrypt(doctorListAsList[i].Id.ToString());
        }

        return new PaginatedListViewModel<DoctorViewModel>(take)
        {
            ItemList = doctorViewModels
        };
    }

    public async Task<DoctorViewModel?> GetDetailsAsync(string encryptedId)
    {
        var doctorId = encryptionHelper.Decrypt(encryptedId);
        var doctor = await repository.Doctor.FindByIdAsync(doctorId);
        if (doctor is null) return null;
        
        var viewModel = mapper.Map<DoctorViewModel>(doctor);
        viewModel.EncryptedId = encryptedId;
        return viewModel;
    }

    public async Task<DoctorDto?> GetByIdAsync(string encryptedId)
    {
        var doctor = await repository.Doctor.FindByIdAsync(encryptionHelper.Decrypt(encryptedId));
        if (doctor is not null)
        {
            doctor.EncryptedId = encryptedId;
            return mapper.Map<DoctorDto>(doctor);
        }
        return default;
    }

    public async Task<DoctorProfileDto?> GetCurrentProfileAsync()
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser is null)
            return null;

        var doctor = await repository.Doctor.GetByUserIdAsync(currentUser.Id);
        return doctor is null ? null : mapper.Map<DoctorProfileDto>(doctor);
    }

    public async Task<DoctorProfileDto?> UpdateCurrentProfileAsync(DoctorProfileDto profileDto)
    {
        var currentUser = await GetCurrentUserAsync();
        if (currentUser is null)
            return null;

        var doctor = await repository.Doctor.GetByUserIdAsync(currentUser.Id);
        if (doctor is null)
            return null;

        doctor.Name = profileDto.Name.Trim();
        doctor.Title = NormalizeOptional(profileDto.Title);
        doctor.Specialization = NormalizeOptional(profileDto.Specialization);
        doctor.LicenseNumber = profileDto.LicenseNumber.Trim();
        doctor.Email = profileDto.Email.Trim();
        doctor.Phone = profileDto.Phone.Trim();
        doctor.Bio = NormalizeOptional(profileDto.Bio);
        doctor.ClinicName = NormalizeOptional(profileDto.ClinicName);
        doctor.ChamberAddress = NormalizeOptional(profileDto.ChamberAddress);
        doctor.ChamberContact = NormalizeOptional(profileDto.ChamberContact);
        doctor.StartTime = NormalizeOptional(profileDto.StartTime);
        doctor.EndTime = NormalizeOptional(profileDto.EndTime);
        doctor.OffDay = NormalizeOptional(profileDto.OffDay);

        UpdateAutoFields(doctor);
        if (!await repository.Doctor.UpdateAsync(doctor))
            return null;

        return mapper.Map<DoctorProfileDto>(doctor);
    }

    public async Task<bool> CreateAsync(DoctorDto doctorDto)
    {
        // 1. Create ApplicationUser
        if (await _userManager.FindByEmailAsync(doctorDto.Email) is not null)
            return false;

        var systemUserId = repository.User.GetSystemUserIdAsync();

        var user = new ApplicationUser
        {
            UserName = doctorDto.Email,
            DisplayName = doctorDto.Name,
            Email = doctorDto.Email,
            AccountName = doctorDto.Name,
            CreatedDate = DateTime.Now,
            UpdatedDate = DateTime.Now,
            IsActive = true,
            EmailConfirmed = true,
            CreatedBy = systemUserId,
            UpdatedBy = systemUserId
        };

        var userResult = await _userManager.CreateAsync(user, doctorDto.Password ?? defaultSettings.Value.DefaultPassword);
        if (!userResult.Succeeded)
            return false;

        // 2. Ensure Doctor Role exists and Assign it
        if (!await roleManager.RoleExistsAsync("Doctor"))
        {
            await roleManager.CreateAsync(new ApplicationRole 
            { 
                Name = "Doctor", 
                RoleCode = "DOC",
                IsActive = true,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now,
                CreatedBy = systemUserId,
                UpdatedBy = systemUserId
            });
        }
        await _userManager.AddToRoleAsync(user, "Doctor");

        // 3. Create Doctor Record
        var doctor = mapper.Map<Doctor>(doctorDto);
        doctor.UserId = user.Id;
        CreateAutoFields(doctor);
        
        var result = await repository.Doctor.InsertAsync(doctor);
        if (!result)
        {
            await _userManager.DeleteAsync(user);
            return false;
        }

        return true;
    }

    public async Task<bool> UpdateAsync(DoctorDto doctorDto)
    {
        var doctorId = encryptionHelper.Decrypt(doctorDto.EncryptedId ?? string.Empty);
        var existingDoctor = await repository.Doctor.FindByIdAsync(doctorId);
        if (existingDoctor is null)
            return false;

        mapper.Map(doctorDto, existingDoctor);
        UpdateAutoFields(existingDoctor);
        return await repository.Doctor.UpdateAsync(existingDoctor);
    }

    public async Task<bool> ChangeActiveAsync(string encryptedId)
    {
        var doctorId = encryptionHelper.Decrypt(encryptedId);
        var doctor = await repository.Doctor.FindByIdAsync(doctorId);
        if (doctor is null)
            return false;

        doctor.IsActive = !doctor.IsActive;
        UpdateAutoFields(doctor);
        return await repository.Doctor.UpdateAsync(doctor);
    }

    public async Task<DoctorInitDto> GetInitObjectAsync()
    {
        return new DoctorInitDto
        {
            ClinicalDeptList = await repository.ClinicalDept.GetDropdownItemsAsync(),
            OperationStatusList = await repository.Keyword.GetDropdownItemsAsync(nameof(KeywordType.OperationStatus))
        };
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
