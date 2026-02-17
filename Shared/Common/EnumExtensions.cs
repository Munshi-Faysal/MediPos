using System.Reflection;
using System.Runtime.Serialization;

namespace Shared.Common;

public static class EnumExtensions
{
    public static string GetEnumMemberValue<T>(this T enumValue) where T : Enum
    {
        var type = typeof(T);
        var info = type.GetMember(enumValue.ToString());
        var attribute = info[0].GetCustomAttribute<EnumMemberAttribute>(false);
        return attribute?.Value ?? enumValue.ToString();
    }
}