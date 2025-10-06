# API de Transferências e Usuários

> Projeto desenvolvido como Desafio #3 de mentoria em Testes de Software, orientado por [Júlio de Lima](https://github.com/juliodelimas/pgats-02-api).

## Sumário
- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Como Executar](#como-executar)
- [Como Rodar os Testes](#como-rodar-os-testes)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Regras de Negócio](#regras-de-negócio)
- [Resultados dos Testes](#resultados-dos-testes)
- [Créditos e Licença](#créditos-e-licença)

## Sobre o Projeto

Este repositório é um fork do projeto original do Júlio de Lima, com o objetivo de praticar automação de testes de API REST e testes de performance. O desafio consiste em criar testes automatizados para todos os endpoints REST usando SuperTest/Mocha e scripts de performance com k6.

## Tecnologias Utilizadas

- Node.js
- Express
- Swagger (documentação)
- SuperTest & Mocha (testes automatizados)
- k6 (testes de performance)
- Chai (assertions)
- Banco de dados em memória

## Como Executar

1. **Clone o repositório:**
   ```sh
   git clone https://github.com/caiobberiba/transfer-users-api-testing.git
   cd transfer-users-api-testing
   ```
2. **Instale as dependências:**
   ```sh
   npm install
   ```
3. **Configure o arquivo `.env`:**
   ```
   BASE_URL_REST=http://localhost:3000
   BASE_URL_GRAPHQL=http://localhost:3000/graphql
   ```
4. **Inicie o servidor:**
   ```sh
   node server.js
   ```
   - Acesse a API em: [http://localhost:3000](http://localhost:3000)
   - Documentação Swagger: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Como Rodar os Testes

- **Testes automatizados (SuperTest/Mocha):**
  ```sh
  npx mocha test/rest/external/userExternal.test.js
  npx mocha test/rest/external/transferExternal.test.js
  npx mocha test/rest/controller/transferController.test.js
  ```
- **Testes de performance (k6):**
  ```sh
  k6 run test/performance/user-flow.js
k6 run test/performance/transfer-flow.js
  ```

## Estrutura do Projeto

```
.
├── app.js
├── server.js
├── docs/                    # Documentação e evidências dos testes
├── controller/             # Lógica dos endpoints REST
├── model/                 # Modelos e estruturas de dados
├── service/              # Regras de negócio
├── middleware/          # Middlewares da aplicação
├── test/
│   ├── rest/
│   │   ├── controller/  # Testes dos controllers
│   │   ├── external/    # Testes de integração
│   │   └── fixture/    # Dados para os testes
│   └── performance/    # Scripts de testes de performance (k6)
└── ...
```

- **controller/**: Lógica dos endpoints REST
- **service/**: Regras de negócio
- **test/**: Testes automatizados (REST)
- **test/rest/external/**: Testes simulando chamadas externas (como um cliente real)
- **test/rest/controller/**: Testes focados nos controllers

## Regras de Negócio

- Não é permitido registrar usuários duplicados.
- Login exige usuário e senha.
- Transferências acima de R$ 5.000,00 só podem ser feitas para favorecidos.
- O saldo inicial de cada usuário é de R$ 10.000,00.

## Resultados dos Testes

### Testes de Usuários (userExternal)
- **Registro, login e listagem de usuários**
  
   ![Registro, login e listagem de usuários](./docs/print-test-user-external.jpg)

### Testes de Transferências (transferController)
- **POST e GET /transfers (Controller)**
  
   ![Transfer Controller - POST e GET](./docs/print-test-transfer-controller.jpg)

### Testes de Transferências (transferExternal)
- **POST e GET /transfers (External)**
  
   ![Transfer External - POST e GET](./docs/print-test-transfer-external.jpg)

## Créditos e Licença

- Projeto original: [Júlio de Lima](https://github.com/juliodelimas/pgats-02-api)
- Este fork foi desenvolvido para fins educacionais, como parte do Desafio #3 da Mentoria.
- Licença: a mesma do projeto original

---