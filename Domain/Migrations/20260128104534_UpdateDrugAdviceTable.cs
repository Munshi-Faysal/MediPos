using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Domain.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDrugAdviceTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DrugAdvice_Doctor_DoctorId",
                table: "DrugAdvice");

            migrationBuilder.AddForeignKey(
                name: "FK_DrugAdvice_Doctor",
                table: "DrugAdvice",
                column: "DoctorId",
                principalTable: "Doctor",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DrugAdvice_Doctor",
                table: "DrugAdvice");

            migrationBuilder.AddForeignKey(
                name: "FK_DrugAdvice_Doctor_DoctorId",
                table: "DrugAdvice",
                column: "DoctorId",
                principalTable: "Doctor",
                principalColumn: "Id");
        }
    }
}
