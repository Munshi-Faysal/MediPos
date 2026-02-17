using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Shared.Common;
using System.Diagnostics;
using System.Net;
using System.Text;

namespace Application.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception e)
        {
            await HandleExceptionAsync(context, e);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception e)
    {
        if (!context.Response.HasStarted)
        {
            // Prefer a DB-related exception (DbUpdateException / SqlException) if present in the chain.
            var preferred = FindDbException(e);

            // Try to pick a source frame from the preferred exception (fall back to top-level exception).
            var frame = new StackTrace(preferred, true).GetFrames()?.FirstOrDefault(f => f.GetFileLineNumber() > 0)
                        ?? new StackTrace(e, true).GetFrames()?.FirstOrDefault(f => f.GetFileLineNumber() > 0);

            string traceInfo;
            if (frame is not null)
            {
                var offset = frame.GetILOffset();
                var file = frame.GetFileName() ?? "N/A";
                var line = frame.GetFileLineNumber();
                var column = frame.GetFileColumnNumber();
                traceInfo = $"MoveNext at offset {offset} in file:line:column {file}:{line}:{column}";
            }
            else
            {
                // concise fallback: first non-empty stack trace line
                traceInfo = (preferred.StackTrace ?? e.StackTrace ?? "No Stack")
                    .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                    .FirstOrDefault() ?? "No Stack";
            }

            var innerMessage = preferred.InnerException?.Message ?? "No Inner Exception";

            // Single-line concise message (do not pass Exception object to logger to avoid full stack/parameter dumps)
            var sb = new StringBuilder();
            sb.Append($"Exception: {preferred.Message}");
            sb.Append(" ");
            sb.Append($"Inner Exception: {innerMessage}");
            sb.Append(" ");
            sb.Append($"Trace: {traceInfo}");

            logger.LogError(sb.ToString());

            context.Response.ContentType = "application/json";

            // Map known exception types to HTTP status codes using the original exception 'e'
            context.Response.StatusCode = e switch
            {
                ArgumentException => StatusCodes.Status400BadRequest,
                FormatException => StatusCodes.Status400BadRequest,
                UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
                KeyNotFoundException => StatusCodes.Status404NotFound,
                NotImplementedException => StatusCodes.Status501NotImplemented,
                DbUpdateException dbEx when dbEx.InnerException is SqlException sqlEx && sqlEx.Number == 547
                    => StatusCodes.Status409Conflict,
                DbUpdateException => StatusCodes.Status500InternalServerError,
                HttpRequestException httpEx => GetStatusCodeForHttpException(httpEx),
                _ => StatusCodes.Status500InternalServerError
            };

            var response = new ExceptionResponseModel
            {
                StatusCode = e.GetType().Name,
                ExceptionMessage = e.Message
            };
            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
        }
    }

    // Walk inner exceptions and return the first DbUpdateException or SqlException found; otherwise return the base exception.
    private static Exception FindDbException(Exception e)
    {
        Exception? curr = e;
        while (curr != null)
        {
            if (curr is DbUpdateException || curr is SqlException)
                return curr;
            curr = curr.InnerException;
        }

        return e.GetBaseException() ?? e;
    }

    #region HttpStatusCode
    private static int GetStatusCodeForHttpException(HttpRequestException ex) =>
        ex.StatusCode switch
        {
            HttpStatusCode.BadRequest => StatusCodes.Status400BadRequest,
            HttpStatusCode.Unauthorized => StatusCodes.Status401Unauthorized,
            HttpStatusCode.PaymentRequired => StatusCodes.Status402PaymentRequired,
            HttpStatusCode.Forbidden => StatusCodes.Status403Forbidden,
            HttpStatusCode.NotFound => StatusCodes.Status404NotFound,
            HttpStatusCode.MethodNotAllowed => StatusCodes.Status405MethodNotAllowed,
            HttpStatusCode.NotAcceptable => StatusCodes.Status406NotAcceptable,
            HttpStatusCode.RequestTimeout => StatusCodes.Status408RequestTimeout,
            HttpStatusCode.Conflict => StatusCodes.Status409Conflict,
            HttpStatusCode.RequestEntityTooLarge => StatusCodes.Status413RequestEntityTooLarge,
            HttpStatusCode.RequestUriTooLong => StatusCodes.Status414RequestUriTooLong,
            HttpStatusCode.UnsupportedMediaType => StatusCodes.Status415UnsupportedMediaType,
            _ => StatusCodes.Status500InternalServerError
        };
    #endregion
}