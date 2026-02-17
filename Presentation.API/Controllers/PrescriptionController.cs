using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts.Base;
using Shared.DTOs.MainDTOs.Prescription;

namespace Presentation.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PrescriptionController(IServiceManager service) : ControllerBase
{
    [HttpGet("{encryptedId}")]
    public async Task<IActionResult> Get(string encryptedId)
    {
        var result = await service.Prescription.GetByIdAsync(encryptedId);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetPrescriptionsByDoctor()
    {
        return Ok(await service.Prescription.GetPrescriptionsByDoctorAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PrescriptionDto dto)
    {
        if (dto is null) return BadRequest(new { message = "Invalid prescription data" });
        
        // Debug logging
        Console.WriteLine("=== PRESCRIPTION DTO RECEIVED ===");
        Console.WriteLine($"ChiefComplaint: {dto.ChiefComplaint}");
        Console.WriteLine($"OnExamination: {dto.OnExamination}");
        Console.WriteLine($"Investigation: {dto.Investigation}");
        Console.WriteLine($"Advice: {dto.Advice}");
        Console.WriteLine($"DrugHistory: {dto.DrugHistory}");
        Console.WriteLine($"Diagnosis: {dto.Diagnosis}");
        Console.WriteLine($"Medicines Count: {dto.Medicines?.Count ?? 0}");
        Console.WriteLine("=================================");
        
        // For creation, ignore the Id field
        dto.Id = 0;
        
        var result = await service.Prescription.CreateAsync(dto);
        if (result) return Ok(new { message = "Prescription created successfully" });
        return BadRequest(new { message = "Failed to create prescription" });
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] PrescriptionDto dto)
    {
        if (dto is null) return BadRequest(new { message = "Invalid prescription data" });
        if (string.IsNullOrEmpty(dto.EncryptedId)) 
            return BadRequest(new { message = "Prescription ID is required for update" });
        
        var result = await service.Prescription.UpdateAsync(dto);
        if (result) return Ok(new { message = "Prescription updated successfully" });
        return BadRequest(new { message = "Failed to update prescription" });
    }

    [HttpDelete("{encryptedId}")]
    public async Task<IActionResult> Delete(string encryptedId)
    {
        var result = await service.Prescription.DeleteAsync(encryptedId);
        if (result) return Ok(new { message = "Prescription deleted successfully" });
        return BadRequest(new { message = "Failed to delete prescription" });
    }
}
