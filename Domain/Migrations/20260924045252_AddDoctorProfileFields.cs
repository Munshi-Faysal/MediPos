using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddDoctorProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Some deployed databases received these columns before an EF migration
            // was recorded. Guard every addition so both clean and existing databases
            // can move to the same model safely.
            migrationBuilder.Sql(
                """
                IF COL_LENGTH('dbo.Doctor', 'Bio') IS NULL
                    ALTER TABLE [Doctor] ADD [Bio] nvarchar(2000) NULL;

                IF COL_LENGTH('dbo.Doctor', 'ChamberAddress') IS NULL
                    ALTER TABLE [Doctor] ADD [ChamberAddress] nvarchar(500) NULL;

                IF COL_LENGTH('dbo.Doctor', 'ChamberContact') IS NULL
                    ALTER TABLE [Doctor] ADD [ChamberContact] nvarchar(50) NULL;

                IF COL_LENGTH('dbo.Doctor', 'ClinicName') IS NULL
                    ALTER TABLE [Doctor] ADD [ClinicName] nvarchar(200) NULL;

                IF COL_LENGTH('dbo.Doctor', 'EndTime') IS NULL
                    ALTER TABLE [Doctor] ADD [EndTime] nvarchar(20) NULL;

                IF COL_LENGTH('dbo.Doctor', 'OffDay') IS NULL
                    ALTER TABLE [Doctor] ADD [OffDay] nvarchar(20) NULL;

                IF COL_LENGTH('dbo.Doctor', 'Specialization') IS NULL
                    ALTER TABLE [Doctor] ADD [Specialization] nvarchar(200) NULL;

                IF COL_LENGTH('dbo.Doctor', 'StartTime') IS NULL
                    ALTER TABLE [Doctor] ADD [StartTime] nvarchar(20) NULL;

                IF COL_LENGTH('dbo.Doctor', 'Title') IS NULL
                    ALTER TABLE [Doctor] ADD [Title] nvarchar(200) NULL;
                ELSE
                    ALTER TABLE [Doctor] ALTER COLUMN [Title] nvarchar(200) NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF COL_LENGTH('dbo.Doctor', 'Bio') IS NOT NULL
                    ALTER TABLE [Doctor] DROP COLUMN [Bio];

                IF COL_LENGTH('dbo.Doctor', 'ChamberAddress') IS NOT NULL
                    ALTER TABLE [Doctor] DROP COLUMN [ChamberAddress];

                IF COL_LENGTH('dbo.Doctor', 'ChamberContact') IS NOT NULL
                    ALTER TABLE [Doctor] DROP COLUMN [ChamberContact];

                IF COL_LENGTH('dbo.Doctor', 'ClinicName') IS NOT NULL
                    ALTER TABLE [Doctor] DROP COLUMN [ClinicName];

                IF COL_LENGTH('dbo.Doctor', 'EndTime') IS NOT NULL
                    ALTER TABLE [Doctor] DROP COLUMN [EndTime];

                IF COL_LENGTH('dbo.Doctor', 'OffDay') IS NOT NULL
                    ALTER TABLE [Doctor] DROP COLUMN [OffDay];

                IF COL_LENGTH('dbo.Doctor', 'Specialization') IS NOT NULL
                    ALTER TABLE [Doctor] DROP COLUMN [Specialization];

                IF COL_LENGTH('dbo.Doctor', 'StartTime') IS NOT NULL
                    ALTER TABLE [Doctor] DROP COLUMN [StartTime];

                IF COL_LENGTH('dbo.Doctor', 'Title') IS NOT NULL
                    ALTER TABLE [Doctor] DROP COLUMN [Title];
                """);
        }
    }
}
