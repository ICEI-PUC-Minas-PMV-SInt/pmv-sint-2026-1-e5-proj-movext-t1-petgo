# PetGo

`Sistemas Para Internert`

`Projeto: Desenvolvimento de Aplicações Móveis`

`Eixo 5`

## Integrantes

* Marcello Abritta Nogueira Rezende
* Ligia de Castro Martins
* Olivier Lopes Rubinger

## Orientador

* Udo Fritzke Junior

## Cliente/ONG - OPA Bixos

Representante: Alexia Muzzi Carnevali Dubois

Instagram: https://www.instagram.com/opabichos?igsh=Ym5yZHN4cDIyaXNm

## 📋 Sobre o Projeto

**PetGo** é uma plataforma completa para cuidado de animais de estimação que conecta tutores, prestadores de serviços (dog walkers/pet sitters) e voluntários de **ONGs de adoção**. Pensado para tutores que sofrem com a falta de tempo e a dificuldade de encontrar serviços confiáveis, o PetGo vai além do cuidado básico ao reunir, em um só ecossistema, conveniência, confiança e impacto social.

O grande coração do app é o seu sistema de **doações e apoio à causa animal**: ao utilizar nossos serviços ou realizar compras no shop, o usuário contribui diretamente para **ONGs parceiras**. Assim, o PetGo se torna a solução ideal para quem quer garantir o bem-estar do próprio pet e, ao mesmo tempo, ajudar animais que ainda esperam por um lar, transformando cada passeio, compra ou interação em um ato de solidariedade.

Diferente de lojas genéricas ou aplicativos isolados, o PetGo une produtos, serviços e adoções responsáveis em uma experiência única, com foco na transparência, na confiança e no compromisso social. Cada transação gera um impacto real na vida de animais resgatados, fortalecendo uma comunidade que prioriza a vida animal e faz do cuidado com o seu melhor amigo também uma forma de alimentar a esperança de muitos outros.

A aplicação oferece funcionalidades como:

- 🐕 **Catálogo de Produtos**: Ração, brinquedos, acessórios e produtos de higiene
- 🚶 **Serviços de Passeio**: Conexão entre tutores e dog walkers
- ❤️ **Adoção de Pets**: Plataforma para doação e adoção responsável
- ⭐ **Sistema de Avaliações**: Feedback sobre produtos e serviços
- 👤 **Gerenciamento de Usuários**: Cadastro e autenticação

## 🏗️ Arquitetura do Sistema

### **Stack Tecnológica**

