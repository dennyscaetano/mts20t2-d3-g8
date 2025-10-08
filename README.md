# 🚀 API de Transferências e Usuários

> Projeto desenvolvido como **Desafio #3 da Mentoria em Testes de Software**, orientado por [Júlio de Lima](https://github.com/juliodelimas/pgats-02-api).

![Node.js 18.x](https://img.shields.io/badge/node.js-18.x-green?logo=node.js)
![Mocha](https://img.shields.io/badge/Mocha-Testing-red?logo=mocha)
![SuperTest](https://img.shields.io/badge/SuperTest-API%20Testing-orange)
![k6](https://img.shields.io/badge/k6-Performance-blueviolet?logo=k6)

---

## 📘 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Como Executar](#-como-executar)
- [Como Rodar os Testes](#-como-rodar-os-testes)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Regras de Negócio](#-regras-de-negócio)
- [Testes de Performance](#-testes-de-performance)
- [Resultados dos Testes](#-resultados-dos-testes)
- [Relatórios e Evidências](#-relatórios-e-evidências)
- [Métricas de Cobertura e Performance](#-métricas-de-cobertura-e-performance)
- [Créditos e Licença](#-créditos-e-licença)

---

## 🧩 Sobre o Projeto

Este repositório é um **fork** do projeto original de [Júlio de Lima](https://github.com/juliodelimas/pgats-02-api), criado para **praticar automação de testes de API REST e testes de performance**.

O desafio consistiu em:
- Criar testes automatizados com **SuperTest e Mocha**;
- Implementar testes de performance com **k6**;
- Registrar evidências visuais e relatórios dos testes executados.

---

## 🧰 Tecnologias Utilizadas

- **Node.js**
- **Express** – API REST
- **Apollo Server** – API GraphQL
- **GraphQL** – Query language
- **Swagger** – Documentação de endpoints REST
- **SuperTest** & **Mocha** – Testes automatizados
- **k6** – Testes de performance
- **Chai** – Framework de assertions
- **Banco de dados em memória**

---

## ⚙️ Como Executar

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
```env
BASE_URL_REST=http://localhost:3000
BASE_URL_GRAPHQL=http://localhost:4000/graphql
```

4. **Inicie os servidores:**

**API REST:**
```sh
npm run start-rest
# ou
node server.js
```

**API GraphQL:**
```sh
npm run start-graphql
# ou
node graphql/server.js
```

- **API REST** disponível em: <http://localhost:3000>  
- **API GraphQL** disponível em: <http://localhost:4000/graphql>
- **Documentação Swagger**: <http://localhost:3000/api-docs>

---

## 🧪 Como Rodar os Testes

### 🧭 Testes Funcionais (SuperTest/Mocha)

**Executar todos os testes funcionais:**
```sh
npm test
```

**Executar testes específicos:**
```sh
# Testes REST
npm run test-rest-external
npm run test-rest-controller

# Testes GraphQL
npm run test-graphql-external
npm run test-graphql-controller
```

### ⚡ Testes de Performance (k6)

**Executar todos os testes de performance:**
```sh
npm run test:performance
```

**Executar testes específicos:**
```sh
# Testes individuais
npm run test:performance:register
npm run test:performance:login
npm run test:performance:get-users
npm run test:performance:create-transfer
npm run test:performance:get-transfers

# Teste combinado
npm run test:performance:combined

# Teste rápido (1 minuto)
npm run test:performance:quick
```

**Executar diretamente com k6:**
```sh
# Tornar o script executável
chmod +x performance/run-performance-tests.sh

# Executar todos os testes
./performance/run-performance-tests.sh all

# Executar teste específico
./performance/run-performance-tests.sh register
./performance/run-performance-tests.sh combined
```

> **📎 Evidências:**  
> - [📄 Relatório de testes funcionais (functional_tests.pdf)](./docs/functional_tests.pdf)  
> - [📄 Relatório de performance (k6_report.pdf)](./docs/k6_report.pdf)

---

## 🗂️ Estrutura do Projeto

```text
.
├── app.js
├── server.js
├── graphql/
│   ├── app.js
│   ├── server.js
│   ├── typeDefs.js
│   ├── resolvers.js
│   └── authenticate.js
├── docs/                    
│   ├── functional_tests.pdf          
│   └── k6_report.pdf    
├── controller/              
├── model/                   
├── service/                 
├── middleware/              
├── performance/
│   ├── k6-performance-test.js
│   ├── test-user-register.js
│   ├── test-user-login.js
│   ├── test-get-users.js
│   ├── test-create-transfer.js
│   ├── test-get-transfers.js
│   └── run-performance-tests.sh
├── test/
│   ├── rest/
│   │   ├── controller/      
│   │   ├── external/        
│   │   └── fixture/         
│   └── graphql/
│       ├── controller/
│       ├── external/
│       └── fixture/
└── ...
```

- **controller/** → Lógica dos endpoints REST  
- **service/** → Regras de negócio  
- **graphql/** → API GraphQL com Apollo Server
- **performance/** → Testes de performance com k6
- **test/** → Testes automatizados (REST e GraphQL)  

---

## 📋 Regras de Negócio

- Não é permitido registrar usuários duplicados;  
- Login exige **usuário e senha**;  
- Transferências acima de **R$ 5.000,00** só podem ser feitas para favorecidos;  
- O saldo inicial de cada usuário é de **R$ 10.000,00**.

---

## 🚀 Testes de Performance

### 📋 Pré-requisitos

1. **k6 instalado**: Instale o k6 seguindo as instruções em [https://k6.io/docs/getting-started/installation/](https://k6.io/docs/getting-started/installation/)

2. **Servidor rodando**: Certifique-se de que a API REST está rodando na porta 3000:
   ```bash
   npm run start-rest
   ```

### 🎯 Cenários de Teste

| Endpoint | Cenário | Duração | Threshold |
|----------|---------|---------|-----------|
| `POST /users/register` | 5-10 usuários simultâneos | ~6 minutos | 95% < 1.5s |
| `POST /users/login` | 10-20 usuários simultâneos | ~6 minutos | 95% < 1s |
| `GET /users` | 15-30 usuários simultâneos | ~6 minutos | 95% < 500ms |
| `POST /transfers` | 5-10 usuários simultâneos | ~6 minutos | 95% < 2s |
| `GET /transfers` | 10-20 usuários simultâneos | ~6 minutos | 95% < 1s |

### 📊 Métricas Coletadas

- **http_req_duration**: Tempo de resposta das requisições
- **http_req_failed**: Taxa de falhas
- **Métricas customizadas**: Taxa de sucesso específica para cada endpoint

### 🔧 Configuração Avançada

Para ajustar os cenários de teste, edite a seção `options` em cada arquivo de performance:

```javascript
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up
    { duration: '2m', target: 10 },  // Sustentação
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // Ajustar limite de tempo
    http_req_failed: ['rate<0.05'],    // Ajustar taxa de erro
  },
};
```

### 🐛 Troubleshooting

**Problemas Comuns:**
1. **Servidor não responde**: Verificar se `npm run start-rest` está rodando
2. **Falhas de autenticação**: Verificar se os usuários de teste existem
3. **Timeout nas requisições**: Aumentar o timeout no k6 ou verificar performance do servidor

---

## 📊 Resultados dos Testes

### 🧪 Testes Funcionais
**22 testes executados com 100% de sucesso**

- **REST External**: 8 testes (usuários e transferências)
- **REST Controller**: 5 testes (transferências com mocks)
- **GraphQL External**: 4 testes (transferências)
- **GraphQL Controller**: 5 testes (usuários e transferências)

### ⚡ Testes de Performance
**6 cenários de carga testados com k6**

- **POST /users/register**: 5-10 usuários simultâneos
- **POST /users/login**: 10-20 usuários simultâneos
- **GET /users**: 15-30 usuários simultâneos
- **POST /transfers**: 5-10 usuários simultâneos
- **GET /transfers**: 10-20 usuários simultâneos
- **Teste combinado**: Todos os endpoints em sequência

---

## 📑 Relatórios e Evidências

| Tipo de Teste | Descrição | Arquivo |
|----------------|------------|----------|
| 🧩 **Funcionais (SuperTest/Mocha)** | Casos de teste REST automatizados, cobrindo autenticação, listagem e transferências | [Abrir relatório funcional (PDF)](./docs/functional_tests.pdf) |
| ⚙️ **Performance (k6)** | Carga simulada com 50 VUs e picos de 100, medindo tempo médio de resposta e throughput | [Abrir relatório de performance (PDF)](./docs/k6_report.pdf) |

---

## 📈 Métricas de Cobertura e Performance

### 🧪 Testes Funcionais

| Métrica | Resultado | Ferramenta |
|----------|------------|-------------|
| ✅ **Cobertura de endpoints REST** | 100% (6 de 6 endpoints) | SuperTest + Mocha |
| ✅ **Cobertura de endpoints GraphQL** | 100% (queries e mutations) | SuperTest + Mocha |
| 🧪 **Casos de teste executados** | 22 casos / 22 aprovados | Mocha |
| ⏱️ **Tempo total de execução (funcionais)** | ~0.58s | Mocha |
| 📊 **Relatórios gerados** | Mochawesome HTML/JSON | Mochawesome |

### ⚡ Testes de Performance

| Métrica | Resultado | Ferramenta |
|----------|------------|-------------|
| ⚡ **Tempo médio de resposta (k6)** | 230ms | k6 |
| 📉 **Erro máximo sob carga (20 VUs)** | 0.00% | k6 |
| 📊 **Throughput máximo atingido** | 142 req/s | k6 |
| 🎯 **Thresholds atendidos** | 95% das requisições < 2s | k6 |
| 🔄 **Cenários de carga testados** | 6 cenários (5 individuais + 1 combinado) | k6 |

### 🚀 APIs Disponíveis

| API | Porta | Endpoint | Status |
|-----|-------|----------|--------|
| **REST** | 3000 | http://localhost:3000 | ✅ Ativo |
| **GraphQL** | 4000 | http://localhost:4000/graphql | ✅ Ativo |
| **Swagger** | 3000 | http://localhost:3000/api-docs | ✅ Ativo |

> *Os resultados acima são baseados na execução local dos testes sob ambiente Node 18.17.0.*

---

## 🪪 Créditos e Licença

<p align="center">
  <b>👥 Grupo 8:</b><br>
  <a href="https://github.com/brunockutzke">Bruno Kutzke</a> · 
  <a href="https://github.com/caiobberiba">Caio Bêribá</a> · 
  <a href="https://github.com/dennyscaetano">Dennys Matos</a> · 
  <a href="https://github.com/jorgemobil">Jorge Antonio</a> · 
  <a href="https://github.com/simonegabionetta">Simone Gabionetta</a><br>
  <i>Desafio #3 – Mentoria 2.0 em Testes de Software</i><br><br>
  Licença: mesma do projeto original de <a href="https://github.com/juliodelimas/pgats-02-api">Júlio de Lima</a>.
</p>

---

<p align="center">
  <b>⭐ Desenvolvido com foco em qualidade, automação e performance.</b><br>
  <a href="https://github.com/caiobberiba/transfer-users-api-testing">github.com/caiobberiba/transfer-users-api-testing</a>
</p>
