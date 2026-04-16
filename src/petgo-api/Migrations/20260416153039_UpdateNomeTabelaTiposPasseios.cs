using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace petgo_api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateNomeTabelaTiposPasseios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Passeios_TiposPasseio_TipoPasseioId",
                table: "Passeios");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TiposPasseio",
                table: "TiposPasseio");

            migrationBuilder.RenameTable(
                name: "TiposPasseio",
                newName: "TiposPasseios");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TiposPasseios",
                table: "TiposPasseios",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Passeios_TiposPasseios_TipoPasseioId",
                table: "Passeios",
                column: "TipoPasseioId",
                principalTable: "TiposPasseios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Passeios_TiposPasseios_TipoPasseioId",
                table: "Passeios");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TiposPasseios",
                table: "TiposPasseios");

            migrationBuilder.RenameTable(
                name: "TiposPasseios",
                newName: "TiposPasseio");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TiposPasseio",
                table: "TiposPasseio",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Passeios_TiposPasseio_TipoPasseioId",
                table: "Passeios",
                column: "TipoPasseioId",
                principalTable: "TiposPasseio",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
