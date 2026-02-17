using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Presentation.API.ActionFilters;

public class ValidationFilterAttribute : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        var action = context.RouteData.Values["action"]?.ToString();
        var controller = context.RouteData.Values["controller"]?.ToString();
        //var paramKeyValuePair = context.ActionArguments.FirstOrDefault(x => x.Value?.ToString()?.Contains("Dto") == true);
        var paramKeyValuePair = context.ActionArguments.FirstOrDefault();
        var param = paramKeyValuePair.Value;

        if (param is null)
        {
            context.Result = new BadRequestObjectResult($"Object is null. Controller: {controller}, action: {action}");
            return;
        }

        if (!context.ModelState.IsValid)
            context.Result = new UnprocessableEntityObjectResult(context.ModelState);
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        throw new NotImplementedException();
    }
}