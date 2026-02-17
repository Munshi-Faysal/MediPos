using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddTreatmentModules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DrugDetails_DrugMasters_DrugMasterId",
                table: "DrugDetails");

            migrationBuilder.CreateTable(
                name: "TreatmentTemplate",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DoctorId = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TreatmentTemplate", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TreatmentTemplate_Doctor",
                        column: x => x.DoctorId,
                        principalTable: "Doctor",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TreatmentDrug",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TreatmentTemplateId = table.Column<int>(type: "int", nullable: false),
                    DrugDetailId = table.Column<int>(type: "int", nullable: false),
                    Dose = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Duration = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DurationType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Instruction = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    InstructionText = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TreatmentDrug", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TreatmentDrug_DrugDetail",
                        column: x => x.DrugDetailId,
                        principalTable: "DrugDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TreatmentDrug_TreatmentTemplate",
                        column: x => x.TreatmentTemplateId,
                        principalTable: "TreatmentTemplate",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TreatmentDrug_DrugDetailId",
                table: "TreatmentDrug",
                column: "DrugDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_TreatmentDrug_TreatmentTemplateId",
                table: "TreatmentDrug",
                column: "TreatmentTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_TreatmentTemplate_DoctorId",
                table: "TreatmentTemplate",
                column: "DoctorId");

            migrationBuilder.AddForeignKey(
                name: "FK_DrugDetails_DrugMasters_DrugMasterId",
                table: "DrugDetails",
                column: "DrugMasterId",
                principalTable: "DrugMasters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DrugDetails_DrugMasters_DrugMasterId",
                table: "DrugDetails");

            migrationBuilder.DropTable(
                name: "TreatmentDrug");

            migrationBuilder.DropTable(
                name: "TreatmentTemplate");

            migrationBuilder.AddForeignKey(
                name: "FK_DrugDetails_DrugMasters_DrugMasterId",
                table: "DrugDetails",
                column: "DrugMasterId",
                principalTable: "DrugMasters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
