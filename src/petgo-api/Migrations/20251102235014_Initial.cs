using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace petgo.api.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Avaliacoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AlvoTipo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AlvoId = table.Column<int>(type: "integer", nullable: false),
                    Nota = table.Column<int>(type: "integer", nullable: false),
                    Titulo = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Comentario = table.Column<string>(type: "character varying(2500)", maxLength: 2500, nullable: false),
                    AutorNome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Avaliacoes", x => x.Id);
                    table.CheckConstraint("CK_Avaliacao_Nota", "\"Nota\" >= 1 AND \"Nota\" <= 5");
                });

            migrationBuilder.CreateTable(
                name: "CategoriaProduto",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategoriaProduto", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Senha = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Telefone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Tipo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FotoPerfil = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Produtos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Preco = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Estoque = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CategoriaProdutoId = table.Column<int>(type: "integer", nullable: false),
                    ImagensJson = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "[]")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Produtos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Produtos_CategoriaProduto_CategoriaProdutoId",
                        column: x => x.CategoriaProdutoId,
                        principalTable: "CategoriaProduto",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Enderecos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    Rua = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Estado = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Cep = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    Pais = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Enderecos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Enderecos_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Passeadores",
                columns: table => new
                {
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    Descricao = table.Column<string>(type: "character varying(1500)", maxLength: 1500, nullable: false),
                    ValorCobrado = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    AvaliacaoMedia = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    QuantidadeAvaliacoes = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Passeadores", x => x.UsuarioId);
                    table.ForeignKey(
                        name: "FK_Passeadores_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Pets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    Nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Especie = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Raca = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    idadeMeses = table.Column<int>(type: "integer", nullable: false),
                    Porte = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Cidade = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Estado = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Observacoes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    FotosJson = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "[]")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pets_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ServicoPasseadores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PasseadorId = table.Column<int>(type: "integer", nullable: false),
                    Titulo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(1500)", maxLength: 1500, nullable: false),
                    TipoServico = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServicoPasseadores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServicoPasseadores_Passeadores_PasseadorId",
                        column: x => x.PasseadorId,
                        principalTable: "Passeadores",
                        principalColumn: "UsuarioId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AnuncioDoacoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PetId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    ContatoWhatsapp = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Moderacao = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnuncioDoacoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnuncioDoacoes_Pets_PetId",
                        column: x => x.PetId,
                        principalTable: "Pets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnuncioDoacoes_Moderacao",
                table: "AnuncioDoacoes",
                column: "Moderacao");

            migrationBuilder.CreateIndex(
                name: "IX_AnuncioDoacoes_PetId",
                table: "AnuncioDoacoes",
                column: "PetId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AnuncioDoacoes_Status",
                table: "AnuncioDoacoes",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Avaliacao_Alvo",
                table: "Avaliacoes",
                columns: new[] { "AlvoTipo", "AlvoId" });

            migrationBuilder.CreateIndex(
                name: "IX_CategoriaProduto_Nome",
                table: "CategoriaProduto",
                column: "Nome",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Enderecos_UsuarioId",
                table: "Enderecos",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Passeadores_AvaliacaoMedia",
                table: "Passeadores",
                column: "AvaliacaoMedia");

            migrationBuilder.CreateIndex(
                name: "IX_Passeadores_ValorCobrado",
                table: "Passeadores",
                column: "ValorCobrado");

            migrationBuilder.CreateIndex(
                name: "IX_Pets_UsuarioId",
                table: "Pets",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Produtos_CategoriaProdutoId",
                table: "Produtos",
                column: "CategoriaProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_Produtos_Nome",
                table: "Produtos",
                column: "Nome");

            migrationBuilder.CreateIndex(
                name: "IX_Produtos_Status",
                table: "Produtos",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ServicoPasseadores_Ativo",
                table: "ServicoPasseadores",
                column: "Ativo");

            migrationBuilder.CreateIndex(
                name: "IX_ServicoPasseadores_PasseadorId",
                table: "ServicoPasseadores",
                column: "PasseadorId");

            migrationBuilder.CreateIndex(
                name: "IX_ServicoPasseadores_TipoServico",
                table: "ServicoPasseadores",
                column: "TipoServico");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Nome",
                table: "Usuarios",
                column: "Nome");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Tipo",
                table: "Usuarios",
                column: "Tipo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnuncioDoacoes");

            migrationBuilder.DropTable(
                name: "Avaliacoes");

            migrationBuilder.DropTable(
                name: "Enderecos");

            migrationBuilder.DropTable(
                name: "Produtos");

            migrationBuilder.DropTable(
                name: "ServicoPasseadores");

            migrationBuilder.DropTable(
                name: "Pets");

            migrationBuilder.DropTable(
                name: "CategoriaProduto");

            migrationBuilder.DropTable(
                name: "Passeadores");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