- **Frontend**: Next.js 15 (React/TypeScript) com Tailwind CSS
  - Deploy: **Vercel** ([https://pet-go-puc.vercel.app](https://pet-go-puc.vercel.app))
  - CI/CD: Automático via GitHub
- **Backend**: ASP.NET Core 9.0 (C#) com Entity Framework Core
  - Deploy: **Railway** ([https://petgo-production.up.railway.app](https://petgo-production.up.railway.app))
  - CI/CD: Automático via GitHub
- **Banco de Dados**: **Supabase PostgreSQL**
  - Managed PostgreSQL 15
  - Connection Pooler (PgBouncer)
  - Backups automáticos
- **API**: REST com documentação Swagger/OpenAPI
  - Swagger UI: [https://petgo-production.up.railway.app/swagger](https://petgo-production.up.railway.app/swagger)

---


# Documentação

<ol>
<li><a href="docs/01-Documentação de Contexto.md"> Documentação de Contexto</a></li>
<li><a href="docs/02-Especificação do Projeto.md"> Especificação do Projeto</a></li>
<li><a href="docs/03-Projeto de Interface.md"> Projeto de Interface</a></li>
<li><a href="docs/04-Testes de Software.md"> Testes de Software</a></li>
<li><a href="docs/05-Implantação.md"> Implantação</a></li>
</ol>

## 🚀 Como Executar o Projeto

### 📋 **Pré-requisitos**

Certifique-se de ter instalado:

- **.NET 9.0 SDK** - [Download aqui](https://dotnet.microsoft.com/download/dotnet/9.0)
- **Node.js 18+** - [Download aqui](https://nodejs.org/)
- **Git** - [Download aqui](https://git-scm.com/)

### 1️⃣ **Clonar o Repositório**

```bash
git clone https://github.com/ICEI-PUC-Minas-PMV-SInt/pmv-sint-2026-1-e5-proj-movext-t1-petgo.git
cd pmv-sint-2026-1-e5-proj-movext-t1-petgo
```

### 2️⃣ **Configurar e Executar o Backend (.NET Core)**

```bash
# Navegar para a pasta do backend
cd src/petgo-api

# Restaurar dependências
dotnet restore

# Configurar connection string do banco de dados
# Edite appsettings.json ou appsettings.Development.json
# Exemplo com Supabase PostgreSQL:
# "DefaultConnection": "Host=db.xxx.supabase.co;Port=5432;Database=postgres;Username=postgres.xxx;Password=xxx;SSL Mode=Require"

# Criar e aplicar migrations (primeira execução)
dotnet ef migrations add InitialCreate
dotnet ef database update

# Executar a API
dotnet run
```

**🌐 Backend estará disponível em:**

- API: `http://localhost:5021`
- Swagger UI: `http://localhost:5021/swagger`

**📊 Produção:**

- API: `https://petgo-production.up.railway.app`
- Swagger: `https://petgo-production.up.railway.app/swagger`

### 3️⃣ **Configurar e Executar o Frontend (Next.js)**

```bash
# Em um novo terminal, navegar para a pasta do frontend
cd src/petgo-frontend

# Instalar dependências
npm install

# Configurar variável de ambiente
# Crie o arquivo .env.local com:
# NEXT_PUBLIC_API_URL=http://localhost:5021

# Executar o frontend em modo desenvolvimento
npm run dev
```

**🌐 Frontend estará disponível em:**

- Desenvolvimento: `http://localhost:3000`
- Produção: `https://pet-go-puc.vercel.app`

---

## 🛠️ **Comandos Úteis**

### **Backend Commands**

```bash
# Restaurar dependências
dotnet restore

# Build do projeto
dotnet build

# Executar testes
dotnet test

# Limpar migrations (se necessário)
dotnet ef database drop --force
dotnet ef migrations remove --force

# Recriar banco de dados
dotnet ef migrations add InitialCreate_PetGo
dotnet ef database update

# Executar com hot reload
dotnet watch run
```

### **Frontend Commands**

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start

# Lint do código
npm run lint

# Limpar cache do Next.js
rm -rf .next
```

---

## 🔗 **Endpoints da API**

### **Produtos**

| Método | Endpoint             | Descrição                |
| ------ | -------------------- | ------------------------ |
| GET    | `/api/produtos`      | Listar todos os produtos |
| GET    | `/api/produtos/{id}` | Obter produto específico |
| POST   | `/api/produtos`      | Criar novo produto       |
| PUT    | `/api/produtos/{id}` | Atualizar produto        |
| DELETE | `/api/produtos/{id}` | Deletar produto          |

### **Usuários**

| Método | Endpoint             | Descrição                |
| ------ | -------------------- | ------------------------ |
| GET    | `/api/usuarios`      | Listar todos os usuários |
| GET    | `/api/usuarios/{id}` | Obter usuário específico |
| POST   | `/api/usuarios`      | Criar novo usuário       |
| PUT    | `/api/usuarios/{id}` | Atualizar usuário        |
| DELETE | `/api/usuarios/{id}` | Deletar usuário          |

### **Pets**

| Método | Endpoint         | Descrição            |
| ------ | ---------------- | -------------------- |
| GET    | `/api/pets`      | Listar todos os pets |
| GET    | `/api/pets/{id}` | Obter pet específico |
| POST   | `/api/pets`      | Criar novo pet       |
| PUT    | `/api/pets/{id}` | Atualizar pet        |
| DELETE | `/api/pets/{id}` | Deletar pet          |

---

## 🧪 **Testes**

### **Backend (Testes Unitários)**

```bash
cd src/petgo-api
dotnet test
```

### **Frontend (Em desenvolvimento)**

```bash
cd src/petgo-frontend
npm test
```

---

## 🌐 **Tecnologias Utilizadas**

### **Backend**

- **ASP.NET Core 9.0** - Framework web
- **Entity Framework Core 9.0** - ORM
- **Npgsql** - PostgreSQL driver para .NET
- **Supabase PostgreSQL 15** - Banco de dados gerenciado
- **Swagger/OpenAPI** - Documentação da API
- **Railway** - Plataforma de deploy

### **Frontend**

- **Next.js 15** - Framework React com App Router
- **TypeScript 5** - Linguagem tipada
- **Tailwind CSS 4** - Framework CSS utilitário
- **React Query (TanStack Query v5)** - Gerenciamento de estado servidor
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **Vercel** - Plataforma de deploy

### **DevOps & Qualidade**

- **ESLint** - Linting JavaScript/TypeScript
- **Prettier** - Formatação de código
- **Husky** - Git hooks
- **Docker** - Containerização (futuro)

---

## 🔧 **Configurações Específicas**

### **Variáveis de Ambiente**

#### **Frontend (.env.local)**

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5021

# Production
# NEXT_PUBLIC_API_URL=https://petgo-production.up.railway.app

# App Configuration
NEXT_PUBLIC_APP_NAME=PetGo
NEXT_PUBLIC_APP_VERSION=1.0.0

# Desenvolvimento
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

#### **Backend (appsettings.json)**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=petgo;Username=postgres;Password=postgres"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

#### **Produção (Railway Environment Variables)**

```env
# Supabase PostgreSQL Connection
ConnectionStrings__DefaultConnection=Host=aws-0-us-east-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.xxx;Password=xxx;SSL Mode=Require;Trust Server Certificate=true

# ASP.NET Configuration
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:$PORT
```

### **Configuração do Banco de Dados**

O projeto usa **Supabase PostgreSQL** em produção e pode usar PostgreSQL local em desenvolvimento.

#### **Supabase (Produção)**

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a **Connection String** (use o **Connection Pooler** para Railway)
4. Configure no Railway como variável de ambiente

#### **PostgreSQL Local (Desenvolvimento)**

```bash
# Instale o PostgreSQL
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Crie o banco de dados
createdb petgo

# Configure a connection string no appsettings.Development.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=petgo;Username=postgres;Password=postgres"
  }
}
```

# Código

<li><a href="src/README.md"> Código Fonte</a></li>

# Apresentação

<li><a href="presentation/README.md"> Apresentação da solução</a></li>
