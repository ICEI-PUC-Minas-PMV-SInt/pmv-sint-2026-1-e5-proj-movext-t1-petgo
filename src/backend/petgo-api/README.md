
# PetGo API

**PetGo API** fornece um conjunto de APIs para gestão de tarefas, permitindo a criação, leitura, atualização e exclusão (CRUD) de tarefas de forma eficiente.

## Requisitos

- **.NET 8.0 ou superior**

Para instalar as dependências necessárias, utilize os seguintes comandos:

```bash
dotnet add package Microsoft.AspNetCore.OpenApi --version 7.0.16
dotnet add package Microsoft.EntityFrameworkCore --version 8.0.8
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.8
dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 8.0.8  # Para usar SQLite
dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.8  # Para usar SQL Server
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.8
```

## Instalação (Local)

1. Clone o repositório:

```bash
git chttps://github.com/gomesluiz/template-sint-projeto-de-aplicacao-distribuido
cd template-sint-projeto-de-aplicacao-distribuido/src/petgo.api
```

2. Compile o projeto:

```bash
dotnet build
```

## Execução

Para rodar o servidor localmente:

```bash
dotnet run
```

A API estará disponível em: `http://localhost:5000`.

## Endpoints

| Método HTTP | Endpoint           | Descrição                                      |
|-------------|--------------------|------------------------------------------------|
| GET         | `/api/todo`         | Retorna a lista de todas as tarefas            |
| GET         | `/api/todo/{id}`    | Retorna uma tarefa específica com base no `id` |
| POST        | `/api/todo`         | Cria uma nova tarefa                          |
| PUT         | `/api/todo/{id}`    | Atualiza uma tarefa existente                 |
| DELETE      | `/api/todo/{id}`    | Exclui uma tarefa específica com base no `id`  |

## Testes

Para rodar os testes, utilize o comando abaixo:

```bash
dotnet test
```

## Contribuição

Contribuições são bem-vindas! Para mudanças significativas, por favor, abra uma *issue* primeiro para discutirmos o que você gostaria de alterar.

Certifique-se de seguir estas diretrizes:

- Atualize a documentação quando necessário.
- Inclua testes adequados para quaisquer novas funcionalidades ou correções.

### Como contribuir

1. Fork o repositório
2. Crie uma branch para a nova funcionalidade (`git checkout -b feature/nova-funcionalidade`)
3. Faça o commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob os termos da [Licença MIT](https://choosealicense.com/licenses/mit/).