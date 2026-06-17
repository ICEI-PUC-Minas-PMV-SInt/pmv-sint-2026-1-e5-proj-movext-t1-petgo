using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace petgo_api.Migrations
{
    /// <inheritdoc />
    public partial class FixAdoptedPetStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Reset pets stuck in "Adotado" status (2) that already have a completed adoption,
            // meaning ownership was already transferred (Pet.UsuarioId = Adocao.AdotanteId).
            // These should be DisponivelPasseio (0) so the new owner can manage them.
            migrationBuilder.Sql(@"
                UPDATE Pets
                SET Status = 0
                WHERE Status = 2
                AND Id IN (
                    SELECT a.PetId
                    FROM Adocoes a
                    WHERE a.Status = 4
                    AND a.AdotanteId = (SELECT UsuarioId FROM Pets WHERE Id = a.PetId)
                );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Cannot reliably reverse: we don't know which pets were originally Adotado
        }
    }
}
