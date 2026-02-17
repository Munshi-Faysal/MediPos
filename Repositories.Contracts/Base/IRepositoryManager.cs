using Repositories.Contracts.RepositoryInterfaces;
using Repositories.Contracts.RepositoryInterfaces.WorkflowEngine;

namespace Repositories.Contracts.Base;

public interface IRepositoryManager
{
    public IKeywordRepository Keyword { get; }
    public IUserInformationRepository User { get; }
    public IEmailFormatRepository EmailFormat { get; }
    public ITrustedDeviceRepository TrustedDevice { get; }
    public ICompanyRegistrationRepository CompanyRegistration { get; }
    public IRoleRepository Role { get; }
    public IPackageRepository Package { get; }
    public IFeatureRepository Feature { get; }
    public IPackageFeatureRepository PackageFeature { get; }
    public IDoctorRepository Doctor { get; }
    public IBranchRepository Branch { get; }
    public IOnboardingStepRepository OnboardingStep { get; }
    public IUserOnboardingProgressRepository UserOnboardingProgress { get; }
    public IDrugDoseRepository DrugDose { get; }
    public IDrugAdviceRepository DrugAdvice { get; }
    public IDrugStrengthRepository DrugStrength { get; }
    public IDrugTypeRepository DrugType { get; }
    public IDrugDurationRepository DrugDuration { get; }
    public IGenericRepository Generic { get; }
    public IDrugCompanyRepository DrugCompany { get; }
    public IUnitRepository Unit { get; }
    public IDrugMasterRepository DrugMaster { get; }
    public IDrugDetailRepository DrugDetail { get; }
    public IClinicalDeptRepository ClinicalDept { get; }
    public IAppointmentRepository Appointment { get; }
    public IPatientRepository Patient { get; }
    public ITreatmentRepository Treatment { get; }
    public ITreatmentDrugRepository TreatmentDrug { get; }
    public IChiefComplaintRepository ChiefComplaint { get; }
    public IOnExaminationRepository OnExamination { get; }
    public IInvestigationRepository Investigation { get; }
    public IDiseaseRepository Disease { get; }
    public IDrugDoseTemplateRepository DrugDoseTemplate { get; }
    public IDrugDurationTemplateRepository DrugDurationTemplate { get; }
    public IPrescriptionRepository Prescription { get; }
}