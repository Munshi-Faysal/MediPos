using AutoMapper;
using Domain.Data;
using Domain.ValidationErrors;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Domain.ValidationAttributes;

[AttributeUsage(AttributeTargets.Property)]
public class UniqueAttribute<T> : ValidationAttribute
    where T : class
{
    protected override ValidationResult IsValid(object? value, ValidationContext validationContext)
    {
        var entityType = validationContext.ObjectInstance.GetType();
        var encryptedId = entityType.GetProperty("EncryptedId")?.GetValue(validationContext.ObjectInstance) as string;

        if (string.IsNullOrEmpty(encryptedId))
        {
            var primaryKeyProperty = entityType.GetProperties()
                .FirstOrDefault(p => p.GetCustomAttributes(typeof(KeyAttribute), true).Length > 0);
            var primaryKeyValue = primaryKeyProperty?.GetValue(validationContext.ObjectInstance);

            if (primaryKeyValue is not null && primaryKeyValue.Equals(0))
            {
                var context = (WfDbContext)validationContext.GetService(typeof(WfDbContext))!;
                var method = typeof(DbContext).GetMethod(nameof(DbContext.Set), Type.EmptyTypes);
                if (method is not null)
                {
                    var mapper = (IMapper)validationContext.GetService(typeof(IMapper))!;
                    _ = mapper.Map<T>(validationContext.ObjectInstance);

                    bool anyDuplicate = context.Set<T>()
                        .AsNoTracking()
                        .Any(e => EF.Property<object>(e, validationContext.MemberName!).Equals(value));

                    if (anyDuplicate)
                    {
                        return new ValidationResult(ErrorModel.DuplicateSubmission(validationContext.MemberName, value?.ToString()));
                    }
                }
            }
        }
        return ValidationResult.Success!;
    }
}