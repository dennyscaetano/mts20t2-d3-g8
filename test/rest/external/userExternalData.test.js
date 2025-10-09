// Bibliotecas
const request = require('supertest');
const { expect, use } = require('chai');
const chaiExclude = require('chai-exclude');
use(chaiExclude);
require('dotenv').config();

// Testes para login e validação VADER
describe('Rest External - User Login VADER', () => {

    let token;

    // Login antes de todos os testes
    before(async () => {
        const postLogin = require('../fixture/requisicoes/login/postLogin.json'); // seu fixture de login
        const respostaLogin = await request(process.env.BASE_URL_REST)
            .post('/users/login')
            .send(postLogin);

        token = respostaLogin.body.token;

        // Valida que o token existe
        expect(token).to.be.a('string');
        
    });

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
            console.log('Content-Type recebido:', resposta.headers['content-type']);

            // Valida tamanho do payload
            const tamanhoPayload = JSON.stringify(resposta.body).length;
            console.log('Tamanho do payload recebido:', tamanhoPayload);
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





