
// Bibliotecas
const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config();

// Testes para external do endpoint de usuários
describe('Rest External - User', () => {
    
    // Testes de registro de usuário
    describe('POST /users/register', () => {
        it('Quando informo dados válidos, registro o usuário com sucesso (201 CREATED)', async () => {
            const novoUsuario = {
                username: `usuario_teste_${Date.now()}`,
                password: 'senha123',
                favorecidos: ['julio']
            };

            const resposta = await request(process.env.BASE_URL_REST)
                .post('/users/register')
                .send(novoUsuario);

            expect(resposta.status).to.equal(201);
            expect(resposta.body).to.have.property('username', novoUsuario.username);
        });

        it('Quando tento registrar um usuário já existente, recebo erro (400 BAD REQUEST)', async () => {
            const usuarioExistente = {
                username: 'julio',
                password: 'senha123',
                favorecidos: ['priscila']
            };

            const resposta = await request(process.env.BASE_URL_REST)
                .post('/users/register')
                .send(usuarioExistente);

            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error');
        });
    });

    // Testes de login de usuário
    describe('POST /users/login', () => {
        it('Quando informo credenciais válidas, faço login com sucesso (200 OK)', async () => {
            const resposta = await request(process.env.BASE_URL_REST)
                .post('/users/login')
                .send({ username: 'julio', password: '123456' });

            expect(resposta.status).to.equal(200);
            expect(resposta.body).to.have.property('token');
        });

        it('Quando informo senha inválida, recebo erro (400 BAD REQUEST)', async () => {
            const resposta = await request(process.env.BASE_URL_REST)
                .post('/users/login')
                .send({ username: 'julio', password: 'senha_errada' });

            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error');
        });

        it('Quando informo usuário inexistente, recebo erro (400 BAD REQUEST)', async () => {
            const resposta = await request(process.env.BASE_URL_REST)
                .post('/users/login')
                .send({ username: 'usuario_inexistente', password: 'qualquer_senha' });

            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error');
        });
    });

    // Teste de listagem de usuários
    describe('GET /users', () => {
        it('Quando consulto a lista de usuários, recebo um array com usuários', async () => {
            const resposta = await request(process.env.BASE_URL_REST)
                .get('/users');

            expect(resposta.status).to.equal(200);
            expect(resposta.body).to.be.an('array');
        });
    });

    // Testes VADER
    describe('POST /users/login - Validação VADER', () => {

        it('Tipagem e tamanho do payload de login', async () => {
            const postLogin = require('../fixture/requisicoes/login/postLogin.json');

            const resposta = await request(process.env.BASE_URL_REST)
                .post('/users/login')
                .send(postLogin);

            // Valida status
            expect(resposta.status).to.equal(200);

            // Valida Content-Type
            expect(resposta.headers['content-type']).to.include('application/json');
            

            // Valida tamanho do payload
            const tamanhoPayload = JSON.stringify(resposta.body).length;            
            expect(tamanhoPayload).to.be.below(2000);

            // Valida presença do token
            expect(resposta.body).to.have.property('token');
        });

    });

    describe('GET /users/login - Validação VADER', () => {

        it('Tipagem e tamanho do payload da resposta', async () => {
            
            const resposta = await request(process.env.BASE_URL_REST)
                .get('/users')
              

             // Valida status
            expect(resposta.status).to.equal(200);

            // Valida Content-Type
            expect(resposta.headers['content-type']).to.include('application/json');
            

            // Valida tamanho do payload
            const tamanhoPayload = JSON.stringify(resposta.body).length;            
            expect(tamanhoPayload).to.be.below(2000);

            // Valida campos da resposta, ex: token ou username
            if(resposta.body.token){                
                expect(resposta.body.token).to.be.a('string');
            }
            if(resposta.body.username){
                expect(resposta.body.username).to.be.a('string');
            }
        });

    });
});

