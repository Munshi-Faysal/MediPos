namespace Services.Contracts.ServiceInterfaces;

public interface ICommonService
{
    Task<byte[]?> GenerateQrCode(string qrCode);
}