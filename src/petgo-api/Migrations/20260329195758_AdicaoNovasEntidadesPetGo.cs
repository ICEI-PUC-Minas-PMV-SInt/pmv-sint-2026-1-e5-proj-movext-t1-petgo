using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace petgo_api.Migrations
{
    /// <inheritdoc />
    public partial class AdicaoNovasEntidadesPetGo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Adocoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    DataSolicitacao = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    PetId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AdotanteId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Adocoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Adocoes_Pets_PetId",
                        column: x => x.PetId,
                        principalTable: "Pets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Adocoes_Usuarios_AdotanteId",
                        column: x => x.AdotanteId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TiposPasseio",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Nome = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    DuracaoMinutos = table.Column<int>(type: "INTEGER", nullable: false),
                    PrecoBase = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposPasseio", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Passeios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    DataHoraPasseio = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ValorTotal = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    DescricaoPasseio = table.Column<string>(type: "TEXT", nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    TutorId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PasseadorId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PetId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TipoPasseioId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Passeios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Passeios_Pets_PetId",
                        column: x => x.PetId,
                        principalTable: "Pets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Passeios_TiposPasseio_TipoPasseioId",
                        column: x => x.TipoPasseioId,
                        principalTable: "TiposPasseio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Passeios_Usuarios_PasseadorId",
                        column: x => x.PasseadorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Passeios_Usuarios_TutorId",
                        column: x => x.TutorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Adocoes_AdotanteId",
                table: "Adocoes",
                column: "AdotanteId");

            migrationBuilder.CreateIndex(
                name: "IX_Adocoes_PetId",
                table: "Adocoes",
                column: "PetId");

            migrationBuilder.CreateIndex(
                name: "IX_Passeios_PasseadorId",
                table: "Passeios",
                column: "PasseadorId");

            migrationBuilder.CreateIndex(
                name: "IX_Passeios_PetId",
                table: "Passeios",
                column: "PetId");

            migrationBuilder.CreateIndex(
                name: "IX_Passeios_TipoPasseioId",
                table: "Passeios",
                column: "TipoPasseioId");

            migrationBuilder.CreateIndex(
                name: "IX_Passeios_TutorId",
                table: "Passeios",
                column: "TutorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Adocoes");

            migrationBuilder.DropTable(
                name: "Passeios");

            migrationBuilder.DropTable(
                name: "TiposPasseio");
        }
    }
}
