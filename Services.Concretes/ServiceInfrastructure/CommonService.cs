using QRCoder;
using Services.Contracts.ServiceInterfaces;

namespace Services.Concretes.ServiceInfrastructure;

public sealed class CommonService : ICommonService
{
    public async Task<byte[]?> GenerateQrCode(string text)
    {
        using var qrGenerator = new QRCodeGenerator();
        var qrCodeData = qrGenerator.CreateQrCode(text, QRCodeGenerator.ECCLevel.Q);

        var qrCode = new PngByteQRCode(qrCodeData);
        return await Task.FromResult(qrCode.GetGraphic(20));
    }
}