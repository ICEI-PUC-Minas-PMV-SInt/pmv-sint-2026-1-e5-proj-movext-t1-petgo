using Microsoft.EntityFrameworkCore;
using petgo_api.Models;

namespace petgo_api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Pet> Pets { get; set; }
        public DbSet<Produto> Produtos { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<ItemPedido> ItensPedido { get; set; }

        public DbSet<TipoPasseio> TiposPasseio { get; set; }
        public DbSet<Passeio> Passeios { get; set; }
        public DbSet<Adocao> Adocoes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                var properties = entityType.GetProperties()
                    .Where(p => p.ClrType == typeof(decimal));

                foreach (var property in properties)
                {
                    property.SetPrecision(18);
                    property.SetScale(2);
                }
            }
            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<TipoPasseio>()
                .Property(p => p.PrecoBase)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Passeio>()
                .HasOne(p => p.Tutor)
                .WithMany()
                .HasForeignKey(p => p.TutorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Passeio>()
                .HasOne(p => p.Passeador)
                .WithMany()
                .HasForeignKey(p => p.PasseadorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Adocao>()
                .HasOne(a => a.Adotante)
                .WithMany()
                .HasForeignKey(a => a.AdotanteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Usuario>()
                .Property(u => u.Telefone)
                .HasMaxLength(20)
                .IsRequired(true);
        }


    }
}