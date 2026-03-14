using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace petgo.api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateContatoWhatsappToEmptyString : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Atualizar registros com ContatoWhatsapp NULL para string vazia
            migrationBuilder.Sql(
                @"UPDATE ""AnuncioDoacoes"" 
                  SET ""ContatoWhatsapp"" = '' 
                  WHERE ""ContatoWhatsapp"" IS NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Não é necessário reverter, pois estamos apenas limpando dados
        }
    }
}
