using AutoMapper;
using Domain.Models;
using Shared.Common;
using Shared.DTOs.BaseDTOs;
using Shared.DTOs.MainDTOs;
using Shared.DTOs.MainDTOs.Account;
using Shared.DTOs.MainDTOs.Branch;
using Shared.DTOs.MainDTOs.Drug;
using Shared.DTOs.MainDTOs.Feature;
using Shared.DTOs.MainDTOs.Mail;
using Shared.DTOs.MainDTOs.OnboardingStep;
using Shared.DTOs.MainDTOs.PackageFeature;
using Shared.DTOs.MainDTOs.Role;
using Shared.DTOs.ViewModels;
using Shared.DTOs.ViewModels.WorkflowEngine;
using Shared.DTOs.MainDTOs.Onboarding;
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

public class ToDtoMappingProfile : Profile
{
    public ToDtoMappingProfile()
    {
        CreateMap<CompanyRegistration, CompanyRegistrationDto>();
        CreateMap<WfMenuMaster, MenuMasterDto>();
        CreateMap<WfMenuMaster, MenuMasterViewModel>()
            .ForMember(d => d.ParentMenuName, opt => opt.MapFrom(s => s.ParentMenu != null ? s.ParentMenu.MenuName : null));
        CreateMap<WfMenuMaster, SidebarMenuViewModel>()
            .ForMember(d => d.ParentMenuName, opt => opt.MapFrom(s => s.ParentMenu != null ? s.ParentMenu.MenuName : null));

        CreateMap<WfMenuDetail, MenuDetailViewModel>()
            .ForMember(d => d.MenuDetailId, opt => opt.MapFrom(s => s.Id));

        CreateMap<WfEmailFormat, EmailFormatDto>();
        CreateMap<WfEmailFormat, EmailFormatViewModel>();
        CreateMap<ApplicationUser, UserViewModel>();
        CreateMap<LoginOtpDto, TrustedDeviceDto>();
        CreateMap<ApplicationRole, RoleDto>()
            .ForMember(d => d.ScopeName, opt => opt.MapFrom(s => s.Scope != null ? s.Scope.KeywordText : null));

        // Package mappings
        CreateMap<Package, PackageDto>()
            .ForMember(d => d.FeatureList, opt => opt.MapFrom(s => 
                s.PackageFeatures
                    .Select(pf => pf.Feature!.Name)
                    .ToList()));
        CreateMap<Package, PackageViewModel>()
            .ForMember(d => d.FeatureList, opt => opt.MapFrom(s => 
                s.PackageFeatures
                    .Select(pf => pf.Feature!.Name)
                    .ToList()));

        // Feature mappings
        CreateMap<Feature, FeatureDto>();
        CreateMap<Feature, FeatureViewModel>();

        // PackageFeature mappings
        CreateMap<PackageFeature, PackageFeatureDto>();
        CreateMap<PackageFeature, PackageFeatureViewModel>()
            .ForMember(d => d.PackageName, opt => opt.MapFrom(s => s.Package!.Name))
            .ForMember(d => d.FeatureName, opt => opt.MapFrom(s => s.Feature!.Name))
            .ForMember(d => d.PackageId, opt => opt.MapFrom(s => s.PackageId))
            .ForMember(d => d.FeatureId, opt => opt.MapFrom(s => s.FeatureId));

        // Doctor mappings
        CreateMap<Doctor, DoctorDto>();
        CreateMap<Doctor, DoctorViewModel>()
            .ForMember(d => d.ClinicalDeptName, opt => opt.MapFrom(s => s.ClinicalDept != null ? s.ClinicalDept.Name : null))
            .ForMember(d => d.OperationStatusName, opt => opt.MapFrom(s => s.OperationStatus != null ? s.OperationStatus.KeywordText : null));

        // Branch mappings
        CreateMap<Branch, BranchDto>();
        CreateMap<Branch, BranchViewModel>();

        // OnboardingStep mappings
        CreateMap<OnboardingStep, OnboardingStepDto>();
        CreateMap<OnboardingStep, OnboardingStepViewModel>();

        // Drug mappings
        CreateMap<DrugDose, DrugDoseDto>();
        CreateMap<DrugDose, DrugDoseViewModel>();
        CreateMap<DrugAdvice, DrugAdviceDto>();
        CreateMap<DrugAdvice, DrugAdviceViewModel>();
        CreateMap<DrugStrength, DrugStrengthDto>()
            .ForMember(d => d.UnitName, opt => opt.MapFrom(s => s.Unit != null ? s.Unit.Name : null))
            .ForMember(d => d.UnitEncryptedId, opt => opt.Ignore());
        CreateMap<DrugStrength, DrugStrengthViewModel>()
            .ForMember(d => d.UnitName, opt => opt.MapFrom(s => s.Unit != null ? s.Unit.Name : null));
        CreateMap<DrugType, DrugTypeDto>()
            .ForMember(d => d.Description, opt => opt.MapFrom(s => s.CommonUsage));
        CreateMap<DrugType, DrugTypeViewModel>()
            .ForMember(d => d.Description, opt => opt.MapFrom(s => s.CommonUsage));
        CreateMap<DrugDuration, DrugDurationDto>();
        CreateMap<DrugDuration, DrugDurationViewModel>();
        // Generic mappings
        CreateMap<Generic, GenericDto>();
        CreateMap<Generic, GenericViewModel>();



        // DrugCompany mappings
        CreateMap<DrugCompany, DrugCompanyDto>();
        CreateMap<DrugCompany, DrugCompanyViewModel>();

        // Unit mappings
        CreateMap<Unit, UnitDto>();
        CreateMap<Unit, UnitViewModel>();

        // DrugMaster mappings
        CreateMap<DrugMaster, DrugMasterDto>();
        CreateMap<DrugMaster, DrugMasterViewModel>()
            .ForMember(d => d.DrugCompanyName, opt => opt.MapFrom(s => s.DrugCompany != null ? s.DrugCompany.Name : null))
            .ForMember(d => d.DrugGenericName, opt => opt.MapFrom(s => s.Generic != null ? s.Generic.Name : null));

        // DrugDetail mappings
        CreateMap<DrugDetail, DrugDetailDto>()
            .ForMember(d => d.DrugTypeName, opt => opt.MapFrom(s => s.DrugType != null ? s.DrugType.Name : null))
            .ForMember(d => d.StrengthName, opt => opt.MapFrom(s => s.DrugStrength != null ? s.DrugStrength.Quantity : null));
        CreateMap<DrugDetail, DrugDetailViewModel>()
            .ForMember(d => d.DrugTypeName, opt => opt.MapFrom(s => s.DrugType != null ? s.DrugType.Name : null))
            .ForMember(d => d.StrengthName, opt => opt.MapFrom(s => s.DrugStrength != null ? s.DrugStrength.Quantity : null));

        CreateMap(typeof(List<>), typeof(PaginatedListViewModel<>))
            .ConvertUsing(typeof(ListToPaginatedListConverter<,>));

        CreateMap(typeof(PaginatedListViewModel<>), typeof(PaginatedListViewModel<>))
            .ConvertUsing(typeof(PaginatedListConverter<,>));

        // Patient mappings
        CreateMap<Patient, PatientDto>();
        CreateMap<Patient, PatientViewModel>();

        // Appointment mappings
        CreateMap<Appointment, AppointmentDto>();
        CreateMap<Appointment, AppointmentViewModel>()
            .ForMember(d => d.PatientName, opt => opt.MapFrom(s => s.Patient != null ? s.Patient.Name : null))
            .ForMember(d => d.PatientImage, opt => opt.MapFrom(s => s.Patient != null ? s.Patient.Image : null))
            .ForMember(d => d.PatientPhone, opt => opt.MapFrom(s => s.Patient != null ? s.Patient.Phone : null))
            .ForMember(d => d.DoctorName, opt => opt.MapFrom(s => s.Doctor != null ? s.Doctor.Name : null));

        // Treatment mappings
        CreateMap<TreatmentTemplate, TreatmentTemplateDto>();
        CreateMap<TreatmentTemplate, TreatmentTemplateViewModel>()
            .ForMember(d => d.DrugCount, opt => opt.MapFrom(s => s.TreatmentDrugs.Count));
        CreateMap<TreatmentDrug, TreatmentDrugDto>();
        CreateMap<TreatmentDrug, TreatmentDrugViewModel>()
            .ForMember(d => d.BrandName, opt => opt.MapFrom(s => s.DrugDetail != null && s.DrugDetail.DrugMaster != null ? s.DrugDetail.DrugMaster.Name : null))
            .ForMember(d => d.GenericName, opt => opt.MapFrom(s => s.DrugDetail != null && s.DrugDetail.DrugMaster != null && s.DrugDetail.DrugMaster.Generic != null ? s.DrugDetail.DrugMaster.Generic.Name : null))
            .ForMember(d => d.Strength, opt => opt.MapFrom(s => s.DrugDetail != null && s.DrugDetail.DrugStrength != null ? s.DrugDetail.DrugStrength.Quantity : null))
            .ForMember(d => d.Type, opt => opt.MapFrom(s => s.DrugDetail != null && s.DrugDetail.DrugType != null ? s.DrugDetail.DrugType.Name : null))
            .ForMember(d => d.Company, opt => opt.MapFrom(s => s.DrugDetail != null && s.DrugDetail.DrugMaster != null && s.DrugDetail.DrugMaster.DrugCompany != null ? s.DrugDetail.DrugMaster.DrugCompany.Name : null));

        // ChiefComplaint mappings
        CreateMap<ChiefComplaint, ChiefComplaintDto>();
        CreateMap<ChiefComplaint, ChiefComplaintViewModel>();

        // OnExamination mappings
        CreateMap<OnExamination, OnExaminationDto>();
        CreateMap<OnExamination, OnExaminationViewModel>();

        // Investigation mappings
        CreateMap<Investigation, InvestigationDto>();
        CreateMap<Investigation, InvestigationViewModel>();

        // Disease mappings
        CreateMap<Disease, Shared.DTOs.MainDTOs.Disease.DiseaseDto>();
        CreateMap<Disease, DiseaseViewModel>();

        // DrugDoseTemplate mappings
        CreateMap<DrugDoseTemplate, DrugDoseTemplateDto>();
        CreateMap<DrugDoseTemplate, DrugDoseTemplateViewModel>();

        // DrugDurationTemplate mappings
        CreateMap<DrugDurationTemplate, DrugDurationTemplateDto>();
        CreateMap<DrugDurationTemplate, DrugDurationTemplateViewModel>();

        // Prescription mappings
        CreateMap<Prescription, PrescriptionDto>();
        CreateMap<Prescription, PrescriptionViewModel>()
            .ForMember(d => d.PatientName, opt => opt.MapFrom(s => s.Patient != null ? s.Patient.Name : null))
            .ForMember(d => d.PatientPhone, opt => opt.MapFrom(s => s.Patient != null ? s.Patient.Phone : null));
        CreateMap<PrescriptionMedicine, PrescriptionMedicineDto>()
            .ForMember(d => d.MedicineName, opt => opt.MapFrom(s => s.DrugDetail != null && s.DrugDetail.DrugMaster != null ? s.DrugDetail.DrugMaster.Name : null))
            .ForMember(d => d.DrugTypeName, opt => opt.MapFrom(s => s.DrugDetail != null && s.DrugDetail.DrugType != null ? s.DrugDetail.DrugType.Name : null))
            .ForMember(d => d.StrengthName, opt => opt.MapFrom(s => s.DrugDetail != null && s.DrugDetail.DrugStrength != null ? s.DrugDetail.DrugStrength.Quantity : null));
    }
}