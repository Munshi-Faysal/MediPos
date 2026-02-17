namespace Domain.ValidationErrors;

public static class ErrorModel
{
    public static string DuplicateSubmission(string? fieldName, string? fieldValue)
    {
        return $"{fieldName}: {fieldValue} already exists. Please try again with different {fieldName}.";
    }

    public static string NegativeValueSubmission(string fieldName)
    {
        return $"{fieldName} must be greater than 0.";
    }
}