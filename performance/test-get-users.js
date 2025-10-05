import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Configurações específicas para teste de listagem de usuários
export const options = {
  stages: [
    { duration: '30s', target: 15 }, // Ramp up para 15 usuários em 30s
    { duration: '2m', target: 15 },  // Manter 15 usuários por 2 minutos
    { duration: '30s', target: 30 }, // Ramp up para 30 usuários em 30s
    { duration: '2m', target: 30 },  // Manter 30 usuários por 2 minutos
    { duration: '30s', target: 0 },  // Ramp down para 0 usuários em 30s
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% das requisições devem ser menores que 500ms
    http_req_failed: ['rate<0.01'],    // Taxa de erro deve ser menor que 1%
  },
};

// URL base da API
const BASE_URL = 'http://localhost:3000';

// Métricas customizadas
const errorRate = new Rate('errors');
const successRate = new Rate('successful_requests');

export function setup() {
  // Setup inicial - garantir que existem usuários para listar
  console.log('Preparando dados para teste de listagem de usuários...');
  
  // Criar alguns usuários de teste se necessário
  const testUsers = [
    { username: 'test_user1', password: '123456' },
    { username: 'test_user2', password: '123456' },
    { username: 'test_user3', password: '123456' },
  ];

  let createdUsers = 0;
  for (const user of testUsers) {
    const response = http.post(`${BASE_URL}/users/register`, JSON.stringify({
      username: `${user.username}_${Date.now()}`,
      password: user.password,
      favorecidos: []
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 201) {
      createdUsers++;
    }
  }

  console.log(`Criados ${createdUsers} usuários de teste`);
  return { usersCreated: createdUsers };
}

export default function(data) {
  // Teste de listagem de usuários
  testGetUsers();
  
  sleep(0.5); // Pausa menor entre iterações (GET é mais rápido)
}

function testGetUsers() {
  const response = http.get(`${BASE_URL}/users`);

  const success = check(response, {
    'GET /users - status is 200': (r) => r.status === 200,
    'GET /users - response time < 500ms': (r) => r.timings.duration < 500,
    'GET /users - returns array': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data);
      } catch (e) {
        return false;
      }
    },
    'GET /users - array has users': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.length > 0;
      } catch (e) {
        return false;
      }
    },
    'GET /users - users have required fields': (r) => {
      try {
        const data = JSON.parse(r.body);
        if (data.length === 0) return true; // Se não há usuários, ainda é válido
        
        const firstUser = data[0];
        return firstUser.username !== undefined && 
               firstUser.saldo !== undefined &&
               Array.isArray(firstUser.favorecidos);
      } catch (e) {
        return false;
      }
    },
    'GET /users - response is valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!success);
  successRate.add(success);
  
  // Log de informações para debug
  if (!success) {
    console.log(`Falha na listagem: Status ${response.status}, Body: ${response.body}`);
  }
}
