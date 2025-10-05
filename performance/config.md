# Configurações de Teste de Performance

## Configurações de Ambiente

### URLs Base
- **Desenvolvimento**: http://localhost:3000
- **Produção**: https://sua-api-producao.com

### Configurações de Carga Padrão

#### Teste Leve (Desenvolvimento)
- Usuários simultâneos: 5-10
- Duração: 2-3 minutos
- Thresholds: Mais permissivos

#### Teste Médio (Staging)
- Usuários simultâneos: 10-20
- Duração: 5-6 minutos
- Thresholds: Moderados

#### Teste Pesado (Produção)
- Usuários simultâneos: 20-50
- Duração: 10-15 minutos
- Thresholds: Rigorosos

## Configurações por Endpoint

### POST /users/register
- **Threshold de tempo**: 1.5s (95%)
- **Taxa de erro**: < 5%
- **Usuários simultâneos**: 5-10
- **Observações**: Cria novos usuários, pode impactar performance

### POST /users/login
- **Threshold de tempo**: 1s (95%)
- **Taxa de erro**: < 5%
- **Usuários simultâneos**: 10-20
- **Observações**: Operação rápida, alta concorrência esperada

### GET /users
- **Threshold de tempo**: 500ms (95%)
- **Taxa de erro**: < 1%
- **Usuários simultâneos**: 15-30
- **Observações**: Operação de leitura, deve ser muito rápida

### POST /transfers
- **Threshold de tempo**: 2s (95%)
- **Taxa de erro**: < 10%
- **Usuários simultâneos**: 5-10
- **Observações**: Requer autenticação, operação complexa

### GET /transfers
- **Threshold de tempo**: 1s (95%)
- **Taxa de erro**: < 5%
- **Usuários simultâneos**: 10-20
- **Observações**: Requer autenticação, operação de leitura

## Variáveis de Ambiente

```bash
# Configurar antes de executar os testes
export API_BASE_URL=http://localhost:3000
export JWT_SECRET=secretdemo
export TEST_DURATION=2m
export TEST_VUS=10
```

## Comandos Úteis

### Execução Rápida
```bash
# Teste rápido de 1 minuto
npm run test:performance:quick

# Teste específico
npm run test:performance:login
```

### Execução com Parâmetros Customizados
```bash
# Teste com duração e usuários específicos
k6 run --duration 5m --vus 20 performance/test-user-login.js

# Teste com threshold customizado
k6 run --threshold http_req_duration=p(95)<500ms performance/test-get-users.js
```

### Execução com Relatórios
```bash
# Gerar relatório HTML
k6 run --out json=results.json performance/test-user-register.js
k6 run --out json=results.json performance/test-user-login.js
```

## Monitoramento Durante os Testes

### Métricas Importantes
- **http_req_duration**: Tempo de resposta
- **http_req_failed**: Taxa de falhas
- **vus**: Usuários virtuais ativos
- **iterations**: Iterações completadas

### Sinais de Alerta
- Taxa de erro > 10%
- Tempo de resposta p(95) > threshold
- Falhas de autenticação frequentes
- Timeouts constantes

## Troubleshooting

### Problemas Comuns

1. **"Connection refused"**
   - Verificar se o servidor está rodando
   - Verificar porta e URL

2. **"401 Unauthorized"**
   - Verificar token JWT
   - Verificar middleware de autenticação

3. **"500 Internal Server Error"**
   - Verificar logs do servidor
   - Verificar dados de entrada

4. **Performance degradada**
   - Verificar recursos do servidor
   - Verificar gargalos na aplicação
   - Considerar otimizações de banco de dados

### Logs Úteis
```bash
# Logs detalhados do k6
k6 run --log-level debug performance/test-user-register.js

# Logs do servidor Node.js
DEBUG=* npm run start-rest
```
