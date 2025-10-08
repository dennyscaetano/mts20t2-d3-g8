// Bibliotecas
const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');

// Aplicação
const app = require('../../../app');

// Mock
const transferService = require('../../../service/transferService');

// Testes para o controller do endpoint de transferências
describe('Rest Controller - Transfer ', () => {
    describe('POST /transfers', () => {

        beforeEach(async () => {
            const respostaLogin = await request(app)
                .post('/users/login')
                .send({
                    username: 'julio',
                    password: '123456'
                });

            token = respostaLogin.body.token;
        });

        it('Quando informo remetente e destinatario inexistentes recebo (400 BAD REQUEST)', async () => {
            const resposta = await request(app)
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    from: "julio",
                    to: "isabelle",
                    value: 100
                });
            
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado')
        });

        it('Usando Mocks: Quando informo remetente e destinatario inexistentes recebo (400 BAD REQUEST)', async () => {
            
            // Mocar apenas a função transfer do Service
            const transferServiceMock = sinon.stub(transferService, 'transfer');
            transferServiceMock.throws(new Error('Usuário remetente ou destinatário não encontrado'));

            const resposta = await request(app)
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    from: "julio",
                    to: "priscila",
                    value: 100
                });
            
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado');
        });

        it('Usando Mocks: Quando informo valores válidos eu tenho sucesso  (201 CREATED)', async () => {
            
            // Mocar apenas a função transfer do Service
            const transferServiceMock = sinon.stub(transferService, 'transfer');
            transferServiceMock.returns({ 
                from: "julio", 
                to: "priscila", 
                value: 100, 
                date: new Date().toISOString() 
            });

            const resposta = await request(app)
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    from: "julio",
                    to: "priscilaaaaaaaaaaa",
                    value: 100
                });
            
            expect(resposta.status).to.equal(201);
            
            // Validação com um Fixture
            const respostaEsperada = require('../fixture/respostas/quandoInformoValoresValidosEuTenhoSucessoCom201Created.json')
            delete resposta.body.date;
            delete respostaEsperada.date; 
            expect(resposta.body).to.deep.equal(respostaEsperada);

            // Um expect para comparar a Resposta.body com a String contida no arquivo
            // expect(resposta.body).to.have.property('from', 'julio');
            // expect(resposta.body).to.have.property('to', 'priscila');
            // expect(resposta.body).to.have.property('value', 100);
        });

        afterEach(() => {
            
            // Reseto o Mock
            sinon.restore();
        })
    });

    describe('GET /transfers', () => {
        it('Quando consulto a lista de transferências autenticado, recebo um array', async () => {
            
            // Realiza login para obter token
            const respostaLogin = await request(app)
                .post('/users/login')
                .send({ username: 'julio', password: '123456' });

            const token = respostaLogin.body.token;

            const resposta = await request(app)
                .get('/transfers')
                .set('Authorization', `Bearer ${token}`);

            expect(resposta.status).to.equal(200);
            expect(resposta.body).to.be.an('array');
        });

        it('Quando consulto a lista de transferências sem token, recebo erro (401 UNAUTHORIZED)', async () => {
            const resposta = await request(app)
                .get('/transfers');

            expect(resposta.status).to.equal(401);
            expect(resposta.body).to.have.property('message', 'Token não fornecido.');
        });
    });
});