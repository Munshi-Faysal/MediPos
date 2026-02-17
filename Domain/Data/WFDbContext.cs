using Domain.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Domain.Data;

public class WfDbContext(DbContextOptions<WfDbContext> options) : IdentityDbContext<ApplicationUser, ApplicationRole, int>(options)
{
    public virtual DbSet<WfEmailFormat> WfEmailFormats { get; set; }
    public virtual DbSet<TrustedDevice> TrustedDevices { get; set; }
    public virtual DbSet<WfBaseKeyword> WfBaseKeywords { get; set; }
    public virtual DbSet<WfMenuDetail> WfMenuDetails { get; set; }
    public virtual DbSet<WfMenuMaster> WfMenuMasters { get; set; }
    public virtual DbSet<CompanyRegistration> CompanyRegistrations { get; set; }
    public virtual DbSet<Package> Packages { get; set; }
    public virtual DbSet<Feature> Features { get; set; }
    public virtual DbSet<PackageFeature> PackageFeatures { get; set; }
    public virtual DbSet<Doctor> Doctors { get; set; }
    public virtual DbSet<Branch> Branches { get; set; }
    public virtual DbSet<OnboardingStep> OnboardingSteps { get; set; }
    public virtual DbSet<UserOnboardingProgress> UserOnboardingProgress { get; set; }
    public virtual DbSet<DrugDose> DrugDoses { get; set; }
    public virtual DbSet<DrugAdvice> DrugAdvices { get; set; }
    public virtual DbSet<DrugStrength> DrugStrengths { get; set; }
    public virtual DbSet<DrugType> DrugTypes { get; set; }
    public virtual DbSet<DrugDuration> DrugDurations { get; set; }
    public virtual DbSet<Generic> Generics { get; set; }
    public virtual DbSet<DrugCompany> DrugCompanies { get; set; }
    public virtual DbSet<Unit> Units { get; set; }
    public virtual DbSet<DrugMaster> DrugMasters { get; set; }
    public virtual DbSet<DrugDetail> DrugDetails { get; set; }
    public virtual DbSet<ClinicalDept> ClinicalDepts { get; set; }
    public virtual DbSet<Patient> Patients { get; set; }
    public virtual DbSet<Appointment> Appointments { get; set; }
    public virtual DbSet<TreatmentTemplate> TreatmentTemplates { get; set; }
    public virtual DbSet<TreatmentDrug> TreatmentDrugs { get; set; }
    public virtual DbSet<ChiefComplaint> ChiefComplaints { get; set; }
    public virtual DbSet<OnExamination> OnExaminations { get; set; }
    public virtual DbSet<Investigation> Investigations { get; set; }
    public virtual DbSet<DrugDoseTemplate> DrugDoseTemplates { get; set; }
    public virtual DbSet<DrugDurationTemplate> DrugDurationTemplates { get; set; }
    public virtual DbSet<Prescription> Prescriptions { get; set; }
    public virtual DbSet<PrescriptionMedicine> PrescriptionMedicines { get; set; }
    public virtual DbSet<Disease> Diseases { get; set; }



    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<WfEmailFormat>(entity =>
        {
            entity.ToTable("WfEmailFormat");

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.EmailBody).HasMaxLength(1000).IsUnicode(false);
            entity.Property(e => e.EmailFormatType).HasMaxLength(50).IsUnicode(false);
            entity.Property(e => e.EmailSubject).HasMaxLength(250).IsUnicode(false);
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");
        });

        modelBuilder.Entity<TrustedDevice>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__TrustedD__3214EC07E179822F");

            entity.ToTable("TrustedDevice");

            entity.Property(e => e.Browser)
                .HasMaxLength(256)
                .IsUnicode(false);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.IpAddress)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.LastUsedDate).HasColumnType("datetime");
            entity.Property(e => e.OperatingSystem)
                .HasMaxLength(128)
                .IsUnicode(false);

            entity.HasOne(e => e.User)
                .WithMany(u => u.TrustedDevices)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<WfBaseKeyword>(entity =>
        {
            entity.ToTable("WfBaseKeyword");

            entity.Property(e => e.KeywordCode).HasMaxLength(50);
            entity.Property(e => e.KeywordText).HasMaxLength(50).IsUnicode(false);
            entity.Property(e => e.KeywordType).HasMaxLength(20).IsUnicode(false);
        });

        modelBuilder.Entity<WfMenuDetail>(entity =>
        {
            entity.ToTable("WfMenuDetail");

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasOne(d => d.MenuMaster).WithMany(p => p.WfMenuDetails)
                .HasForeignKey(d => d.MenuMasterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_WfMenuDetail_WfMenuMaster");
        });

        modelBuilder.Entity<WfMenuMaster>(entity =>
        {
            entity.ToTable("WfMenuMaster");

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.MenuName)
                .HasMaxLength(80)
                .IsUnicode(false);
            entity.Property(e => e.MenuPath)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.MenuIcon)
               .HasMaxLength(30)
               .IsUnicode(false);
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasOne(d => d.ParentMenu).WithMany(p => p.InverseParentMenu)
                .HasForeignKey(d => d.ParentMenuId)
                .HasConstraintName("FK_WfMenuMaster_WfMenuMaster");
        });


        modelBuilder.Entity<CompanyRegistration>(entity =>
        {
            entity.ToTable("CompanyRegistration");

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");
            entity.Property(e => e.OrganizationName).HasMaxLength(200);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.PackageName).HasMaxLength(100);
            entity.Property(e => e.PackagePrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.PackageFeatures).HasMaxLength(1000);
            entity.Property(e => e.PaymentStatus).HasMaxLength(50);
            entity.Property(e => e.CardNumber).HasMaxLength(50);
            entity.Property(e => e.CardHolder).HasMaxLength(200);
            entity.Property(e => e.ExpiryDate).HasMaxLength(10);

            entity.Property(e => e.ApprovalStatus).HasMaxLength(50).IsUnicode(false);
            entity.Property(e => e.RejectionReason).IsUnicode(true);
            entity.Property(e => e.BillingCycleDate).HasColumnType("datetime2");
            entity.Property(e => e.ApprovedAt).HasColumnType("datetime2");
            entity.Property(e => e.ApprovedBy).HasColumnType("int");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Package>(entity =>
        {
            entity.ToTable("Package");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Price)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            entity.Property(e => e.Duration)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.Description)
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(e => e.IsPopular)
                .HasDefaultValue(false);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_Package_IsActive");
        });

        modelBuilder.Entity<Feature>(entity =>
        {
            entity.ToTable("Feature");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Description)
                .HasMaxLength(500);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_Feature_IsActive");
        });

        modelBuilder.Entity<PackageFeature>(entity =>
        {
            entity.ToTable("PackageFeature");

            entity.HasKey(e => e.Id);

            

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.PackageId).HasDatabaseName("IX_PackageFeature_PackageId");
            entity.HasIndex(e => e.FeatureId).HasDatabaseName("IX_PackageFeature_FeatureId");

            entity.HasOne(e => e.Package)
                .WithMany(p => p.PackageFeatures)
                .HasForeignKey(e => e.PackageId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_PackageFeature_Package");

            entity.HasOne(e => e.Feature)
                .WithMany(f => f.PackageFeatures)
                .HasForeignKey(e => e.FeatureId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_PackageFeature_Feature");

            entity.HasIndex(e => new { e.PackageId, e.FeatureId }).IsUnique().HasDatabaseName("UQ_PackageFeature");
        });

        modelBuilder.Entity<Branch>(entity =>
        {
            entity.ToTable("Branch");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Description)
                .HasMaxLength(500);

            entity.Property(e => e.Code)
                .HasMaxLength(20);

            entity.Property(e => e.Address)
                .HasMaxLength(500);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_Branch_IsActive");
            entity.HasIndex(e => e.Code).IsUnique().HasDatabaseName("UQ_Branch_Code");
        });

        modelBuilder.Entity<OnboardingStep>(entity =>
        {
            entity.ToTable("OnboardingStep");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.StepKey)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Description)
                .HasMaxLength(500);

            entity.Property(e => e.Route)
                .HasMaxLength(500);

            entity.Property(e => e.Icon)
                .HasMaxLength(1000);

            entity.Property(e => e.IsRequired)
                .HasDefaultValue(true);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.StepKey).IsUnique().HasDatabaseName("UQ_OnboardingStep_StepKey");
            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_OnboardingStep_IsActive");
        });

        modelBuilder.Entity<UserOnboardingProgress>(entity =>
        {
            entity.ToTable("UserOnboardingProgress");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.IsCompleted)
                .HasDefaultValue(false);

            entity.Property(e => e.CompletedAt).HasColumnType("datetime");
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => new { e.UserId, e.OnboardingStepId }).IsUnique().HasDatabaseName("UQ_UserOnboardingProgress");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_UserOnboardingProgress_User");

            entity.HasOne(e => e.OnboardingStep)
                .WithMany()
                .HasForeignKey(e => e.OnboardingStepId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_UserOnboardingProgress_OnboardingStep");
        });

        modelBuilder.Entity<DrugDose>(entity =>
        {
            entity.ToTable("DrugDose");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Description)
                .HasMaxLength(500);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_DrugDose_IsActive");
            entity.HasIndex(e => e.DoctorId).HasDatabaseName("IX_DrugDose_DoctorId");

            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_DrugDose_Doctor");
        });

        modelBuilder.Entity<DrugAdvice>(entity =>
        {
            entity.ToTable("DrugAdvice");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Description)
                .HasMaxLength(500);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_DrugAdvice_IsActive");
            entity.HasIndex(e => e.DoctorId).HasDatabaseName("IX_DrugAdvice_DoctorId");

            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_DrugAdvice_Doctor");
        });

        modelBuilder.Entity<DrugStrength>(entity =>
        {
            entity.ToTable("DrugStrength");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Quantity)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_DrugStrength_IsActive");
        });

        modelBuilder.Entity<DrugType>(entity =>
        {
            entity.ToTable("DrugType");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.CommonUsage)
                .HasMaxLength(500);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_DrugType_IsActive");
        });

        modelBuilder.Entity<DrugDuration>(entity =>
        {
            entity.ToTable("DrugDuration");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Description)
                .HasMaxLength(500);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_DrugDuration_IsActive");
        });

        modelBuilder.Entity<DrugCompany>(entity =>
        {
            entity.ToTable("DrugCompany");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Description)
                .HasMaxLength(500);

            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_DrugCompany_IsActive");
        });

        modelBuilder.Entity<Generic>(entity =>
        {
            entity.ToTable("Generic");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Indication)
                .HasMaxLength(500);

            entity.Property(e => e.SideEffects)
                .HasMaxLength(500);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_Generic_IsActive");
        });

        modelBuilder.Entity<ClinicalDept>(entity =>
        {
            entity.ToTable("ClinicalDept");

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.IsActive).HasDefaultValue(true, "DF_ClinicalDept_IsActive");
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");
        });

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.ToTable("Doctor");

            entity.HasIndex(e => e.UserId, "IX_Doctor_UserId");

            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.BillingDate).HasColumnType("datetime");
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.LicenseExpiryDate).HasColumnType("datetime");
            entity.Property(e => e.LicenseNumber).HasMaxLength(50);
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Password).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasOne(d => d.ClinicalDept).WithMany(p => p.Doctors)
                .HasForeignKey(d => d.ClinicalDeptId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Doctor_ClinicalDept");

            entity.HasOne(d => d.OperationStatus).WithMany(p => p.Doctors)
                .HasForeignKey(d => d.OperationStatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Doctor_BaseKeyword_SOS");
        });
        modelBuilder.Entity<DrugMaster>(entity =>
        {
            entity.ToTable("DrugMasters");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(500);

            entity.HasOne(d => d.DrugCompany)
                .WithMany(p => p.DrugMasters)
                .HasForeignKey(d => d.DrugCompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.Generic)
                .WithMany(p => p.DrugMasters)
                .HasForeignKey(d => d.DrugGenericId)
                .OnDelete(DeleteBehavior.SetNull);
            
        });

        modelBuilder.Entity<DrugDetail>(entity =>
        {
            entity.ToTable("DrugDetails");
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Description).HasMaxLength(500);

            entity.HasOne(d => d.DrugMaster)
                .WithMany(p => p.DrugDetails)
                .HasForeignKey(d => d.DrugMasterId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_DrugDetails_DrugMasters_DrugMasterId");

            entity.HasOne(d => d.DrugType)
                .WithMany(p => p.DrugDetails)
                .HasForeignKey(d => d.DrugTypeId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_DrugDetails_DrugType_DrugTypeId");

            entity.HasOne(d => d.DrugStrength)
                .WithMany(p => p.DrugDetails)
                .HasForeignKey(d => d.DrugStrengthId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_DrugDetails_DrugStrength_DrugStrengthId");
        });

        modelBuilder.Entity<Patient>(entity =>
        {
            entity.ToTable("Patient");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.Age).HasColumnType("int");
            entity.Property(e => e.Gender).HasMaxLength(20);
            entity.Property(e => e.BloodGroup).HasMaxLength(10);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.Image).HasMaxLength(500);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.ToTable("Appointment");
            entity.Property(e => e.DateTime).IsRequired().HasColumnType("datetime");
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasOne(d => d.Patient)
                .WithMany(p => p.Appointments)
                .HasForeignKey(d => d.PatientId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Appointment_Patient");

            entity.HasOne(d => d.Doctor)
                .WithMany()
                .HasForeignKey(d => d.DoctorId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Appointment_Doctor");
        });

        modelBuilder.Entity<TreatmentTemplate>(entity =>
        {
            entity.ToTable("TreatmentTemplate");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasOne(d => d.Doctor)
                .WithMany()
                .HasForeignKey(d => d.DoctorId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_TreatmentTemplate_Doctor");
        });

        modelBuilder.Entity<TreatmentDrug>(entity =>
        {
            entity.ToTable("TreatmentDrug");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Dose).HasMaxLength(100);
            entity.Property(e => e.Duration).HasMaxLength(100);
            entity.Property(e => e.DurationType).HasMaxLength(50);
            entity.Property(e => e.Instruction).HasMaxLength(50);
            entity.Property(e => e.InstructionText).HasMaxLength(200);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasOne(d => d.TreatmentTemplate)
                .WithMany(p => p.TreatmentDrugs)
                .HasForeignKey(d => d.TreatmentTemplateId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_TreatmentDrug_TreatmentTemplate");

            entity.HasOne(d => d.DrugDetail)
                .WithMany()
                .HasForeignKey(d => d.DrugDetailId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_TreatmentDrug_DrugDetail");
        });

        modelBuilder.Entity<ChiefComplaint>(entity =>
        {
            entity.ToTable("ChiefComplaint");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Description)
                .HasMaxLength(1000);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_ChiefComplaint_IsActive");
            entity.HasIndex(e => e.DoctorId).HasDatabaseName("IX_ChiefComplaint_DoctorId");

            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_ChiefComplaint_Doctor");
        });

        modelBuilder.Entity<OnExamination>(entity =>
        {
            entity.ToTable("OnExamination");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Description)
                .HasMaxLength(1000);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_OnExamination_IsActive");
            entity.HasIndex(e => e.DoctorId).HasDatabaseName("IX_OnExamination_DoctorId");

            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_OnExamination_Doctor");
        });

        modelBuilder.Entity<Investigation>(entity =>
        {
            entity.ToTable("Investigation");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Description)
                .HasMaxLength(1000);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_Investigation_IsActive");
            entity.HasIndex(e => e.DoctorId).HasDatabaseName("IX_Investigation_DoctorId");

            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Investigation_Doctor");
        });

        modelBuilder.Entity<DrugDoseTemplate>(entity =>
        {
            entity.ToTable("DrugDoseTemplate");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Description)
                .HasMaxLength(1000);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_DrugDoseTemplate_IsActive");
            entity.HasIndex(e => e.DoctorId).HasDatabaseName("IX_DrugDoseTemplate_DoctorId");

            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_DrugDoseTemplate_Doctor");
        });

        modelBuilder.Entity<DrugDurationTemplate>(entity =>
        {
            entity.ToTable("DrugDurationTemplate");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Description)
                .HasMaxLength(1000);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_DrugDurationTemplate_IsActive");
            entity.HasIndex(e => e.DoctorId).HasDatabaseName("IX_DrugDurationTemplate_DoctorId");

            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_DrugDurationTemplate_Doctor");
        });

        modelBuilder.Entity<Prescription>(entity =>
        {
            entity.ToTable("Prescription");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PrescriptionDate).HasColumnType("datetime");
            entity.Property(e => e.PatientName).HasMaxLength(200);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasOne(d => d.Doctor)
                .WithMany()
                .HasForeignKey(d => d.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.Patient)
                .WithMany()
                .HasForeignKey(d => d.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.Appointment)
                .WithMany()
                .HasForeignKey(d => d.AppointmentId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<PrescriptionMedicine>(entity =>
        {
            entity.ToTable("PrescriptionMedicine");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Dosage).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Duration).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,2)");
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasOne(d => d.Prescription)
                .WithMany(p => p.Medicines)
                .HasForeignKey(d => d.PrescriptionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.DrugDetail)
                .WithMany()
                .HasForeignKey(d => d.DrugDetailId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}