using System.ComponentModel.DataAnnotations;

namespace Shared.Common;

public static class GlobalErrors
{
    public static string DuplicateSubmission()
    {
        return "This combination already exists.\nPlease try again with different items.";
    }

    public static string DuplicateSubmission(string item)
    {
        return $"This {item} already exists.\nPlease try again with different {item}.";
    }

    public static string FilterByIdNotFound(string? item, string? filterBy)
    {
        return $"There is no {item} related to this {filterBy}";
    }

    public static string NotFound(string? item)
    {
        return $"{item} not found.";
    }
    public static string InvalidSubmission()
    {
        return "Invalid Submission.";
    }
    public static string InvalidSubmission(string propertyName, Type? dtoType = null)
    {
        string displayName = propertyName;
        var prop = dtoType?.GetProperty(propertyName);
        if (prop?.GetCustomAttributes(typeof(DisplayAttribute), false)
                .FirstOrDefault() is DisplayAttribute displayAttr)
        {
            displayName = displayAttr.Name!;
        }
        return $"Invalid {displayName}.";
    }

    public static string OldPasswordSubmission()
    {
        return "New password must be different from your current password.";
    }
}