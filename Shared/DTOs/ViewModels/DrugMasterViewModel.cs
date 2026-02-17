using Shared.DTOs.BaseDTOs;
using System.ComponentModel.DataAnnotations;

namespace Shared.DTOs.ViewModels;

public class DrugMasterViewModel : BaseViewModel
{
    [Display(Name = "Drug Name")]
    public string Name { get; set; } = null!;

    [Display(Name = "Code")]
    public string Code { get; set; } = null!;

    [Display(Name = "Description")]
    public string? Description { get; set; }

    [Display(Name = "Company")]
    public string? DrugCompanyName { get; set; }

    [Display(Name = "Drug Generic")]
    public string? DrugGenericName { get; set; }   

    public List<DrugDetailViewModel> DrugDetailList { get; set; } = [];
}