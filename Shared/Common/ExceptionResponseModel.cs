namespace Shared.Common;

public class ExceptionResponseModel
{
    public string StatusCode { get; set; } = null!;
    public string ExceptionMessage { get; set; } = null!;
}