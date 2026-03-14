using Microsoft.EntityFrameworkCore;
using petgo.api.Data;
using petgo.api.Models;
using System.Text.Json;

namespace petgo.api.Services
{
    public static class DatabaseSeeder
    {
        private static readonly Random _random = new Random();

        // Função helper para gerar URLs de imagens aleatórias
        private static string RandomImageUrl(string category, int? lockNumber = null)
        {
            var seed = lockNumber ?? _random.Next(1, 9999);
            return $"https://loremflickr.com/400/400/{category}?lock={seed}";
        }

        private static string RandomDogImage(int? lockNumber = null)
        {
            var seed = lockNumber ?? _random.Next(1, 9999);
            return $"https://place.dog/400/400?random={seed}";
        }

        private static string[] GenerateProductImages(string category, int count = 2)
        {
            var images = new List<string>();
            for (int i = 0; i < count; i++)
            {
                images.Add(RandomImageUrl(category));
            }
            return images.ToArray();
        }

        public static async Task SeedAsync(AppDbContext context)
        {
            Console.WriteLine("🌱 Iniciando seed do banco de dados...");

            // LIMPAR DADOS ANTIGOS (exceto usuários - manter para login)
            Console.WriteLine("🗑️  Limpando dados antigos...");
            
            var carrinhoItens = await context.CarrinhoItens.ToListAsync();
            context.CarrinhoItens.RemoveRange(carrinhoItens);
            
            var anuncios = await context.AnuncioDoacoes.ToListAsync();
            context.AnuncioDoacoes.RemoveRange(anuncios);
            
            var pets = await context.Pets.ToListAsync();
            context.Pets.RemoveRange(pets);
            
            var avaliacoes = await context.Avaliacoes.ToListAsync();
            context.Avaliacoes.RemoveRange(avaliacoes);
            
            var produtos = await context.Produtos.ToListAsync();
            context.Produtos.RemoveRange(produtos);
            
            var categorias = await context.CategoriasProdutos.ToListAsync();
            context.CategoriasProdutos.RemoveRange(categorias);
            
            await context.SaveChangesAsync();
            Console.WriteLine("✅ Dados antigos removidos!");

            // ==========================================
            // SEED CATEGORIAS
            // ==========================================
            Console.WriteLine("📦 Criando categorias...");
            
            var novasCategorias = new[]
            {
                new CategoriaProduto 
                { 
                    Nome = "Ração e Alimentação",
                    Descricao = "Rações, petiscos e suplementos para pets"
                },
                new CategoriaProduto 
                { 
                    Nome = "Brinquedos",
                    Descricao = "Brinquedos interativos e educativos"
                },
                new CategoriaProduto 
                { 
                    Nome = "Acessórios",
                    Descricao = "Camas, cobertores e acessórios diversos"
                },
                new CategoriaProduto 
                { 
                    Nome = "Higiene e Cuidados",
                    Descricao = "Produtos de higiene e cuidados veterinários"
                },
                new CategoriaProduto 
                { 
                    Nome = "Coleiras e Guias",
                    Descricao = "Coleiras, guias e peitorais"
                }
            };

            await context.CategoriasProdutos.AddRangeAsync(novasCategorias);
            await context.SaveChangesAsync();
            Console.WriteLine($"✅ {novasCategorias.Length} categorias criadas!");

            // Buscar os IDs reais das categorias criadas
            var catAlimentacao = novasCategorias[0];
            var catBrinquedos = novasCategorias[1];
            var catAcessorios = novasCategorias[2];
            var catHigiene = novasCategorias[3];
            var catColeiras = novasCategorias[4];

            // ==========================================
            // SEED PRODUTOS COM IMAGENS MOCK
            // ==========================================
            Console.WriteLine("📦 Criando produtos...");

            var novosProdutos = new[]
            {
                new Produto
                {
                    Nome = "Ração Premium Golden para Cães Adultos 15kg",
                    Descricao = "Ração super premium completa e balanceada para cães adultos de todas as raças",
                    Preco = 189.90m,
                    Estoque = 50,
                    Status = StatusProduto.ATIVO,
                    CategoriaProdutoId = catAlimentacao.Id,
                    ImagensJson = JsonSerializer.Serialize(GenerateProductImages("dog,food"))
                },
                new Produto
                {
                    Nome = "Ração Whiskas Sabor Peixe para Gatos 10kg",
                    Descricao = "Alimento completo para gatos adultos com sabor irresistível de peixe",
                    Preco = 129.90m,
                    Estoque = 35,
                    Status = StatusProduto.ATIVO,
                    CategoriaProdutoId = catAlimentacao.Id,
                    ImagensJson = JsonSerializer.Serialize(GenerateProductImages("cat,food"))
                },
                new Produto
                {
                    Nome = "Petiscos Naturais para Cães 500g",
                    Descricao = "Petiscos 100% naturais, sem conservantes artificiais",
                    Preco = 24.90m,
                    Estoque = 80,
                    Status = StatusProduto.ATIVO,
                    CategoriaProdutoId = catAlimentacao.Id,
                    ImagensJson = JsonSerializer.Serialize(GenerateProductImages("dog,treats"))
                },
                new Produto
                {
                    Nome = "Brinquedo Kong Classic Vermelho - Grande",
                    Descricao = "Brinquedo resistente e durável, ideal para cães que adoram mastigar",
                    Preco = 65.90m,
                    Estoque = 25,
                    Status = StatusProduto.ATIVO,
                    CategoriaProdutoId = catBrinquedos.Id,
                    ImagensJson = JsonSerializer.Serialize(GenerateProductImages("dog,toy"))
                },
                new Produto
                {
                    Nome = "Bolinha de Tênis para Cães - Kit 3 unidades",
                    Descricao = "Kit com 3 bolinhas resistentes para brincadeiras ao ar livre",
                    Preco = 19.90m,
                    Estoque = 60,
                    Status = StatusProduto.ATIVO,
                    CategoriaProdutoId = catBrinquedos.Id,
                    ImagensJson = JsonSerializer.Serialize(GenerateProductImages("tennis,ball,dog"))
                },
                new Produto
                {
                    Nome = "Arranhador Torre para Gatos com 3 Andares",
                    Descricao = "Torre arranhador completa com plataformas e brinquedos suspensos",
                    Preco = 349.90m,
                    Estoque = 8,
                    Status = StatusProduto.ATIVO,
                    CategoriaProdutoId = catAcessorios.Id,
                    ImagensJson = JsonSerializer.Serialize(GenerateProductImages("cat,tower"))
                },
                new Produto
                {
                    Nome = "Cama Ortopédica para Cães - Tamanho Grande",
                    Descricao = "Cama super confortável com espuma ortopédica de alta densidade",
                    Preco = 249.90m,
                    Estoque = 15,
                    Status = StatusProduto.ATIVO,
                    CategoriaProdutoId = catAcessorios.Id,
                    ImagensJson = JsonSerializer.Serialize(GenerateProductImages("dog,bed"))
                },
                new Produto
                {
                    Nome = "Casinha de Madeira Premium - Média",
                    Descricao = "Casinha resistente às intempéries, ideal para áreas externas",
                    Preco = 599.90m,
                    Estoque = 5,
                    Status = StatusProduto.ATIVO,
                    CategoriaProdutoId = catAcessorios.Id,
                    ImagensJson = JsonSerializer.Serialize(GenerateProductImages("dog,house"))
                },
                new Produto
                {
                    Nome = "Kit Escova e Pente para Pets",
                    Descricao = "Conjunto completo para escovação e cuidado do pelo do seu pet",
                    Preco = 45.90m,
                    Estoque = 30,
                    Status = StatusProduto.ATIVO,
                    CategoriaProdutoId = catHigiene.Id,
                    ImagensJson = JsonSerializer.Serialize(GenerateProductImages("pet,brush"))
                },
                new Produto
                {
                    Nome = "Shampoo Hipoalergênico para Pets 500ml",
                    Descricao = "Shampoo suave e hipoalergênico para pets com pele sensível",
                    Preco = 32.90m,
                    Estoque = 40,
                    Status = StatusProduto.ATIVO,
                    CategoriaProdutoId = catHigiene.Id,
                    ImagensJson = JsonSerializer.Serialize(GenerateProductImages("shampoo,pet"))
                },
                new Produto
                {
                    Nome = "Coleira Ajustável Premium - Média",
                    Descricao = "Coleira confortável e resistente com fivela de segurança",
                    Preco = 39.90m,
                    Estoque = 45,
                    Status = StatusProduto.ATIVO,
                    CategoriaProdutoId = catColeiras.Id,
                    ImagensJson = JsonSerializer.Serialize(GenerateProductImages("dog,collar"))
                },
                new Produto
                {
                    Nome = "Guia Retrátil 5 metros",
                    Descricao = "Guia retrátil com trava de segurança, suporta até 30kg",
                    Preco = 79.90m,
                    Estoque = 20,
                    Status = StatusProduto.ATIVO,
                    CategoriaProdutoId = catColeiras.Id,
                    ImagensJson = JsonSerializer.Serialize(GenerateProductImages("dog,leash"))
                }
            };

            await context.Produtos.AddRangeAsync(novosProdutos);
            await context.SaveChangesAsync();
            Console.WriteLine($"✅ {novosProdutos.Length} produtos criados!");

            // ==========================================
            // SEED PETS E ANÚNCIOS DE ADOÇÃO
            // ==========================================
            Console.WriteLine("🐾 Criando pets para adoção...");

            // Buscar usuário Olivier Rubinger (ID 16) e torná-lo ADMIN
            var usuario = await context.Usuarios.FindAsync(16);
            if (usuario == null)
            {
                Console.WriteLine("⚠️  Usuário ID 16 (Olivier Rubinger) não encontrado!");
                Console.WriteLine("❌ Não é possível criar pets sem usuário. Abortando seed de pets.");
                return;
            }
            
            // Tornar o usuário ADMIN se ainda não for
            if (usuario.Tipo != TipoUsuario.ADMIN)
            {
                usuario.Tipo = TipoUsuario.ADMIN;
                await context.SaveChangesAsync();
                Console.WriteLine($"✅ {usuario.Nome} agora é ADMIN!");
            }
            
            Console.WriteLine($"✅ Vinculando pets ao usuário: {usuario.Nome} (ADMIN)");

            var novosPets = new[]
            {
                new Pet
                {
                    UsuarioId = usuario.Id,
                    Nome = "Thor",
                    Especie = EspeciePet.CACHORRO,
                    Raca = "Labrador Retriever",
                    idadeMeses = 24, // 2 anos
                    Porte = PortePet.GRANDE,
                    Cidade = "São Paulo",
                    Estado = "SP",
                    Observacoes = "Thor é um labrador super carinhoso e brincalhão. Adora crianças e se dá muito bem com outros animais de estimação.",
                    FotosJson = JsonSerializer.Serialize(new[] { RandomDogImage(), RandomDogImage(), RandomDogImage() })
                },
                new Pet
                {
                    UsuarioId = usuario.Id,
                    Nome = "Luna",
                    Especie = EspeciePet.CACHORRO,
                    Raca = "Vira-lata (SRD)",
                    idadeMeses = 12, // 1 ano
                    Porte = PortePet.PEQUENO,
                    Cidade = "Rio de Janeiro",
                    Estado = "RJ",
                    Observacoes = "Luna é uma cachorrinha dócil e muito educada. Perfeita para apartamentos e adapta-se bem a espaços pequenos.",
                    FotosJson = JsonSerializer.Serialize(new[] { RandomDogImage(), RandomDogImage() })
                },
                new Pet
                {
                    UsuarioId = usuario.Id,
                    Nome = "Max",
                    Especie = EspeciePet.CACHORRO,
                    Raca = "Golden Retriever",
                    idadeMeses = 36, // 3 anos
                    Porte = PortePet.GRANDE,
                    Cidade = "Belo Horizonte",
                    Estado = "MG",
                    Observacoes = "Max é extremamente inteligente e obediente. Ideal para famílias ativas que gostam de passeios e atividades ao ar livre.",
                    FotosJson = JsonSerializer.Serialize(new[] { RandomDogImage(), RandomDogImage(), RandomDogImage() })
                },
                new Pet
                {
                    UsuarioId = usuario.Id,
                    Nome = "Mia",
                    Especie = EspeciePet.CACHORRO,
                    Raca = "Poodle",
                    idadeMeses = 48, // 4 anos
                    Porte = PortePet.PEQUENO,
                    Cidade = "Curitiba",
                    Estado = "PR",
                    Observacoes = "Mia é calma e carinhosa, adora colo e brincadeiras leves. É uma companheira perfeita para quem busca tranquilidade.",
                    FotosJson = JsonSerializer.Serialize(new[] { RandomDogImage(), RandomDogImage() })
                },
                new Pet
                {
                    UsuarioId = usuario.Id,
                    Nome = "Bob",
                    Especie = EspeciePet.CACHORRO,
                    Raca = "Beagle",
                    idadeMeses = 24, // 2 anos
                    Porte = PortePet.MEDIO,
                    Cidade = "Porto Alegre",
                    Estado = "RS",
                    Observacoes = "Bob é cheio de energia e adora aventuras ao ar livre. Muito sociável e adora fazer novos amigos, tanto humanos quanto caninos!",
                    FotosJson = JsonSerializer.Serialize(new[] { RandomDogImage(), RandomDogImage(), RandomDogImage() })
                },
                new Pet
                {
                    UsuarioId = usuario.Id,
                    Nome = "Bella",
                    Especie = EspeciePet.CACHORRO,
                    Raca = "Shih Tzu",
                    idadeMeses = 60, // 5 anos
                    Porte = PortePet.PEQUENO,
                    Cidade = "Brasília",
                    Estado = "DF",
                    Observacoes = "Bella é uma companheira fiel e tranquila. Ideal para idosos ou pessoas que buscam um pet calmo e afetuoso para o dia a dia.",
                    FotosJson = JsonSerializer.Serialize(new[] { RandomDogImage(), RandomDogImage() })
                },
                new Pet
                {
                    UsuarioId = usuario.Id,
                    Nome = "Rex",
                    Especie = EspeciePet.CACHORRO,
                    Raca = "Pastor Alemão",
                    idadeMeses = 48, // 4 anos
                    Porte = PortePet.GRANDE,
                    Cidade = "Salvador",
                    Estado = "BA",
                    Observacoes = "Rex é protetor e extremamente leal à sua família. Ótimo cão de guarda e ao mesmo tempo um excelente companheiro para todas as horas.",
                    FotosJson = JsonSerializer.Serialize(new[] { RandomDogImage(), RandomDogImage(), RandomDogImage() })
                },
                new Pet
                {
                    UsuarioId = usuario.Id,
                    Nome = "Nina",
                    Especie = EspeciePet.CACHORRO,
                    Raca = "Maltês",
                    idadeMeses = 12, // 1 ano
                    Porte = PortePet.PEQUENO,
                    Cidade = "Fortaleza",
                    Estado = "CE",
                    Observacoes = "Nina é uma cachorrinha adorável e muito brincalhona. Adora fazer novos amigos e se adapta facilmente a diferentes ambientes e rotinas.",
                    FotosJson = JsonSerializer.Serialize(new[] { RandomDogImage(), RandomDogImage() })
                }
            };

            await context.Pets.AddRangeAsync(novosPets);
            await context.SaveChangesAsync();
            Console.WriteLine($"✅ {novosPets.Length} pets criados!");

            // Criar anúncios de adoção para cada pet
            Console.WriteLine("📢 Criando anúncios de adoção...");

            var novosAnuncios = new List<AnuncioDoacao>();

            foreach (var pet in novosPets)
            {
                novosAnuncios.Add(new AnuncioDoacao
                {
                    PetId = pet.Id,
                    Descricao = pet.Observacoes ?? "Pet disponível para adoção!",
                    ContatoWhatsapp = $"(11) 9{_random.Next(1000, 9999)}-{_random.Next(1000, 9999)}",
                    Moderacao = Moderacao.APROVADO,
                    Status = Status.ATIVO
                });
            }

            await context.AnuncioDoacoes.AddRangeAsync(novosAnuncios);
            await context.SaveChangesAsync();
            Console.WriteLine($"✅ {novosAnuncios.Count} anúncios de adoção criados!");

            Console.WriteLine("🎉 Seed concluído com sucesso!");
        }
    }
}