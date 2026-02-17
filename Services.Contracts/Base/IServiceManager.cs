using Services.Contracts.ServiceInterfaces;

namespace Services.Contracts.Base;

public interface IServiceManager
{
    public IMenuMasterService MenuMaster { get; }
    public IUserService User { get; }
    public IEmailFormatService EmailFormat { get; }
    public IRoleService Role { get; }
    public IDashboardService Dashboard { get; }
    public IOnboardingService Onboarding { get; }
    public IPackageService Package { get; }
    public IFeatureService Feature { get; }
    public IPackageFeatureService PackageFeature { get; }
    public IDoctorService Doctor { get; }
    public IBranchService Branch { get; }
    public IOnboardingStepService OnboardingStep { get; }
    public IDrugDoseService DrugDose { get; }
    public IDrugAdviceService DrugAdvice { get; }
    public IDrugStrengthService DrugStrength { get; }
    public IDrugTypeService DrugType { get; }
    public IDrugDurationService DrugDuration { get; }
    public IGenericService Generic { get; }
    public IDrugCompanyService DrugCompany { get; }
    public IUnitService Unit { get; }
    public IDrugMasterService DrugMaster { get; }
    public IAppointmentService Appointment { get; }
    public IPatientService Patient { get; }
    public ITreatmentService Treatment { get; }
    public IChiefComplaintService ChiefComplaint { get; }
    public IOnExaminationService OnExamination { get; }
    public IInvestigationService Investigation { get; }
    public IDiseaseService Disease { get; }
    public IDrugDoseTemplateService DrugDoseTemplate { get; }
    public IDrugDurationTemplateService DrugDurationTemplate { get; }
    public IPrescriptionService Prescription { get; }
}