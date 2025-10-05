#!/bin/bash

# Script para executar testes de performance com k6
# Este script facilita a execução dos testes de performance da API

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para mostrar ajuda
show_help() {
    echo -e "${BLUE}Script de Testes de Performance com k6${NC}"
    echo ""
    echo "Uso: $0 [OPÇÃO]"
    echo ""
    echo "Opções:"
    echo "  all                 Executa todos os testes de performance"
    echo "  register           Executa teste de registro de usuários"
    echo "  login              Executa teste de login de usuários"
    echo "  get-users          Executa teste de listagem de usuários"
    echo "  create-transfer     Executa teste de criação de transferências"
    echo "  get-transfers       Executa teste de listagem de transferências"
    echo "  combined            Executa teste combinado de todos os endpoints"
    echo "  help               Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 all"
    echo "  $0 register"
    echo "  $0 combined"
}

# Função para verificar se k6 está instalado
check_k6() {
    if ! command -v k6 &> /dev/null; then
        echo -e "${RED}Erro: k6 não está instalado!${NC}"
        echo "Para instalar o k6, visite: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
}

# Função para verificar se o servidor está rodando
check_server() {
    echo -e "${YELLOW}Verificando se o servidor está rodando...${NC}"
    if ! curl -s http://localhost:3000/users > /dev/null; then
        echo -e "${RED}Erro: Servidor não está rodando na porta 3000!${NC}"
        echo "Execute 'npm run start-rest' para iniciar o servidor"
        exit 1
    fi
    echo -e "${GREEN}Servidor está rodando!${NC}"
}

# Função para executar teste individual
run_test() {
    local test_name=$1
    local test_file=$2
    
    echo -e "${BLUE}Executando teste: $test_name${NC}"
    echo "Arquivo: $test_file"
    echo "----------------------------------------"
    
    if [ -f "$test_file" ]; then
        k6 run "$test_file"
        echo -e "${GREEN}Teste $test_name concluído!${NC}"
    else
        echo -e "${RED}Erro: Arquivo $test_file não encontrado!${NC}"
        exit 1
    fi
    echo ""
}

# Função para executar todos os testes
run_all_tests() {
    echo -e "${BLUE}Executando todos os testes de performance...${NC}"
    echo ""
    
    run_test "Registro de Usuários" "performance/test-user-register.js"
    run_test "Login de Usuários" "performance/test-user-login.js"
    run_test "Listagem de Usuários" "performance/test-get-users.js"
    run_test "Criação de Transferências" "performance/test-create-transfer.js"
    run_test "Listagem de Transferências" "performance/test-get-transfers.js"
    
    echo -e "${GREEN}Todos os testes foram executados!${NC}"
}

# Função para executar teste combinado
run_combined_test() {
    echo -e "${BLUE}Executando teste combinado de todos os endpoints...${NC}"
    echo ""
    
    run_test "Teste Combinado" "performance/k6-performance-test.js"
    
    echo -e "${GREEN}Teste combinado concluído!${NC}"
}

# Verificações iniciais
check_k6
check_server

# Processar argumentos
case "$1" in
    "all")
        run_all_tests
        ;;
    "register")
        run_test "Registro de Usuários" "performance/test-user-register.js"
        ;;
    "login")
        run_test "Login de Usuários" "performance/test-user-login.js"
        ;;
    "get-users")
        run_test "Listagem de Usuários" "performance/test-get-users.js"
        ;;
    "create-transfer")
        run_test "Criação de Transferências" "performance/test-create-transfer.js"
        ;;
    "get-transfers")
        run_test "Listagem de Transferências" "performance/test-get-transfers.js"
        ;;
    "combined")
        run_combined_test
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    "")
        echo -e "${YELLOW}Nenhuma opção especificada.${NC}"
        show_help
        ;;
    *)
        echo -e "${RED}Opção inválida: $1${NC}"
        show_help
        exit 1
        ;;
esac
