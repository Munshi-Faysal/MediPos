using Domain.ValidationErrors;
using System.ComponentModel.DataAnnotations;

namespace Domain.ValidationAttributes;

public class NonNegativeAttribute : ValidationAttribute
{
    protected override ValidationResult IsValid(object? value, ValidationContext validationContext)
    {
        return value is null or double and > 0 or > 0 ? ValidationResult.Success! : new ValidationResult(ErrorModel.NegativeValueSubmission(validationContext.DisplayName));
    }
}