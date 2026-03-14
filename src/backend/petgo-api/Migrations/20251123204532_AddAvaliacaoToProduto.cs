using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace petgo.api.Migrations
{
    /// <inheritdoc />
    public partial class AddAvaliacaoToProduto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "AvaliacaoMedia",
                table: "Produtos",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "QuantidadeAvaliacoes",
                table: "Produtos",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvaliacaoMedia",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "QuantidadeAvaliacoes",
                table: "Produtos");
        }
    }
}
