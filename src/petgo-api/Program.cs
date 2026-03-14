using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using petgo.api.Data;
using petgo.api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.MaxDepth = 64;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS - Configuração para Vercel + localhost
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.WithOrigins(
                    // Development (localhost)
                    "http://localhost:3000",
                    "https://localhost:3000",
                    "http://localhost:5173",

                    // Production (Vercel) - URL EXATA
                    "https://pet-go-puc.vercel.app"
                  )
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var jwtSecretKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JwtSecretKey não configurada.");
var key = Encoding.ASCII.GetBytes(jwtSecretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment(); 
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false, // Ajuste se seu JWT tiver 'iss' configurado
        ValidateAudience = false, // Ajuste se seu JWT tiver 'aud' configurado
        ClockSkew = TimeSpan.Zero // Remove o 'tolerance' de 5 minutos
    };
});

builder.Services.AddAuthorization();

// APENAS PostgreSQL (Supabase) - Connection String
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' não encontrada.");
}

Console.WriteLine("🐘 Usando PostgreSQL (Supabase)");

// Adicionar DbContext com retry e timeout
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null
        );
        npgsqlOptions.CommandTimeout(60);
    });
});

var app = builder.Build();

// Health check endpoint para Railway/Vercel
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
}));

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseSwagger();
    app.UseSwaggerUI();
}

// IMPORTANTE: ordem correta do pipeline
app.UseRouting();
app.UseCors("AllowAll");   // CORS antes de autenticação e redirect
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Aplicar migrations e seed automaticamente
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    try
    {
        Console.WriteLine("📦 Verificando migrations...");
        
        // Aplicar migrations pendentes
        var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
        if (pendingMigrations.Any())
        {
            Console.WriteLine($"📦 Aplicando {pendingMigrations.Count()} migrations...");
            await context.Database.MigrateAsync();
            Console.WriteLine("✅ Migrations aplicadas!");
        }
        else
        {
            Console.WriteLine("✅ Banco de dados atualizado!");
        }
        
        // Seed apenas se banco estiver vazio
        if (!await context.Produtos.AnyAsync())
        {
            Console.WriteLine("🌱 Executando seed inicial...");
            await DatabaseSeeder.SeedAsync(context);
        }
        else
        {
            Console.WriteLine("✅ Banco já contém dados.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Erro ao inicializar banco: {ex.Message}");
        Console.WriteLine($"Stack: {ex.StackTrace}");
        throw;
    }
}

Console.WriteLine($"🚀 PetGo API iniciada!");
Console.WriteLine($"📍 Ambiente: {app.Environment.EnvironmentName}");
Console.WriteLine($"🗄️ Database: PostgreSQL (Supabase)");
Console.WriteLine($"🌐 CORS: localhost + https://pet-go-puc.vercel.app");

app.Run();