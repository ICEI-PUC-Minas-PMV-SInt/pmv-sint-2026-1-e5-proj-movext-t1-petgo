using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using petgo_api.Models;

namespace petgo_api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Pet> Pets { get; set; }
        public DbSet<Ong> Ongs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Pet>()
                .Property(p => p.Porte)
                .HasConversion<string>();

            modelBuilder.Entity<Pet>()
                .HasOne(p => p.Ong)
                .WithMany(o => o.Pets)
                .HasForeignKey(p => p.OngId)
                .IsRequired();
        }

    }
}