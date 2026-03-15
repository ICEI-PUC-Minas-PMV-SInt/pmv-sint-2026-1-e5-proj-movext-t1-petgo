# Especificações do Projeto

A especificação do projeto detalha a solução proposta para o problema apresentado na documentação de contexto, descrevendo as funcionalidades, requisitos e estrutura tecnológica da aplicação PetGo. Esta etapa define os componentes do sistema necessários para atender tutores, prestadores de serviços e organizações de proteção animal.

## Arquitetura e Tecnologias

A plataforma PetGo utiliza uma arquitetura cliente-servidor, com separação clara entre frontend, backend e banco de dados, garantindo escalabilidade e facilidade de manutenção.

# Frontend

Responsável pela interface e experiência do usuário (UX), hospedado na plataforma **Vercel**.

* **Tecnologias:** Next.js 15, React, TypeScript 5, Tailwind CSS 4.
* **Bibliotecas:** React Query (estado), React Hook Form (formulários), Zod (validação), Axios (HTTP), Lucide React (ícones).
* **Produção:** [https://pet-go-puc.vercel.app](https://pet-go-puc.vercel.app)

### Backend (API REST)

Gerencia as regras de negócio e a comunicação com o banco de dados, hospedado na plataforma **Railway**.

* **Tecnologias:** ASP.NET Core 9.0, Entity Framework Core 9.0 (ORM).
* **Documentação:** Swagger/OpenAPI.
* **Produção:** [Link da API](https://petgo-production.up.railway.app/swagger)

### Banco de Dados

* **Tecnologia:** Supabase PostgreSQL 15.
* **Recursos:** Connection Pooler (PgBouncer) e backups automáticos.

## Project Model Canvas

![Project Model Canvas](documents/img/ProjectModelCanva.png)

## Requisitos

A priorização utiliza a técnica **MoSCoW** (Must Have, Should Have, Could Have).

### Requisitos Funcionais (RF)

| ID | Descrição do Requisito | Prioridade |
| --- | --- | --- |
| RF-001 | Permitir cadastro de usuários na plataforma | ALTA |
| RF-002 | Permitir autenticação e login de usuários | ALTA |
| RF-003 | Permitir gerenciamento de usuários (criação, edição e exclusão) | ALTA |
| RF-004 | Permitir visualizar catálogo de produtos para pets | ALTA |
| RF-005 | Permitir cadastrar, editar e remover produtos | MÉDIA |
| RF-006 | Permitir visualizar pets disponíveis para adoção | ALTA |
| RF-007 | Permitir cadastrar, editar e remover pets no sistema | ALTA |
| RF-008 | Permitir conexão entre tutores e prestadores de serviços | ALTA |
| RF-009 | Permitir sistema de avaliações de serviços e produtos | MÉDIA |
| RF-010 | Permitir acesso às informações das ONGs parceiras | MÉDIA |

### Requisitos Não Funcionais (RNF)

| ID | Descrição do Requisito | Prioridade |
| --- | --- | --- |
| RNF-001 | O sistema deve ser acessível via web e dispositivos móveis (Responsivo) | ALTA |
| RNF-002 | O tempo de resposta das requisições deve ser inferior a 3 segundos | MÉDIA |
| RNF-003 | O sistema deve garantir segurança e proteção dos dados (LGPD) | ALTA |
| RNF-004 | A API deve possuir documentação acessível via Swagger | ALTA |
| RNF-005 | O sistema deve permitir deploy contínuo automatizado (CI/CD) | MÉDIA |
| RNF-006 | O sistema deve ser escalável para futuras funcionalidades | BAIXA |

## Restrições


| ID | Restrição |
| --- | --- |
| 01 | O projeto deverá ser entregue até o final do semestre letivo |
| 02 | O desenvolvimento será realizado exclusivamente pela equipe de alunos |
| 03 | A integração com a ONG será limitada à divulgação e adoção de pets |
| 04 | O projeto deve utilizar ferramentas gratuitas ou acadêmicas |

## Diagrama de Casos de Uso

O diagrama de casos de uso é o próximo passo após a elicitação de requisitos, que utiliza um modelo gráfico e uma tabela com as descrições sucintas dos casos de uso e dos atores. Ele contempla a fronteira do sistema e o detalhamento dos requisitos funcionais com a indicação dos atores, casos de uso e seus relacionamentos. 

As referências abaixo irão auxiliá-lo na geração do artefato “Diagrama de Casos de Uso”.

> **Links Úteis**:
> - [Criando Casos de Uso](https://www.ibm.com/docs/pt-br/elm/6.0?topic=requirements-creating-use-cases)
> - [Como Criar Diagrama de Caso de Uso: Tutorial Passo a Passo](https://gitmind.com/pt/fazer-diagrama-de-caso-uso.html/)
> - [Lucidchart](https://www.lucidchart.com/)
> - [Astah](https://astah.net/)
> - [Diagrams](https://app.diagrams.net/)

## Modelo ER (Projeto Conceitual)

O Modelo ER representa através de um diagrama como as entidades (coisas, objetos) se relacionam entre si na aplicação interativa.

Sugestão de ferramentas para geração deste artefato: LucidChart e Draw.io.

A referência abaixo irá auxiliá-lo na geração do artefato “Modelo ER”.

> - [Como fazer um diagrama entidade relacionamento | Lucidchart](https://www.lucidchart.com/pages/pt/como-fazer-um-diagrama-entidade-relacionamento)

## Projeto da Base de Dados

O projeto da base de dados corresponde à representação das entidades e relacionamentos identificadas no Modelo ER, no formato de tabelas, com colunas e chaves primárias/estrangeiras necessárias para representar corretamente as restrições de integridade.
