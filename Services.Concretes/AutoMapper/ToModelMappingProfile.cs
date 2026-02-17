using AutoMapper;
using Domain.Models;
using Shared.DTOs.MainDTOs;
using Shared.DTOs.MainDTOs.Account;
using Shared.DTOs.MainDTOs.Branch;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.MainDTOs.Feature;
using Shared.DTOs.MainDTOs.Mail;
using Shared.DTOs.MainDTOs.OnboardingStep;
using Shared.DTOs.MainDTOs.PackageFeature;
using Shared.DTOs.MainDTOs.Doctor;
using Shared.DTOs.MainDTOs.Patient;
using Shared.DTOs.MainDTOs.Appointment;
using Shared.DTOs.MainDTOs.Treatment;
using Shared.DTOs.MainDTOs.ChiefComplaint;
using Shared.DTOs.MainDTOs.OnExamination;
using Shared.DTOs.MainDTOs.Investigation;
using Shared.DTOs.MainDTOs.DrugDoseTemplate;
using Shared.DTOs.MainDTOs.DrugDurationTemplate;
using Shared.DTOs.MainDTOs.Prescription;

namespace Services.Concretes.AutoMapper;

public class ToModelMappingProfile : Profile
{
    public ToModelMappingProfile()
    {
        CreateMap<EmailFormatDto, WfEmailFormat>();
        CreateMap<MenuMasterDto, WfMenuMaster>();
        CreateMap<TrustedDeviceDto, TrustedDevice>();
        CreateMap<Shared.DTOs.MainDTOs.Role.RoleCreateDto, ApplicationRole>();
        CreateMap<Shared.DTOs.MainDTOs.Role.RoleUpdateDto, ApplicationRole>();

        // Package mappings
        CreateMap<PackageDto, Package>();

        // Feature mappings
        CreateMap<FeatureDto, Feature>();

        // PackageFeature mappings
        CreateMap<PackageFeatureDto, PackageFeature>();

        // Doctor mappings
        CreateMap<DoctorDto, Doctor>();

        // Branch mappings
        CreateMap<BranchDto, Branch>();
        CreateMap<CreateBranchDto, Branch>();

        // OnboardingStep mappings
        CreateMap<OnboardingStepDto, OnboardingStep>();

        // Drug mappings
        CreateMap<DrugDoseDto, DrugDose>();
        CreateMap<DrugAdviceDto, DrugAdvice>();
        CreateMap<DrugStrengthDto, DrugStrength>();
        CreateMap<DrugTypeDto, DrugType>()
            .ForMember(d => d.CommonUsage, opt => opt.MapFrom(s => s.Description));
        CreateMap<DrugDurationDto, DrugDuration>();

        // Generic mappings
        CreateMap<GenericDto, Generic>();



        // DrugCompany mappings
        CreateMap<DrugCompanyDto, DrugCompany>();


        // Unit mappings
        CreateMap<UnitDto, Unit>();

        // DrugMaster mappings - ignore child collection mapping so service constructs children explicitly
        CreateMap<DrugMasterDto, DrugMaster>()
            .ForMember(dest => dest.DrugGenericId, opt => opt.MapFrom(src => src.GenericId))
            .ForMember(d => d.DrugDetails, opt => opt.MapFrom(s => s.DrugDetails));

        // DrugDetail mappings - ignore FK properties (service will set validated IDs)
        CreateMap<DrugDetailDto, DrugDetail>();

        // Patient mappings
        CreateMap<PatientDto, Patient>();

        // Appointment mappings
        CreateMap<AppointmentDto, Appointment>();

        // Treatment mappings
        CreateMap<TreatmentTemplateDto, TreatmentTemplate>();
        CreateMap<TreatmentDrugDto, TreatmentDrug>();

        // ChiefComplaint mappings
        CreateMap<ChiefComplaintDto, ChiefComplaint>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());

        // OnExamination mappings
        CreateMap<OnExaminationDto, OnExamination>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());

        // Investigation mappings
        CreateMap<InvestigationDto, Investigation>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());

        // Disease mappings
        CreateMap<Shared.DTOs.MainDTOs.Disease.DiseaseDto, Disease>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());

        // DrugDoseTemplate mappings
        CreateMap<DrugDoseTemplateDto, DrugDoseTemplate>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());

        // DrugDurationTemplate mappings
        CreateMap<DrugDurationTemplateDto, DrugDurationTemplate>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());

        // Prescription mappings
        CreateMap<PrescriptionDto, Prescription>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Medicines, opt => opt.Ignore()); // Setup manually in service if needed to handle existing items

        CreateMap<PrescriptionMedicineDto, PrescriptionMedicine>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());
    }
}