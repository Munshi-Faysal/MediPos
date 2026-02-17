using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace Application.ConfigureServices.Transformers;

internal sealed class BearerSecuritySchemeTransformer : IOpenApiDocumentTransformer
{
    public Task TransformAsync(OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        document.Info = new OpenApiInfo
        {
            Title = "MediPos API",
            Version = "v1",
            Description = "API documentation for MediPos with JWT Bearer Authentication"
        };

        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
        document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "Enter your JWT token below. Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            In = ParameterLocation.Header,
            Name = "Authorization"
        };

        var securitySchemeRef = new OpenApiSecuritySchemeReference("Bearer");
        var securityRequirement = new OpenApiSecurityRequirement
        {
            { securitySchemeRef, new List<string>() }
        };

        foreach (var pathItem in document.Paths.Values)
        {
            if (pathItem.Operations is null)
            {
                continue;
            }

            foreach (var operation in pathItem.Operations.Values)
            {
                operation.Security ??= [];
                operation.Security.Add(securityRequirement);
            }
        }

        return Task.CompletedTask;
    }
}