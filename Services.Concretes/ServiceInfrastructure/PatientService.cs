using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Repositories.Contracts.Base;
using Services.Concretes.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Cryptography;
using Shared.DTOs.MainDTOs.Patient;
using Shared.DTOs.ViewModels;

namespace Services.Concretes.ServiceInfrastructure;

internal sealed class PatientService(
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IRepositoryManager repository,
    IMapper mapper) : BaseService(userManager, httpContextAccessor), IPatientService
{
    private bool IsValidId(string? id) => !string.IsNullOrWhiteSpace(id) && id != "null" && id != "undefined";


    public async Task<IEnumerable<PatientViewModel>> GetAllPatientsAsync(int take = 50)
    {
        var patients = await repository.Patient.SearchPatientsAsync(null!, take);
        return mapper.Map<IEnumerable<PatientViewModel>>(patients);
    }

    public async Task<IEnumerable<PatientViewModel>> SearchPatientsAsync(string term, int take = 50)
    {
        var patients = await repository.Patient.SearchPatientsAsync(term, take);
        return mapper.Map<IEnumerable<PatientViewModel>>(patients);
    }

    public async Task<PatientViewModel?> GetByIdAsync(string encryptedId)
    {
        if (!IsValidId(encryptedId)) return null;
        var id = int.Parse(encryptedId);
        var entity = await repository.Patient.FindByIdAsync(id);
        return entity == null ? null : mapper.Map<PatientViewModel>(entity);
    }

    public async Task<PatientViewModel?> GetByPhoneAsync(string phone)
    {
        var entity = await repository.Patient.GetPatientByPhoneAsync(phone);
        return entity == null ? null : mapper.Map<PatientViewModel>(entity);
    }

    public async Task<bool> CreateAsync(PatientDto dto)
    {
        var entity = mapper.Map<Patient>(dto);
        CreateAutoFields(entity);
        entity.IsActive = true;
        return await repository.Patient.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(PatientDto dto)
    {
        if (!IsValidId(dto.EncryptedId)) return false;
        var id = int.Parse(dto.EncryptedId!);
        var existing = await repository.Patient.FindByIdAsync(id);
        if (existing == null) return false;

        mapper.Map(dto, existing);
        UpdateAutoFields(existing);
        return await repository.Patient.UpdateAsync(existing);
    }
}
