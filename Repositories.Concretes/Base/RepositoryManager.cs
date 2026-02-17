using Domain.Data;
using Domain.Models;
using Microsoft.AspNetCore.Identity;
using Repositories.Concretes.RepositoryInfrastructure;
using Repositories.Concretes.RepositoryInfrastructure.WorkflowEngine;
using Repositories.Contracts.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Repositories.Contracts.RepositoryInterfaces.WorkflowEngine;
using Shared.Cryptography;

namespace Repositories.Concretes.Base;

public sealed class RepositoryManager(WfDbContext context,
    EncryptionHelper encryptionHelper,
    UserManager<ApplicationUser> userManager) : IRepositoryManager
{
    private readonly Lazy<IKeywordRepository> _keyword = new(() => new KeywordRepository(context));
    private readonly Lazy<IUserInformationRepository> _userInformation = new(() => new UserInformationRepository(context, userManager));
    private readonly Lazy<IEmailFormatRepository> _emailFormat = new(() => new EmailFormatRepository(context, encryptionHelper));
    private readonly Lazy<ITrustedDeviceRepository> _trustedDevice = new(() => new TrustedDeviceRepository(context));
    private readonly Lazy<ICompanyRegistrationRepository> _companyRegistration = new(() => new CompanyRegistrationRepository(context));
    private readonly Lazy<IRoleRepository> _role = new(() => new RoleRepository(context));
    private readonly Lazy<IPackageRepository> _package = new(() => new PackageRepository(context, encryptionHelper));
    private readonly Lazy<IFeatureRepository> _feature = new(() => new FeatureRepository(context));
    private readonly Lazy<IPackageFeatureRepository> _packageFeature = new(() => new PackageFeatureRepository(context));
    private readonly Lazy<IDoctorRepository> _doctor = new(() => new DoctorRepository(context));
    private readonly Lazy<IBranchRepository> _branch = new(() => new BranchRepository(context, encryptionHelper));
    private readonly Lazy<IOnboardingStepRepository> _onboardingStep = new(() => new OnboardingStepRepository(context, encryptionHelper));
    private readonly Lazy<IUserOnboardingProgressRepository> _userOnboardingProgress = new(() => new UserOnboardingProgressRepository(context));
    private readonly Lazy<IDrugDoseRepository> _drugDose = new(() => new DrugDoseRepository(context, encryptionHelper));
    private readonly Lazy<IDrugAdviceRepository> _drugAdvice = new(() => new DrugAdviceRepository(context, encryptionHelper));
    private readonly Lazy<IDrugStrengthRepository> _drugStrength = new(() => new DrugStrengthRepository(context, encryptionHelper));
    private readonly Lazy<IDrugTypeRepository> _drugType = new(() => new DrugTypeRepository(context, encryptionHelper));
    private readonly Lazy<IDrugDurationRepository> _drugDuration = new(() => new DrugDurationRepository(context, encryptionHelper));
    private readonly Lazy<IGenericRepository> _generic = new(() => new GenericRepository(context, encryptionHelper));
    private readonly Lazy<IDrugCompanyRepository> _drugCompany = new(() => new DrugCompanyRepository(context, encryptionHelper));
    private readonly Lazy<IUnitRepository> _unit = new(() => new UnitRepository(context, encryptionHelper));
    private readonly Lazy<IDrugMasterRepository> _drugMaster = new(() => new DrugMasterRepository(context, encryptionHelper));
    private readonly Lazy<IDrugDetailRepository> _drugDetail = new(() => new DrugDetailRepository(context));
    private readonly Lazy<IClinicalDeptRepository> _clinicalDept = new(() => new ClinicalDeptRepository(context, encryptionHelper));
    private readonly Lazy<IAppointmentRepository> _appointment = new(() => new AppointmentRepository(context));
    private readonly Lazy<IPatientRepository> _patient = new(() => new PatientRepository(context));
    private readonly Lazy<ITreatmentRepository> _treatment = new(() => new TreatmentRepository(context));
    private readonly Lazy<ITreatmentDrugRepository> _treatmentDrug = new(() => new TreatmentDrugRepository(context));
    private readonly Lazy<IChiefComplaintRepository> _chiefComplaint = new(() => new ChiefComplaintRepository(context, encryptionHelper));
    private readonly Lazy<IOnExaminationRepository> _onExamination = new(() => new OnExaminationRepository(context, encryptionHelper));
    private readonly Lazy<IInvestigationRepository> _investigation = new(() => new InvestigationRepository(context, encryptionHelper));
    private readonly Lazy<IDiseaseRepository> _disease = new(() => new DiseaseRepository(context, encryptionHelper));
    private readonly Lazy<IDrugDoseTemplateRepository> _drugDoseTemplate = new(() => new DrugDoseTemplateRepository(context, encryptionHelper));
    private readonly Lazy<IDrugDurationTemplateRepository> _drugDurationTemplate = new(() => new DrugDurationTemplateRepository(context, encryptionHelper));
    private readonly Lazy<IPrescriptionRepository> _prescription = new(() => new PrescriptionRepository(context));

    public IKeywordRepository Keyword => _keyword.Value;
    public IUserInformationRepository User => _userInformation.Value;
    public IEmailFormatRepository EmailFormat => _emailFormat.Value;
    public ITrustedDeviceRepository TrustedDevice => _trustedDevice.Value;
    public ICompanyRegistrationRepository CompanyRegistration => _companyRegistration.Value;
    public IRoleRepository Role => _role.Value;
    public IPackageRepository Package => _package.Value;
    public IFeatureRepository Feature => _feature.Value;
    public IPackageFeatureRepository PackageFeature => _packageFeature.Value;
    public IDoctorRepository Doctor => _doctor.Value;
    public IBranchRepository Branch => _branch.Value;
    public IOnboardingStepRepository OnboardingStep => _onboardingStep.Value;
    public IUserOnboardingProgressRepository UserOnboardingProgress => _userOnboardingProgress.Value;
    public IDrugDoseRepository DrugDose => _drugDose.Value;
    public IDrugAdviceRepository DrugAdvice => _drugAdvice.Value;
    public IDrugStrengthRepository DrugStrength => _drugStrength.Value;
    public IDrugTypeRepository DrugType => _drugType.Value;
    public IDrugDurationRepository DrugDuration => _drugDuration.Value;
    public IGenericRepository Generic => _generic.Value;
    public IDrugCompanyRepository DrugCompany => _drugCompany.Value;
    public IUnitRepository Unit => _unit.Value;
    public IDrugMasterRepository DrugMaster => _drugMaster.Value;
    public IDrugDetailRepository DrugDetail => _drugDetail.Value;
    public IClinicalDeptRepository ClinicalDept => _clinicalDept.Value;
    public IAppointmentRepository Appointment => _appointment.Value;
    public IPatientRepository Patient => _patient.Value;
    public ITreatmentRepository Treatment => _treatment.Value;
    public ITreatmentDrugRepository TreatmentDrug => _treatmentDrug.Value;
    public IChiefComplaintRepository ChiefComplaint => _chiefComplaint.Value;
    public IOnExaminationRepository OnExamination => _onExamination.Value;
    public IInvestigationRepository Investigation => _investigation.Value;
    public IDiseaseRepository Disease => _disease.Value;
    public IDrugDoseTemplateRepository DrugDoseTemplate => _drugDoseTemplate.Value;
    public IDrugDurationTemplateRepository DrugDurationTemplate => _drugDurationTemplate.Value;
    public IPrescriptionRepository Prescription => _prescription.Value;
}