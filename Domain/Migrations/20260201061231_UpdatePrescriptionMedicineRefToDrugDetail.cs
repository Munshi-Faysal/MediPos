using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Domain.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePrescriptionMedicineRefToDrugDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PrescriptionMedicine_DrugMasters_MedicineId",
                table: "PrescriptionMedicine");

            migrationBuilder.RenameColumn(
                name: "MedicineId",
                table: "PrescriptionMedicine",
                newName: "DrugDetailId");

            migrationBuilder.RenameIndex(
                name: "IX_PrescriptionMedicine_MedicineId",
                table: "PrescriptionMedicine",
                newName: "IX_PrescriptionMedicine_DrugDetailId");

            migrationBuilder.AddForeignKey(
                name: "FK_PrescriptionMedicine_DrugDetails_DrugDetailId",
                table: "PrescriptionMedicine",
                column: "DrugDetailId",
                principalTable: "DrugDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PrescriptionMedicine_DrugDetails_DrugDetailId",
                table: "PrescriptionMedicine");

            migrationBuilder.RenameColumn(
                name: "DrugDetailId",
                table: "PrescriptionMedicine",
                newName: "MedicineId");

            migrationBuilder.RenameIndex(
                name: "IX_PrescriptionMedicine_DrugDetailId",
                table: "PrescriptionMedicine",
                newName: "IX_PrescriptionMedicine_MedicineId");

            migrationBuilder.AddForeignKey(
                name: "FK_PrescriptionMedicine_DrugMasters_MedicineId",
                table: "PrescriptionMedicine",
                column: "MedicineId",
                principalTable: "DrugMasters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
