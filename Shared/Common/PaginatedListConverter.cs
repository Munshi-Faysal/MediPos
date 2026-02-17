using AutoMapper;
using Shared.DTOs.BaseDTOs;

namespace Shared.Common;

public class PaginatedListConverter<TSource, TDestination>(int take)
    : ITypeConverter<PaginatedListViewModel<TSource>, PaginatedListViewModel<TDestination>>
    where TSource : class
    where TDestination : class
{
    public PaginatedListViewModel<TDestination> Convert(
        PaginatedListViewModel<TSource> source,
        PaginatedListViewModel<TDestination> destination,
        ResolutionContext context)
    {
        return new PaginatedListViewModel<TDestination>(take)
        {
            ItemList = context.Mapper.Map<List<TDestination>>(source.ItemList)
        };
    }
}

public class ListToPaginatedListConverter<TSource, TDestination>
    : ITypeConverter<List<TSource>, PaginatedListViewModel<TDestination>>
    where TSource : class
    where TDestination : class
{
    public PaginatedListViewModel<TDestination> Convert(
        List<TSource> source,
        PaginatedListViewModel<TDestination> destination,
        ResolutionContext context)
    {
        int take = context.Items.ContainsKey("take") ? (int)context.Items["take"] : 10;

        return new PaginatedListViewModel<TDestination>(take)
        {
            ItemList = context.Mapper.Map<List<TDestination>>(source)
        };
    }
}