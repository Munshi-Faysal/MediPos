using AutoMapper;
using Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Repositories.Contracts.Base;
using Services.Concretes.ServiceInfrastructure;
using Services.Concretes.ServiceInfrastructure.WorkflowEngine;
using Services.Contracts.Base;
using Services.Contracts.ServiceInterfaces;
using Shared.Common;
using Shared.Cryptography;

namespace Services.Concretes.Base;

public class ServiceManager(IRepositoryManager repository,
    EncryptionHelper encryptionHelper,
    IMapper mapper,
    UserManager<ApplicationUser> userManager,
    RoleManager<ApplicationRole> roleManager,
    IAppMailService appMailService,
    IHttpContextAccessor httpContextAccessor,
    IOptions<DefaultSettings> defaultSettings) : IServiceManager
{
    private readonly Lazy<IMenuMasterService> _menuMaster = new(() => new MenuMasterService(userManager, httpContextAccessor));
    private readonly Lazy<IUserService> _user = new(() => new UserService(userManager, repository, httpContextAccessor, mapper));
    private readonly Lazy<IEmailFormatService> _emailFormat = new(() => new EmailFormatService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IRoleService> _role = new(() => new RoleService(roleManager, userManager, httpContextAccessor, repository, mapper));
    private readonly Lazy<IDashboardService> _dashboard = new(() => new DashboardService(userManager, httpContextAccessor, repository));
    private readonly Lazy<IOnboardingService> _onboarding = new(() => new OnboardingService(userManager, httpContextAccessor, repository, appMailService, mapper));
    private readonly Lazy<IPackageService> _package = new(() => new PackageService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IFeatureService> _feature = new(() => new FeatureService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IPackageFeatureService> _packageFeature = new(() => new PackageFeatureService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IDoctorService> _doctor = new(() => new DoctorService(defaultSettings,userManager, roleManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IBranchService> _branch = new(() => new BranchService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IOnboardingStepService> _onboardingStep = new(() => new OnboardingStepService(userManager, httpContextAccessor, repository, mapper));
    private readonly Lazy<IDrugDoseService> _drugDose = new(() => new DrugDoseService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IDrugAdviceService> _drugAdvice = new(() => new DrugAdviceService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IDrugStrengthService> _drugStrength = new(() => new DrugStrengthService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IDrugTypeService> _drugType = new(() => new DrugTypeService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IDrugDurationService> _drugDuration = new(() => new DrugDurationService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IGenericService> _generic = new(() => new GenericService(userManager, httpContextAccessor, repository, mapper));
    private readonly Lazy<IDrugCompanyService> _drugCompany = new(() => new DrugCompanyService(userManager, httpContextAccessor, repository, mapper));
    private readonly Lazy<IUnitService> _unit = new(() => new UnitService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IDrugMasterService> _drugMaster = new(() => new DrugMasterService(userManager, httpContextAccessor, repository, mapper));
    private readonly Lazy<IAppointmentService> _appointment = new(() => new AppointmentService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IPatientService> _patient = new(() => new PatientService(userManager, httpContextAccessor, repository, mapper));
    private readonly Lazy<ITreatmentService> _treatment = new(() => new TreatmentService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IChiefComplaintService> _chiefComplaint = new(() => new ChiefComplaintService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IOnExaminationService> _onExamination = new(() => new OnExaminationService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IInvestigationService> _investigation = new(() => new InvestigationService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IDiseaseService> _disease = new(() => new DiseaseService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IDrugDoseTemplateService> _drugDoseTemplate = new(() => new DrugDoseTemplateService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IDrugDurationTemplateService> _drugDurationTemplate = new(() => new DrugDurationTemplateService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));
    private readonly Lazy<IPrescriptionService> _prescription = new(() => new PrescriptionService(userManager, httpContextAccessor, repository, encryptionHelper, mapper));

    public IMenuMasterService MenuMaster => _menuMaster.Value;
    public IUserService User => _user.Value;
    public IEmailFormatService EmailFormat => _emailFormat.Value;
    public IRoleService Role => _role.Value;
    public IDashboardService Dashboard => _dashboard.Value;
    public IOnboardingService Onboarding => _onboarding.Value;
    public IPackageService Package => _package.Value;
    public IFeatureService Feature => _feature.Value;
    public IPackageFeatureService PackageFeature => _packageFeature.Value;
    public IDoctorService Doctor => _doctor.Value;
    public IBranchService Branch => _branch.Value;
    public IOnboardingStepService OnboardingStep => _onboardingStep.Value;
    public IDrugDoseService DrugDose => _drugDose.Value;
    public IDrugAdviceService DrugAdvice => _drugAdvice.Value;
    public IDrugStrengthService DrugStrength => _drugStrength.Value;
    public IDrugTypeService DrugType => _drugType.Value;
    public IDrugDurationService DrugDuration => _drugDuration.Value;
    public IGenericService Generic => _generic.Value;
    public IDrugCompanyService DrugCompany => _drugCompany.Value;
    public IUnitService Unit => _unit.Value;
    public IDrugMasterService DrugMaster => _drugMaster.Value;
    public IAppointmentService Appointment => _appointment.Value;
    public IPatientService Patient => _patient.Value;
    public ITreatmentService Treatment => _treatment.Value;
    public IChiefComplaintService ChiefComplaint => _chiefComplaint.Value;
    public IOnExaminationService OnExamination => _onExamination.Value;
    public IInvestigationService Investigation => _investigation.Value;
    public IDiseaseService Disease => _disease.Value;
    public IDrugDoseTemplateService DrugDoseTemplate => _drugDoseTemplate.Value;
    public IDrugDurationTemplateService DrugDurationTemplate => _drugDurationTemplate.Value;
    public IPrescriptionService Prescription => _prescription.Value;
}