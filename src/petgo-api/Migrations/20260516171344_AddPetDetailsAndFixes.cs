using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace petgo_api.Migrations
{
    /// <inheritdoc />
    public partial class AddPetDetailsAndFixes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UsuarioId",
                table: "Produtos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Porte",
                table: "Pets",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Saude",
                table: "Pets",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Sexo",
                table: "Pets",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "PasseadorServicos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    PasseadorId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TipoPasseioId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PrecoCustomizado = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PasseadorServicos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PasseadorServicos_TiposPasseios_TipoPasseioId",
                        column: x => x.TipoPasseioId,
                        principalTable: "TiposPasseios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PasseadorServicos_Usuarios_PasseadorId",
                        column: x => x.PasseadorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Produtos_UsuarioId",
                table: "Produtos",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_PasseadorServicos_PasseadorId",
                table: "PasseadorServicos",
                column: "PasseadorId");

            migrationBuilder.CreateIndex(
                name: "IX_PasseadorServicos_TipoPasseioId",
                table: "PasseadorServicos",
                column: "TipoPasseioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Produtos_Usuarios_UsuarioId",
                table: "Produtos",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Produtos_Usuarios_UsuarioId",
                table: "Produtos");

            migrationBuilder.DropTable(
                name: "PasseadorServicos");

            migrationBuilder.DropIndex(
                name: "IX_Produtos_UsuarioId",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "UsuarioId",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "Porte",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "Saude",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "Sexo",
                table: "Pets");
        }
    }
}
