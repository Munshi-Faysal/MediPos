namespace Application.ConfigureServices;

public static class EnumerableExtension
{
    public static (List<T> Matches, List<T> NonMatches) Partition<T>(
        this IEnumerable<T> source, Func<T, bool> predicate)
    {
        var matches = new List<T>();
        var nonMatches = new List<T>();

        foreach (var item in source)
        {
            if (predicate(item))
                matches.Add(item);
            else
                nonMatches.Add(item);
        }

        return (matches, nonMatches);
    }
}