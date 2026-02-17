namespace Shared.Common;

public class GlobalMethods
{
    public static string MaskEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            throw new ArgumentException("Invalid email format", nameof(email));

        return $"{email[..2]}{new string('*', email.IndexOf('@') - 2)}{email[email.IndexOf('@')..]}";
    }
}