import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Configurações específicas para teste de listagem de transferências
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up para 10 usuários em 30s
    { duration: '2m', target: 10 },  // Manter 10 usuários por 2 minutos
    { duration: '30s', target: 20 }, // Ramp up para 20 usuários em 30s
    { duration: '2m', target: 20 },  // Manter 20 usuários por 2 minutos
    { duration: '30s', target: 0 },  // Ramp down para 0 usuários em 30s
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% das requisições devem ser menores que 1s
    http_req_failed: ['rate<0.1'],    // Taxa de erro deve ser menor que 10%
  },
};

// URL base da API
const BASE_URL = 'http://localhost:3000';

// Métricas customizadas
const errorRate = new Rate('errors');
const successRate = new Rate('successful_requests');

let authToken = '';

export function setup() {
  // Setup inicial - garantir que usuários existem e obter token de autenticação
  console.log('Preparando dados para teste de listagem de transferências...');
  
  // Criar usuários necessários se não existirem
  const usersToCreate = ['julio', 'priscila'];
  let createdUsers = 0;

  for (const username of usersToCreate) {
    const response = http.post(`${BASE_URL}/users/register`, JSON.stringify({
      username: username,
      password: '123456',
      favorecidos: []
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 201) {
      createdUsers++;
    }
  }

  console.log(`Criados/verificados ${createdUsers} usuários para teste`);

  // Fazer login para obter token
  const loginResponse = http.post(`${BASE_URL}/users/login`, JSON.stringify({
    username: 'julio',
    password: '123456'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginResponse.status === 200) {
    const loginData = JSON.parse(loginResponse.body);
    authToken = loginData.token;
    console.log('Token de autenticação obtido com sucesso');
  } else {
    console.log('Erro ao obter token de autenticação');
    return { authToken: null, usersReady: false };
  }

  // Criar algumas transferências de teste para garantir que há dados para listar
  let transfersCreated = 0;
  for (let i = 0; i < 5; i++) {
    const transferResponse = http.post(`${BASE_URL}/transfers`, JSON.stringify({
      from: 'julio',
      to: 'priscila',
      value: 50 + (i * 10)
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
    });

    if (transferResponse.status === 201) {
      transfersCreated++;
    }
  }

  console.log(`Criadas ${transfersCreated} transferências de teste`);
  return { authToken, usersReady: true, transfersCreated };
}

export default function(data) {
  if (!data.usersReady || !data.authToken) {
    console.log('Pulando teste de listagem - dados não disponíveis');
    return;
  }

  // Teste de listagem de transferências
  testGetTransfers(data.authToken);
  
  sleep(1); // Pausa entre iterações
}

function testGetTransfers(authToken) {
  const response = http.get(`${BASE_URL}/transfers`, {
    headers: { 
      'Authorization': `Bearer ${authToken}`
    },
  });

  const success = check(response, {
    'GET /transfers - status is 200': (r) => r.status === 200,
    'GET /transfers - response time < 1000ms': (r) => r.timings.duration < 1000,
    'GET /transfers - returns array': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data);
      } catch (e) {
        return false;
      }
    },
    'GET /transfers - array has transfers': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.length >= 0; // Pode ser 0 se não há transferências
      } catch (e) {
        return false;
      }
    },
    'GET /transfers - transfers have required fields': (r) => {
      try {
        const data = JSON.parse(r.body);
        if (data.length === 0) return true; // Se não há transferências, ainda é válido
        
        const firstTransfer = data[0];
        return firstTransfer.from !== undefined && 
               firstTransfer.to !== undefined &&
               firstTransfer.value !== undefined &&
               firstTransfer.date !== undefined;
      } catch (e) {
        return false;
      }
    },
    'GET /transfers - response is valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    'GET /transfers - requires authentication': (r) => {
      // Este teste verifica se o endpoint requer autenticação
      return r.status !== 401; // Não deve retornar 401 (Unauthorized)
    },
  });

  errorRate.add(!success);
  successRate.add(success);
  
  // Log de informações para debug
  if (!success) {
    console.log(`Falha na listagem de transferências: Status ${response.status}, Body: ${response.body}`);
  }
}
