namespace Shared.DTOs.BaseDTOs;

public class PaginatedListViewModel<TViewModel>(int take) where TViewModel : class
{
    public List<TViewModel> ItemList { get; set; } = [];

    // If not explicitly set, frontend will still get a value via fallback getter below
    public int TotalRecords { get; set; }

    public int TotalPages
        => (int)Math.Ceiling((double)(TotalRecords > 0 ? TotalRecords : (ItemList?.Count ?? 0)) / take);
}