using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace petgo_api.Migrations
{
    /// <inheritdoc />
    public partial class AddPasseadorIdToTipoPasseio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PasseadorId",
                table: "TiposPasseios",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TiposPasseios_PasseadorId",
                table: "TiposPasseios",
                column: "PasseadorId");

            migrationBuilder.AddForeignKey(
                name: "FK_TiposPasseios_Usuarios_PasseadorId",
                table: "TiposPasseios",
                column: "PasseadorId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TiposPasseios_Usuarios_PasseadorId",
                table: "TiposPasseios");

            migrationBuilder.DropIndex(
                name: "IX_TiposPasseios_PasseadorId",
                table: "TiposPasseios");

            migrationBuilder.DropColumn(
                name: "PasseadorId",
                table: "TiposPasseios");
        }
    }
}
