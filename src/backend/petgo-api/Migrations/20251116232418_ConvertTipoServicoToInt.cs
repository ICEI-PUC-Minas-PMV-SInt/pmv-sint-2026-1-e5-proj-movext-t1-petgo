using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace petgo.api.Migrations
{
    /// <inheritdoc />
    public partial class ConvertTipoServicoToInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Primeiro, atualizar os valores de string para seus equivalentes numéricos
            migrationBuilder.Sql(@"
                UPDATE ""ServicoPasseadores""
                SET ""TipoServico"" = 
                    CASE 
                        WHEN ""TipoServico"" = 'PASSEIO' THEN '0'
                        WHEN ""TipoServico"" = 'CUIDADO_DIARIO' THEN '1'
                        WHEN ""TipoServico"" = 'HOSPEDAGEM' THEN '2'
                        WHEN ""TipoServico"" = 'OUTRO' THEN '3'
                        ELSE '3'
                    END
                WHERE ""TipoServico"" IN ('PASSEIO', 'CUIDADO_DIARIO', 'HOSPEDAGEM', 'OUTRO');
            ");

            // Agora alterar o tipo da coluna de varchar para integer usando USING
            migrationBuilder.Sql(@"
                ALTER TABLE ""ServicoPasseadores"" 
                ALTER COLUMN ""TipoServico"" TYPE integer 
                USING ""TipoServico""::integer;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverter para string usando USING
            migrationBuilder.Sql(@"
                ALTER TABLE ""ServicoPasseadores"" 
                ALTER COLUMN ""TipoServico"" TYPE character varying(50) 
                USING ""TipoServico""::text;
            ");

            // Converter valores numéricos de volta para strings
            migrationBuilder.Sql(@"
                UPDATE ""ServicoPasseadores""
                SET ""TipoServico"" = 
                    CASE 
                        WHEN ""TipoServico"" = '0' THEN 'PASSEIO'
                        WHEN ""TipoServico"" = '1' THEN 'CUIDADO_DIARIO'
                        WHEN ""TipoServico"" = '2' THEN 'HOSPEDAGEM'
                        WHEN ""TipoServico"" = '3' THEN 'OUTRO'
                        ELSE 'OUTRO'
                    END
                WHERE ""TipoServico"" IN ('0', '1', '2', '3');
            ");
        }
    }
}
