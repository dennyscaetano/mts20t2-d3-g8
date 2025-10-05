# Testes de Performance com k6

Este diretório contém testes de performance para todos os endpoints da API usando k6.

## Pré-requisitos

1. **k6 instalado**: Instale o k6 seguindo as instruções em [https://k6.io/docs/getting-started/installation/](https://k6.io/docs/getting-started/installation/)

2. **Servidor rodando**: Certifique-se de que a API está rodando na porta 3000:
   ```bash
   npm run start-rest
   ```

## Arquivos de Teste

### Testes Individuais por Endpoint

- **`test-user-register.js`** - Teste de performance para `POST /users/register`
  - Cenário: 5-10 usuários simultâneos
  - Duração: ~6 minutos
  - Threshold: 95% das requisições < 1.5s

- **`test-user-login.js`** - Teste de performance para `POST /users/login`
  - Cenário: 10-20 usuários simultâneos
  - Duração: ~6 minutos
  - Threshold: 95% das requisições < 1s

- **`test-get-users.js`** - Teste de performance para `GET /users`
  - Cenário: 15-30 usuários simultâneos
  - Duração: ~6 minutos
  - Threshold: 95% das requisições < 500ms

- **`test-create-transfer.js`** - Teste de performance para `POST /transfers`
  - Cenário: 5-10 usuários simultâneos
  - Duração: ~6 minutos
  - Threshold: 95% das requisições < 2s
  - Requer autenticação

- **`test-get-transfers.js`** - Teste de performance para `GET /transfers`
  - Cenário: 10-20 usuários simultâneos
  - Duração: ~6 minutos
  - Threshold: 95% das requisições < 1s
  - Requer autenticação

### Teste Combinado

- **`k6-performance-test.js`** - Teste combinado de todos os endpoints
  - Executa todos os endpoints em sequência
  - Cenário: 10-20 usuários simultâneos
  - Duração: ~6 minutos

## Como Executar

### Usando o Script de Execução

```bash
# Tornar o script executável
chmod +x performance/run-performance-tests.sh

# Executar todos os testes
./performance/run-performance-tests.sh all

# Executar teste específico
./performance/run-performance-tests.sh register
./performance/run-performance-tests.sh login
./performance/run-performance-tests.sh get-users
./performance/run-performance-tests.sh create-transfer
./performance/run-performance-tests.sh get-transfers

# Executar teste combinado
./performance/run-performance-tests.sh combined
```

### Executando Diretamente com k6

```bash
# Teste individual
k6 run performance/test-user-register.js

# Teste combinado
k6 run performance/k6-performance-test.js
```

## Métricas Coletadas

Cada teste coleta as seguintes métricas:

- **http_req_duration**: Tempo de resposta das requisições
- **http_req_failed**: Taxa de falhas
- **Métricas customizadas**: Taxa de sucesso específica para cada endpoint

## Thresholds (Limites)

Os testes são configurados com thresholds que devem ser atendidos:

- **Taxa de erro**: < 1-10% (dependendo do endpoint)
- **Tempo de resposta**: 95% das requisições abaixo do limite específico
- **Disponibilidade**: Endpoints devem estar funcionando corretamente

## Interpretação dos Resultados

### Exemplo de Saída Bem-sucedida:
```
✓ POST /users/register - status is 201
✓ POST /users/register - response time < 1500ms
✓ POST /users/register - has user data

checks.........................: 100.00% ✓ 1500      ✗ 0
data_received..................: 2.1 MB  35 kB/s
data_sent......................: 1.2 MB  20 kB/s
http_req_duration..............: avg=245ms min=89ms med=198ms max=1.2s p(95)=456ms
http_req_failed................: 0.00%   ✓ 0         ✗ 1500
```

### Sinais de Problemas:
- **Taxa de erro alta**: Verificar logs do servidor
- **Tempo de resposta alto**: Possível gargalo na aplicação
- **Falhas de autenticação**: Verificar middleware de autenticação

## Configuração Avançada

### Modificando Cenários de Carga

Para ajustar os cenários de teste, edite a seção `options` em cada arquivo:

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

### Executando com Diferentes Configurações

```bash
# Teste rápido (1 minuto)
k6 run --duration 1m --vus 5 performance/test-user-register.js

# Teste de pico (muitos usuários)
k6 run --duration 2m --vus 50 performance/test-get-users.js
```

## Troubleshooting

### Problemas Comuns

1. **Servidor não responde**:
   - Verificar se `npm run start-rest` está rodando
   - Verificar se a porta 3000 está livre

2. **Falhas de autenticação**:
   - Verificar se os usuários de teste existem
   - Verificar configuração do JWT_SECRET

3. **Timeout nas requisições**:
   - Aumentar o timeout no k6
   - Verificar performance do servidor

### Logs Detalhados

Para obter logs mais detalhados:

```bash
k6 run --log-level debug performance/test-user-register.js
```

## Integração com CI/CD

Para integrar com pipelines de CI/CD, adicione ao `package.json`:

```json
{
  "scripts": {
    "test:performance": "./performance/run-performance-tests.sh all",
    "test:performance:quick": "k6 run --duration 1m --vus 5 performance/k6-performance-test.js"
  }
}
```
