using Microsoft.AspNetCore.DataProtection;

namespace Shared.Cryptography;

public class EncryptionHelper(IDataProtectionProvider dataProtectionProvider,
    DataProtectionPurposeStrings dataProtectionPurposeStrings)
{
    private readonly IDataProtector _protector = dataProtectionProvider.CreateProtector(dataProtectionPurposeStrings.IdRouteValue);

    public string Encrypt(string id)
    {
        return _protector.Protect(id);
    }

    public int Decrypt(string encryptedId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(encryptedId)) return 0;
            var decryptedValue = _protector.Unprotect(encryptedId);
            return int.TryParse(decryptedValue, out var result) ? result : 0;
        }
        catch
        {
            return 0;
        }
    }
}