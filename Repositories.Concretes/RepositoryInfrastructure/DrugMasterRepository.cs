using Domain.Data;
using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Concretes.Base;
using Repositories.Contracts.RepositoryInterfaces;
using Shared.Cryptography;
using Shared.DTOs.ViewModels;

namespace Repositories.Concretes.RepositoryInfrastructure;

internal sealed class DrugMasterRepository(WfDbContext context, EncryptionHelper encryptionHelper)
    : BaseRepository<DrugMaster>(context), IDrugMasterRepository
{
    private readonly WfDbContext _context = context;

    public async Task<IEnumerable<DrugMaster>> GetListAsync(int take, int skip)
    {
        return await _context.DrugMasters
            .Where(d => d.IsActive)
            .Include(d => d.Generic)            
            .Include(d => d.DrugCompany)
            .OrderBy(d => d.Name)
            .Skip(skip)
            .Take(take)
            .Select(d => new DrugMaster
            {
                EncryptedId = d.Id.ToString(),
                Id = d.Id,
                Name = d.Name,
                Code = d.Code,
                Description = d.Description,
                DrugCompanyId = d.DrugCompanyId,              
                DrugGenericId = d.DrugGenericId,               
                DrugCompany = d.DrugCompany,
                Generic = d.Generic,
                DrugDetails = d.DrugDetails.Select(dd => new DrugDetail
                {
                    Id = dd.Id,
                    DrugTypeId = dd.DrugTypeId,
                    DrugStrengthId = dd.DrugStrengthId,
                    DrugType = dd.DrugType,
                    DrugStrength = dd.DrugStrength,
                    UnitPrice = dd.UnitPrice,
                    Description = dd.Description,
                    IsActive = dd.IsActive
                }).ToList(),
                IsActive = d.IsActive,
                CreatedDate = d.CreatedDate,
                UpdatedDate = d.UpdatedDate
            }).ToListAsync();
    }

    public async Task<DrugMaster?> GetDetailsAsync(int id)
    {
        return await _context.DrugMasters
            .Where(d => d.Id == id)
            .Include(d => d.Generic)
            .Include(d => d.DrugCompany)
            .Include(d => d.DrugDetails)
                .ThenInclude(dd => dd.DrugType)
            .Include(d => d.DrugDetails)
                .ThenInclude(dd => dd.DrugStrength)
                    .ThenInclude(ds => ds.Unit)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<DrugMaster>> GetActiveListAsync()
    {
        return await _context.DrugMasters
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .Select(d => new DrugMaster
            {
                EncryptedId = d.Id.ToString(),
                Id = d.Id,
                Name = d.Name,
                Code = d.Code,
                IsActive = d.IsActive
            }).ToListAsync();
    }

    public async Task<IEnumerable<DrugMaster>> SearchAsync(string term, int take = 50)
    {
        var query = _context.DrugMasters
            .Where(d => d.IsActive);

        if (!string.IsNullOrWhiteSpace(term))
        {
            term = term.ToLower();
            query = query.Where(d => 
                d.Name.ToLower().Contains(term) || 
                (d.Generic != null && d.Generic.Name.ToLower().Contains(term)) ||
                (d.DrugCompany != null && d.DrugCompany.Name.ToLower().Contains(term))
            );
        }

        return await query
            .OrderBy(d => d.Name)
            .Include(d => d.Generic)
            .Include(d => d.DrugCompany)
            .Include(d => d.DrugDetails)
                .ThenInclude(dd => dd.DrugType)
            .Include(d => d.DrugDetails)
                .ThenInclude(dd => dd.DrugStrength)
                    .ThenInclude(ds => ds.Unit)
            .Take(take)
            .ToListAsync();
    }

    public async Task<(IEnumerable<DrugMasterViewModel> items, int totalCount)> GetDrugPresentationsAsync(int take, int skip, string? search = null, string? type = null)
    {
        var query = _context.DrugDetails
            .AsNoTracking()
            .Where(dd => dd.IsActive && dd.DrugMaster != null && dd.DrugMaster.IsActive);

        if (!string.IsNullOrWhiteSpace(type) && !type.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(dd => dd.DrugType != null && dd.DrugType.Name == type);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var terms = search.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            foreach (var term in terms)
            {
                var t = term;
                query = query.Where(dd => 
                    dd.DrugMaster!.Name.Contains(t) ||
                    dd.DrugMaster.Code.Contains(t) ||
                    (dd.DrugMaster.Generic != null && dd.DrugMaster.Generic.Name.Contains(t)) ||
                    (dd.DrugMaster.DrugCompany != null && dd.DrugMaster.DrugCompany.Name.Contains(t)) ||
                    (dd.DrugType != null && dd.DrugType.Name.Contains(t))
                );
            }
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(dd => dd.DrugMaster!.Name)
            .ThenBy(dd => dd.Id)
            .Skip(skip)
            .Take(take)
            .Select(dd => new DrugMasterViewModel
            {
                Id = dd.DrugMaster!.Id,
                EncryptedId = dd.DrugMaster!.Id.ToString(),
                DrugDetailId = dd.Id,
                Name = dd.DrugMaster!.Name,
                Code = dd.DrugMaster!.Code,
                Description = !string.IsNullOrWhiteSpace(dd.Description) ? dd.Description : dd.DrugMaster!.Description,
                DrugCompanyName = dd.DrugMaster!.DrugCompany != null ? dd.DrugMaster!.DrugCompany.Name : null,
                DrugGenericName = dd.DrugMaster!.Generic != null ? dd.DrugMaster!.Generic.Name : null,
                DrugTypeName = dd.DrugType != null ? dd.DrugType.Name : null,
                DrugStrengthName = dd.DrugStrength != null 
                    ? (dd.DrugStrength.Unit != null && dd.DrugStrength.Unit.Name != null && dd.DrugStrength.Unit.Name != "" && !dd.DrugStrength.Quantity.Contains(dd.DrugStrength.Unit.Name)
                        ? (dd.DrugStrength.Quantity + " " + dd.DrugStrength.Unit.Name) 
                        : dd.DrugStrength.Quantity)
                    : null,
                UnitPrice = dd.UnitPrice,
                IsActive = dd.IsActive && dd.DrugMaster!.IsActive
            })
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<DrugMonographViewModel?> GetMonographAsync(string? brandName, string? genericName, string? url)
    {
        var b = brandName?.Trim().ToLower();
        var g = genericName?.Trim().ToLower();
        var u = url?.Trim().ToLower();

        // 1. Check DrugMasters entity to load exact drug details
        var drugEntity = await _context.DrugMasters
            .AsNoTracking()
            .Include(d => d.Generic)
            .Include(d => d.DrugCompany)
            .Include(d => d.DrugDetails)
                .ThenInclude(dd => dd.DrugType)
            .Include(d => d.DrugDetails)
                .ThenInclude(dd => dd.DrugStrength)
                    .ThenInclude(ds => ds.Unit)
            .FirstOrDefaultAsync(d => !string.IsNullOrEmpty(b) && d.Name.ToLower() == b);

        if (drugEntity != null)
        {
            if (string.IsNullOrEmpty(g) && drugEntity.Generic != null)
            {
                g = drugEntity.Generic.Name.Trim().ToLower();
            }
        }

        // 2. Prioritize DrugMonograph by exact BrandName, then url, then genericName
        DrugMonograph? monograph = null;
        if (!string.IsNullOrEmpty(b))
        {
            monograph = await _context.DrugMonographs
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.BrandName.ToLower() == b);
        }

        if (monograph == null && !string.IsNullOrEmpty(u))
        {
            monograph = await _context.DrugMonographs
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MedExUrl != null && m.MedExUrl.ToLower() == u);
        }

        if (monograph == null && !string.IsNullOrEmpty(g))
        {
            monograph = await _context.DrugMonographs
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.GenericName != null && m.GenericName.ToLower() == g);
        }

        if (monograph != null)
        {
            var vm = MapToMonographVm(monograph);
            EnrichMonographVm(vm, drugEntity, brandName);
            return vm;
        }

        // 3. If url is missing, check if DrugMasters has MedEx URL
        string? targetUrl = url;
        if (string.IsNullOrWhiteSpace(targetUrl) && drugEntity != null && !string.IsNullOrWhiteSpace(drugEntity.Description) && drugEntity.Description.StartsWith("http"))
        {
            targetUrl = drugEntity.Description;
        }

        // 4. If targetUrl available, fetch live from MedEx and cache into DrugMonograph
        if (!string.IsNullOrWhiteSpace(targetUrl) && targetUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(8) };
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
                var html = await client.GetStringAsync(targetUrl);

                if (!string.IsNullOrWhiteSpace(html))
                {
                    var newMonograph = ParseMedExHtml(html, brandName ?? drugEntity?.Name ?? "Unknown", genericName ?? drugEntity?.Generic?.Name, targetUrl);
                    _context.DrugMonographs.Add(newMonograph);
                    await _context.SaveChangesAsync();
                    var vm = MapToMonographVm(newMonograph);
                    EnrichMonographVm(vm, drugEntity, brandName);
                    return vm;
                }
            }
            catch
            {
                // Network or parse exception, fallback gracefully
            }
        }

        // 5. Fallback: Query Generic details from database if exists
        var genericEntity = await _context.Generics
            .AsNoTracking()
            .FirstOrDefaultAsync(gen => !string.IsNullOrEmpty(g) && gen.Name.ToLower() == g);

        if (genericEntity != null || drugEntity != null)
        {
            var vm = new DrugMonographViewModel
            {
                BrandName = brandName ?? drugEntity?.Name ?? genericEntity?.Name ?? "Medicine",
                GenericName = drugEntity?.Generic?.Name ?? genericEntity?.Name,
                Indications = genericEntity?.Indication,
                SideEffects = genericEntity?.SideEffects,
                MedExUrl = targetUrl
            };
            EnrichMonographVm(vm, drugEntity, brandName);
            return vm;
        }

        return null;
    }

    private static void EnrichMonographVm(DrugMonographViewModel vm, DrugMaster? drugEntity, string? brandName)
    {
        if (!string.IsNullOrEmpty(brandName)) vm.BrandName = brandName;
        if (drugEntity == null) return;

        if (string.IsNullOrEmpty(vm.GenericName) && drugEntity.Generic != null)
            vm.GenericName = drugEntity.Generic.Name;

        if (string.IsNullOrEmpty(vm.Manufacturer) && drugEntity.DrugCompany != null)
            vm.Manufacturer = drugEntity.DrugCompany.Name;

        var firstDetail = drugEntity.DrugDetails.FirstOrDefault();
        if (firstDetail != null)
        {
            if (string.IsNullOrEmpty(vm.DosageForm) && firstDetail.DrugType != null)
                vm.DosageForm = firstDetail.DrugType.Name;

            if (string.IsNullOrEmpty(vm.Strength) && firstDetail.DrugStrength != null)
            {
                var q = firstDetail.DrugStrength.Quantity ?? "";
                var u = firstDetail.DrugStrength.Unit?.Name ?? "";
                vm.Strength = (!string.IsNullOrWhiteSpace(u) && !q.Contains(u)) ? $"{q} {u}".Trim() : q;
            }

            if ((vm.UnitPrice == null || vm.UnitPrice == 0) && firstDetail.UnitPrice > 0)
                vm.UnitPrice = firstDetail.UnitPrice;

            if ((vm.StripPrice == null || vm.StripPrice == 0) && vm.UnitPrice > 0)
                vm.StripPrice = vm.UnitPrice * 12;
        }
    }

    private static DrugMonographViewModel MapToMonographVm(DrugMonograph m) => new()
    {
        Id = m.Id,
        BrandName = m.BrandName,
        GenericName = m.GenericName,
        DosageForm = m.DosageForm,
        Strength = m.Strength,
        Manufacturer = m.Manufacturer,
        UnitPrice = m.UnitPrice,
        StripPrice = m.StripPrice,
        PackImageUrl = m.PackImageUrl,
        MedExUrl = m.MedExUrl,
        Indications = m.Indications,
        Pharmacology = m.Pharmacology,
        DosageAdministration = m.DosageAdministration,
        Interaction = m.Interaction,
        Contraindications = m.Contraindications,
        SideEffects = m.SideEffects,
        PregnancyLactation = m.PregnancyLactation,
        PrecautionsWarnings = m.PrecautionsWarnings,
        TherapeuticClass = m.TherapeuticClass,
        StorageConditions = m.StorageConditions
    };

    private static DrugMonograph ParseMedExHtml(string html, string brandName, string? genericName, string url)
    {
        string? ExtractSection(string divId)
        {
            var match = System.Text.RegularExpressions.Regex.Match(
                html, 
                $@"<div id=""{divId}"">[\s\S]*?<div class=""ac-body"">([\s\S]*?)<\/div>", 
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );
            if (!match.Success) return null;
            var val = match.Groups[1].Value.Trim();
            return System.Text.RegularExpressions.Regex.Replace(val, @"<div class=""tx-0-9[\s\S]*$", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase).Trim();
        }

        string? packImg = null;
        var imgMatch = System.Text.RegularExpressions.Regex.Match(html, @"data-src=""(https:\/\/medex\.com\.bd\/storage\/images\/packaging\/[^""]+)""", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        if (imgMatch.Success) packImg = imgMatch.Groups[1].Value;

        decimal? unitPrice = null;
        var upMatch = System.Text.RegularExpressions.Regex.Match(html, @"Unit Price:\s*৳\s*([0-9.]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        if (upMatch.Success && decimal.TryParse(upMatch.Groups[1].Value, out var up)) unitPrice = up;

        decimal? stripPrice = null;
        var spMatch = System.Text.RegularExpressions.Regex.Match(html, @"Strip Price:\s*৳\s*([0-9.]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        if (spMatch.Success && decimal.TryParse(spMatch.Groups[1].Value, out var sp)) stripPrice = sp;

        string? dosageForm = null;
        var dfMatch = System.Text.RegularExpressions.Regex.Match(html, @"<small class=""h1-subtitle"">([^<]+)<\/small>", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        if (dfMatch.Success) dosageForm = dfMatch.Groups[1].Value.Trim();

        string? strength = null;
        var strMatch = System.Text.RegularExpressions.Regex.Match(html, @"title=""Strength"">([^<]+)<\/div>", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        if (strMatch.Success) strength = strMatch.Groups[1].Value.Trim();

        string? manufacturer = null;
        var mfgMatch = System.Text.RegularExpressions.Regex.Match(html, @"title=""Pharmaceutical"">[\s\S]*?<a[^>]*>([^<]+)<\/a>", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        if (mfgMatch.Success) manufacturer = mfgMatch.Groups[1].Value.Trim();

        return new DrugMonograph
        {
            BrandName = brandName,
            GenericName = genericName,
            DosageForm = dosageForm,
            Strength = strength,
            Manufacturer = manufacturer,
            UnitPrice = unitPrice,
            StripPrice = stripPrice,
            MedExUrl = url,
            PackImageUrl = packImg,
            Indications = ExtractSection("indications"),
            Pharmacology = ExtractSection("mode_of_action"),
            DosageAdministration = ExtractSection("dosage"),
            Interaction = ExtractSection("interaction"),
            Contraindications = ExtractSection("contraindications"),
            SideEffects = ExtractSection("side_effects"),
            PregnancyLactation = ExtractSection("pregnancy_cat"),
            PrecautionsWarnings = ExtractSection("precautions"),
            TherapeuticClass = ExtractSection("drug_classes"),
            StorageConditions = ExtractSection("storage_conditions"),
            CreatedDate = DateTime.UtcNow,
            UpdatedDate = DateTime.UtcNow
        };
    }
}