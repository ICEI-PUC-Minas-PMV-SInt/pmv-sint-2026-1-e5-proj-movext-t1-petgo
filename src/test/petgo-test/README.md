# Testes - PetGo API

Implementação dos testes automatizados para a API do PetGo.

## Tecnologias

- **NUnit** 3.14 - Framework de testes
- **FluentAssertions** 6.12 - Asserções fluentes
- **Moq** 4.20 - Mocks e stubs
- **EF Core InMemory** - Banco de dados em memória

## Estrutura

```
src/test/petgo-test/
├── PasseadoresControllerTests.cs      # Testes de listagem de passeadores
├── ServicoPasseadorTests.cs          # Testes de cadastro com serviços
├── UsuariosControllerTests.cs        # Testes de usuários
├── ProdutosControllerTests.cs        # Testes de produtos
└── TestBase.cs                       # Helpers compartilhados
```

## Cobertura de Testes

### PasseadoresController (8 testes)

Testes para o endpoint `/api/Passeadores`:

**Listagem:**

- Lista vazia quando não há passeadores
- Retorna passeadores com serviços ativos
- Retorna múltiplos passeadores

**Busca:**

- Busca por ID válido
- Retorna 404 para ID inválido
- Inclui serviços na resposta

**Validações:**

- Filtra serviços inativos
- Retorna todos os campos necessários

### ServicoPasseador (9 testes)

Testes para cadastro de passeadores e seus serviços:

**Criação:**

- Passeador com um serviço
- Passeador com múltiplos serviços
- Passeador com todos os tipos de serviço
- Passeador sem serviços
- Ignora duplicatas na lista

**Cliente:**

- Cliente sem dados de passeador

**Validação:**

- Email duplicado
- Múltiplos passeadores
- Descrição longa

### Usuários (13 testes)

**CRUD:**

- Listar usuários
- Buscar por ID
- Deletar usuário

**Autenticação:**

- Login com sucesso
- Login com senha errada

**Cadastro:**

- Novo usuário
- Email duplicado

**Atualização:**

- Atualizar dados gerais
- Atualizar dados de passeador
- Usuário inexistente

### Produtos (5 testes)

- Listar produtos
- Buscar por ID
- Criar produto
- Atualizar produto
- Deletar produto

## Como Executar

### Todos os testes

```bash
dotnet test
```

### Com detalhes

```bash
dotnet test --logger "console;verbosity=detailed"
```

### Testes específicos

```bash
# Passeadores
dotnet test --filter "FullyQualifiedName~PasseadoresController"

# Serviços
dotnet test --filter "FullyQualifiedName~ServicoPasseador"

# Usuários
dotnet test --filter "FullyQualifiedName~UsuariosController"
```

### Com cobertura

```bash
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=lcov
```

## Informações Úteis

### Tipos de Usuário

- 0 = CLIENTE
- 1 = PASSEADOR
- 2 = ADMIN

### Tipos de Serviço

- 0 = PASSEIO
- 1 = CUIDADO_DIARIO
- 2 = HOSPEDAGEM
- 3 = OUTRO

### Validações

- Descrição do passeador: 20-1500 caracteres
- Valor cobrado: R$ 1,00 - R$ 10.000,00

## Padrão AAA

Os testes seguem o padrão Arrange-Act-Assert:

```csharp
[Test]
public async Task NomeDoTeste()
{
    // Arrange - Preparar dados
    var dto = new UsuarioCreateDto { ... };

    // Act - Executar ação
    var result = await _controller.RegisterUsuario(dto);

    // Assert - Verificar resultado
    result.Result.Should().BeOfType<CreatedAtActionResult>();
}
```

## Helpers

A classe `TestBase` fornece métodos auxiliares:

```csharp
// Contexto do banco em memória
var context = TestBase.CreateInMemoryContext();

// Mock da configuração (JWT)
var config = TestBase.CreateMockConfiguration();

// DTO padrão de passeador
var dto = TestBase.CreatePasseadorDto("email@test.com");
```

## Melhorias Futuras

- Testes E2E de integração
- Cobertura para Pets e Avaliações
- Testes de performance
- Validação de DTOs
- Testes de autorização

---

**Total:** 34 testes  
**Status:** ✓ Todos passando
