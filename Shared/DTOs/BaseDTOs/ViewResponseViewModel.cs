namespace Shared.DTOs.BaseDTOs;

public class ViewResponseViewModel<TViewModel> : ResponseViewModel where TViewModel : class
{
    public required PaginatedListViewModel<TViewModel> Data { get; set; }
}