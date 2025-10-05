import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Configurações específicas para teste de registro de usuários
export const options = {
  stages: [
    { duration: '30s', target: 5 },  // Ramp up para 5 usuários em 30s
    { duration: '2m', target: 5 },   // Manter 5 usuários por 2 minutos
    { duration: '30s', target: 10 }, // Ramp up para 10 usuários em 30s
    { duration: '2m', target: 10 },   // Manter 10 usuários por 2 minutos
    { duration: '30s', target: 0 },  // Ramp down para 0 usuários em 30s
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'], // 95% das requisições devem ser menores que 1.5s
    http_req_failed: ['rate<0.05'],     // Taxa de erro deve ser menor que 5%
  },
};

// URL base da API
const BASE_URL = 'http://localhost:3000';

// Métricas customizadas
const errorRate = new Rate('errors');
const registrationRate = new Rate('successful_registrations');

// Dados de teste para registro
const testUsers = [
  { username: 'perf_user1', password: '123456' },
  { username: 'perf_user2', password: '123456' },
  { username: 'perf_user3', password: '123456' },
  { username: 'perf_user4', password: '123456' },
  { username: 'perf_user5', password: '123456' },
];

export default function() {
  // Teste de registro de usuário
  testUserRegister();
  
  sleep(1); // Pausa entre iterações
}

function testUserRegister() {
  const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)];
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  
  const payload = JSON.stringify({
    username: `${randomUser.username}_${timestamp}_${randomSuffix}`,
    password: randomUser.password,
    favorecidos: []
  });

  const response = http.post(`${BASE_URL}/users/register`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const success = check(response, {
    'POST /users/register - status is 201': (r) => r.status === 201,
    'POST /users/register - response time < 1500ms': (r) => r.timings.duration < 1500,
    'POST /users/register - has user data': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.username !== undefined && data.saldo !== undefined && Array.isArray(data.favorecidos);
      } catch (e) {
        return false;
      }
    },
    'POST /users/register - response has correct username': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.username.includes('perf_user');
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!success);
  registrationRate.add(success);
  
  // Log de informações para debug
  if (!success) {
    console.log(`Falha no registro: Status ${response.status}, Body: ${response.body}`);
  }
}
