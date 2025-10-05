import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Configurações específicas para teste de login de usuários
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
    http_req_failed: ['rate<0.05'],     // Taxa de erro deve ser menor que 5%
  },
};

// URL base da API
const BASE_URL = 'http://localhost:3000';

// Métricas customizadas
const errorRate = new Rate('errors');
const loginRate = new Rate('successful_logins');

// Usuários de teste para login (assumindo que já existem)
const testUsers = [
  { username: 'julio', password: '123456' },
  { username: 'priscila', password: '123456' },
];

export function setup() {
  // Setup inicial - garantir que pelo menos um usuário existe
  console.log('Verificando usuários para teste de login...');
  
  // Tentar fazer login com usuário padrão
  const loginResponse = http.post(`${BASE_URL}/users/login`, JSON.stringify({
    username: 'julio',
    password: '123456'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginResponse.status === 200) {
    console.log('Usuário padrão encontrado para teste de login');
    return { userExists: true };
  } else {
    // Criar usuário padrão se não existir
    const registerResponse = http.post(`${BASE_URL}/users/register`, JSON.stringify({
      username: 'julio',
      password: '123456',
      favorecidos: []
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (registerResponse.status === 201) {
      console.log('Usuário padrão criado para teste de login');
      return { userExists: true };
    } else {
      console.log('Erro ao criar usuário padrão');
      return { userExists: false };
    }
  }
}

export default function(data) {
  if (!data.userExists) {
    console.log('Pulando teste de login - usuário não disponível');
    return;
  }

  // Teste de login de usuário
  testUserLogin();
  
  sleep(1); // Pausa entre iterações
}

function testUserLogin() {
  const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  const payload = JSON.stringify({
    username: randomUser.username,
    password: randomUser.password
  });

  const response = http.post(`${BASE_URL}/users/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const success = check(response, {
    'POST /users/login - status is 200': (r) => r.status === 200,
    'POST /users/login - response time < 1000ms': (r) => r.timings.duration < 1000,
    'POST /users/login - has token': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.token !== undefined && data.token.length > 0;
      } catch (e) {
        return false;
      }
    },
    'POST /users/login - has user data': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.user !== undefined && data.user.username !== undefined && data.user.saldo !== undefined;
      } catch (e) {
        return false;
      }
    },
    'POST /users/login - token is valid JWT format': (r) => {
      try {
        const data = JSON.parse(r.body);
        const token = data.token;
        return token.split('.').length === 3; // JWT tem 3 partes separadas por ponto
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!success);
  loginRate.add(success);
  
  // Log de informações para debug
  if (!success) {
    console.log(`Falha no login: Status ${response.status}, Body: ${response.body}`);
  }
}
