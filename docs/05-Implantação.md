# Implantação do Software

## Planejamento da Implantação

Nesta etapa do projeto **PetGo**, foi desenvolvido exclusivamente o **back-end da aplicação**, responsável pela lógica de negócio, manipulação de dados e disponibilização de endpoints via API.

### Tecnologias Utilizadas

- .NET (ASP.NET Core Web API)
- C#
- Entity Framework Core
- Banco de dados relacional (PostgreSQL)
- Swagger (para documentação e testes da API)
- Git e GitHub para versionamento

### Processo de Implantação

#### 1. Preparação do ambiente

- Instalar o .NET SDK compatível com o projeto
- Configurar um banco de dados (caso aplicável)
- Ter o Git instalado

#### 2. Clonagem do repositório

```bash
git clone https://github.com/ICEI-PUC-Minas-PMV-SInt/pmv-sint-2026-1-e5-proj-movext-t1-petgo.git
cd pmv-sint-2026-1-e5-proj-movext-t1-petgo


## 3. Execução do back-end

```bash
cd src/petgo-api
dotnet restore
dotnet run
```

A API será executada localmente em:

```
http://localhost:5085
```

---

## 4. Testes da aplicação

Os testes da API podem ser realizados por meio de:

- Swagger (quando habilitado no projeto)
- Ferramentas como Postman
- Comandos via terminal (PowerShell)

### Exemplo de teste utilizando PowerShell:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:5085/api/health
```

---

## Estratégia de Implantação

Nesta etapa, a aplicação está preparada para execução em ambiente local. Em etapas futuras, poderá ser implantada em ambiente de produção utilizando:

- Serviços de hospedagem para APIs (Azure, Render, Railway)
- Banco de dados em nuvem
- Integração contínua (CI/CD)

---

## Planejamento de Evolução da Aplicação

Como o projeto encontra-se na fase de desenvolvimento do back-end, estão previstas as seguintes evoluções:

### Melhorias Técnicas

- Implementação completa de autenticação e autorização (JWT)
- Padronização das respostas da API
- Tratamento global de exceções
- Criação de testes automatizados
- Organização e refatoração dos serviços

---

### Evolução Funcional

- Expansão dos endpoints existentes
- Implementação de novas regras de negócio
- Integração completa entre entidades (usuários, pets, passeios, etc.)

---

### Próximas Etapas

- Desenvolvimento do front-end da aplicação
- Integração entre front-end e back-end
- Melhorias na experiência do usuário