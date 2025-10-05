import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Configurações específicas para teste de criação de transferências
export const options = {
  stages: [
    { duration: '30s', target: 5 },  // Ramp up para 5 usuários em 30s
    { duration: '2m', target: 5 },   // Manter 5 usuários por 2 minutos
    { duration: '30s', target: 10 }, // Ramp up para 10 usuários em 30s
    { duration: '2m', target: 10 },  // Manter 10 usuários por 2 minutos
    { duration: '30s', target: 0 },  // Ramp down para 0 usuários em 30s
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% das requisições devem ser menores que 2s
    http_req_failed: ['rate<0.2'],     // Taxa de erro deve ser menor que 20%
  },
};

// URL base da API
const BASE_URL = 'http://localhost:3000';

// Métricas customizadas
const errorRate = new Rate('errors');
const transferRate = new Rate('successful_transfers');

// Usuários para transferências
const transferUsers = [
  { from: 'julio', to: 'priscila' },
  { from: 'priscila', to: 'julio' },
  { from: 'maria', to: 'joao' },
  { from: 'joao', to: 'maria' },
  { from: 'ana', to: 'julio' },
];

let authToken = '';

export function setup() {
  // Setup inicial - garantir que usuários existem e obter token de autenticação
  console.log('Preparando dados para teste de transferências...');
  
  // Criar usuários necessários se não existirem
  const usersToCreate = ['julio', 'priscila', 'maria', 'joao', 'ana'];
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

  console.log(`Criados/verificados ${createdUsers} usuários para transferências`);

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
    return { authToken, usersReady: true };
  } else {
    console.log('Erro ao obter token de autenticação');
    return { authToken: null, usersReady: false };
  }
}

export default function(data) {
  if (!data.usersReady || !data.authToken) {
    console.log('Pulando teste de transferência - dados não disponíveis');
    return;
  }

  // Teste de criação de transferência
  testCreateTransfer(data.authToken);
  
  sleep(2); // Pausa maior entre iterações (transferências são mais complexas)
}

function testCreateTransfer(authToken) {
  const randomTransfer = transferUsers[Math.floor(Math.random() * transferUsers.length)];
  const randomValue = Math.floor(Math.random() * 200) + 10; // Valor entre 10 e 210
  
  const payload = JSON.stringify({
    from: randomTransfer.from,
    to: randomTransfer.to,
    value: randomValue
  });

  const response = http.post(`${BASE_URL}/transfers`, payload, {
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
  });

  const success = check(response, {
    'POST /transfers - status is 201': (r) => r.status === 201,
    'POST /transfers - response time < 2000ms': (r) => r.timings.duration < 2000,
    'POST /transfers - has transfer data': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.from !== undefined && data.to !== undefined && data.value !== undefined;
      } catch (e) {
        return false;
      }
    },
    'POST /transfers - correct from user': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.from === randomTransfer.from;
      } catch (e) {
        return false;
      }
    },
    'POST /transfers - correct to user': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.to === randomTransfer.to;
      } catch (e) {
        return false;
      }
    },
    'POST /transfers - correct value': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.value === randomValue;
      } catch (e) {
        return false;
      }
    },
    'POST /transfers - has timestamp': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.date !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!success);
  transferRate.add(success);
  
  // Log de informações para debug
  if (!success) {
    console.log(`Falha na transferência: Status ${response.status}, Body: ${response.body}`);
    console.log(`Tentativa: ${randomTransfer.from} -> ${randomTransfer.to}, valor: ${randomValue}`);
  }
}
