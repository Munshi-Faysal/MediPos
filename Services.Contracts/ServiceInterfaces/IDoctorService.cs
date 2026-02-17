using Services.Contracts.Base;
using Shared.DTOs.InitDTOs;
using Shared.DTOs.MainDTOs.Doctor;
using Shared.DTOs.ViewModels;

namespace Services.Contracts.ServiceInterfaces;

public interface IDoctorService : IBaseServiceInit<DoctorViewModel, DoctorDto, DoctorInitDto>
{
    Task<bool> ChangeActiveAsync(string encryptedId);
}
