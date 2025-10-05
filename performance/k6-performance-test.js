import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Configurações do teste
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up para 10 usuários em 30s
    { duration: '1m', target: 10 },  // Manter 10 usuários por 1 minuto
    { duration: '30s', target: 20 }, // Ramp up para 20 usuários em 30s
    { duration: '1m', target: 20 },  // Manter 20 usuários por 1 minuto
    { duration: '30s', target: 0 },  // Ramp down para 0 usuários em 30s
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% das requisições devem ser menores que 2s
    http_req_failed: ['rate<0.1'],     // Taxa de erro deve ser menor que 10%
  },
};

// URL base da API
const BASE_URL = 'http://localhost:3000';

// Métricas customizadas
const errorRate = new Rate('errors');

// Dados de teste
const testUsers = [
  { username: 'user1', password: '123456' },
  { username: 'user2', password: '123456' },
  { username: 'user3', password: '123456' },
  { username: 'user4', password: '123456' },
  { username: 'user5', password: '123456' },
];

let authToken = '';

export function setup() {
  // Setup inicial - criar usuários de teste se necessário
  console.log('Iniciando setup dos testes de performance...');
  
  // Tentar fazer login com um usuário existente ou criar um novo
  const loginResponse = http.post(`${BASE_URL}/users/login`, JSON.stringify({
    username: 'julio',
    password: '123456'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginResponse.status === 200) {
    const loginData = JSON.parse(loginResponse.body);
    authToken = loginData.token;
    console.log('Login realizado com sucesso');
  } else {
    // Se não conseguir fazer login, criar um usuário
    const registerResponse = http.post(`${BASE_URL}/users/register`, JSON.stringify({
      username: 'julio',
      password: '123456',
      favorecidos: []
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (registerResponse.status === 201) {
      // Fazer login com o usuário criado
      const loginResponse = http.post(`${BASE_URL}/users/login`, JSON.stringify({
        username: 'julio',
        password: '123456'
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (loginResponse.status === 200) {
        const loginData = JSON.parse(loginResponse.body);
        authToken = loginData.token;
        console.log('Usuário criado e login realizado com sucesso');
      }
    }
  }

  return { authToken };
}

export default function(data) {
  const { authToken } = data;
  
  // Teste 1: POST /users/register
  testUserRegister();
  
  // Teste 2: POST /users/login
  testUserLogin();
  
  // Teste 3: GET /users
  testGetUsers();
  
  // Teste 4: POST /transfers (requer autenticação)
  if (authToken) {
    testCreateTransfer(authToken);
  }
  
  // Teste 5: GET /transfers (requer autenticação)
  if (authToken) {
    testGetTransfers(authToken);
  }
  
  sleep(1); // Pausa entre iterações
}

function testUserRegister() {
  const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)];
  const payload = JSON.stringify({
    username: `${randomUser.username}_${Date.now()}`,
    password: randomUser.password,
    favorecidos: []
  });

  const response = http.post(`${BASE_URL}/users/register`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const success = check(response, {
    'POST /users/register - status is 201': (r) => r.status === 201,
    'POST /users/register - response time < 2000ms': (r) => r.timings.duration < 2000,
    'POST /users/register - has user data': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.username !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!success);
}

function testUserLogin() {
  const payload = JSON.stringify({
    username: 'julio',
    password: '123456'
  });

  const response = http.post(`${BASE_URL}/users/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const success = check(response, {
    'POST /users/login - status is 200': (r) => r.status === 200,
    'POST /users/login - response time < 2000ms': (r) => r.timings.duration < 2000,
    'POST /users/login - has token': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.token !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!success);
}

function testGetUsers() {
  const response = http.get(`${BASE_URL}/users`);

  const success = check(response, {
    'GET /users - status is 200': (r) => r.status === 200,
    'GET /users - response time < 2000ms': (r) => r.timings.duration < 2000,
    'GET /users - returns array': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data);
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!success);
}

function testCreateTransfer(authToken) {
  const payload = JSON.stringify({
    from: 'julio',
    to: 'priscila',
    value: Math.floor(Math.random() * 100) + 1 // Valor aleatório entre 1 e 100
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
        return data.from !== undefined && data.to !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!success);
}

function testGetTransfers(authToken) {
  const response = http.get(`${BASE_URL}/transfers`, {
    headers: { 
      'Authorization': `Bearer ${authToken}`
    },
  });

  const success = check(response, {
    'GET /transfers - status is 200': (r) => r.status === 200,
    'GET /transfers - response time < 2000ms': (r) => r.timings.duration < 2000,
    'GET /transfers - returns array': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data);
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!success);
}

export function teardown(data) {
  console.log('Finalizando testes de performance...');
}
