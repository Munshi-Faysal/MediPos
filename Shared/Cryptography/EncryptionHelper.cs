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
        return string.IsNullOrWhiteSpace(encryptedId) ? 0 : Convert.ToInt32(_protector.Unprotect(encryptedId));
    }
}