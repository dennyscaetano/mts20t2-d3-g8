
// Bibliotecas
const request = require('supertest');
const { expect, use } = require('chai');

const chaiExclude = require('chai-exclude');
use(chaiExclude)

require('dotenv').config();

// Testes para external do enpoint de transferências
describe('Transfer', () => {
    describe('POST /transfers', () => {
        before(async () => {
            const postLogin = require('../fixture/requisicoes/login/postLogin.json');
            const respostaLogin = await request(process.env.BASE_URL_REST)
                .post('/users/login')
                .send(postLogin);

            token = respostaLogin.body.token;
        });

        it('Quando informo valores válidos eu tenho sucesso (201 CREATED)', async () => {
            const postTransfer = require('../fixture/requisicoes/transferencias/postTransfer.json');
            const resposta = await request(process.env.BASE_URL_REST)
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send(postTransfer);

            expect(resposta.status).to.equal(201);
            
            // Validação com um Fixture
            const respostaEsperada = require('../fixture/respostas/quandoInformoValoresValidosEuTenhoSucessoCom201Created.json')
            expect(resposta.body)
                .excluding('date')
                .to.deep.equal(respostaEsperada);
        });

        it('Quando tento transferir sem token, recebo erro (401 UNAUTHORIZED)', async () => {
            const postTransfer = require('../fixture/requisicoes/transferencias/postTransfer.json');
            const resposta = await request(process.env.BASE_URL_REST)
                .post('/transfers')
                .send(postTransfer);

            expect(resposta.status).to.equal(401);
            expect(resposta.body).to.have.property('message', 'Token não fornecido.');
        });

    const testesDeErrosDeNegocio = require('../fixture/requisicoes/transferencias/postTransferWithErrors.json');
        testesDeErrosDeNegocio.forEach(teste => {
            it(`Testando a regra relacionada a ${teste.nomeDoTeste}`, async () => {
                const postTransfer = require('../fixture/requisicoes/transferencias/postTransfer.json');
                const resposta = await request(process.env.BASE_URL_REST)
                    .post('/transfers')
                    .set('Authorization', `Bearer ${token}`)
                    .send(teste.postTransfer);

                expect(resposta.status).to.equal(teste.statusCode);
                expect(resposta.body).to.have.property('error', teste.mensagemEsperada)
            });
        });
    });

    describe('GET /transfers', () => {
        it('Quando consulto a lista de transferências autenticado, recebo um array', async () => {
            const postLogin = require('../fixture/requisicoes/login/postLogin.json');
            const respostaLogin = await request(process.env.BASE_URL_REST)
                .post('/users/login')
                .send(postLogin);
            const token = respostaLogin.body.token;
            const resposta = await request(process.env.BASE_URL_REST)
                .get('/transfers')
                .set('Authorization', `Bearer ${token}`);

            expect(resposta.status).to.equal(200);
            expect(resposta.body).to.be.an('array');
        });

        it('Quando consulto a lista de transferências sem token, recebo erro (401 UNAUTHORIZED)', async () => {
            const resposta = await request(process.env.BASE_URL_REST)
                .get('/transfers');

            expect(resposta.status).to.equal(401);
            expect(resposta.body).to.have.property('message', 'Token não fornecido.');
        });
    });
});