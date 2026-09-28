using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddPrescriptionScanToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ScanToken",
                table: "Prescription",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.Sql(
                "UPDATE [Prescription] " +
                "SET [ScanToken] = LOWER(REPLACE(CONVERT(nvarchar(36), NEWID()), '-', '')) " +
                "WHERE [ScanToken] IS NULL OR [ScanToken] = ''");

            migrationBuilder.AlterColumn<string>(
                name: "ScanToken",
                table: "Prescription",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(64)",
                oldMaxLength: 64,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "UX_Prescription_ScanToken",
                table: "Prescription",
                column: "ScanToken",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UX_Prescription_ScanToken",
                table: "Prescription");

            migrationBuilder.DropColumn(
                name: "ScanToken",
                table: "Prescription");
        }
    }
}
