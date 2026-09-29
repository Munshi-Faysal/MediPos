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
            var s = search.Trim();
            query = query.Where(dd => 
                dd.DrugMaster!.Name.Contains(s) ||
                dd.DrugMaster.Code.Contains(s) ||
                (dd.DrugMaster.Generic != null && dd.DrugMaster.Generic.Name.Contains(s)) ||
                (dd.DrugMaster.DrugCompany != null && dd.DrugMaster.DrugCompany.Name.Contains(s))
            );
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
                Description = dd.Description,
                DrugCompanyName = dd.DrugMaster!.DrugCompany != null ? dd.DrugMaster!.DrugCompany.Name : null,
                DrugGenericName = dd.DrugMaster!.Generic != null ? dd.DrugMaster!.Generic.Name : null,
                DrugTypeName = dd.DrugType != null ? dd.DrugType.Name : null,
                DrugStrengthName = dd.DrugStrength != null 
                    ? (dd.DrugStrength.Quantity + (dd.DrugStrength.Unit != null ? " " + dd.DrugStrength.Unit.Name : "")) 
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

        // 1. Check DrugMonograph table
        var monograph = await _context.DrugMonographs
            .AsNoTracking()
            .FirstOrDefaultAsync(m => 
                (!string.IsNullOrEmpty(b) && m.BrandName.ToLower() == b) ||
                (!string.IsNullOrEmpty(u) && m.MedExUrl != null && m.MedExUrl.ToLower() == u) ||
                (!string.IsNullOrEmpty(g) && m.GenericName != null && m.GenericName.ToLower() == g)
            );

        if (monograph != null)
        {
            return MapToMonographVm(monograph);
        }

        // 2. If url is missing, check if DrugMasters has MedEx URL
        string? targetUrl = url;
        if (string.IsNullOrWhiteSpace(targetUrl) && !string.IsNullOrWhiteSpace(brandName))
        {
            targetUrl = await _context.DrugMasters
                .Where(dm => dm.Name.ToLower() == b && dm.Description != null && dm.Description.StartsWith("http"))
                .Select(dm => dm.Description)
                .FirstOrDefaultAsync();
        }

        // 3. If targetUrl available, fetch live from MedEx and cache into DrugMonograph
        if (!string.IsNullOrWhiteSpace(targetUrl) && targetUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(8) };
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
                var html = await client.GetStringAsync(targetUrl);

                if (!string.IsNullOrWhiteSpace(html))
                {
                    var newMonograph = ParseMedExHtml(html, brandName ?? "Unknown", genericName, targetUrl);
                    _context.DrugMonographs.Add(newMonograph);
                    await _context.SaveChangesAsync();
                    return MapToMonographVm(newMonograph);
                }
            }
            catch
            {
                // Network or parse exception, fallback gracefully
            }
        }

        // 4. Fallback: Query Generic details from database if exists
        var genericEntity = await _context.Generics
            .AsNoTracking()
            .FirstOrDefaultAsync(gen => !string.IsNullOrEmpty(g) && gen.Name.ToLower() == g);

        if (genericEntity != null)
        {
            return new DrugMonographViewModel
            {
                BrandName = brandName ?? genericEntity.Name,
                GenericName = genericEntity.Name,
                Indications = genericEntity.Indication,
                SideEffects = genericEntity.SideEffects,
                MedExUrl = targetUrl
            };
        }

        return null;
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

        return new DrugMonograph
        {
            BrandName = brandName,
            GenericName = genericName,
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