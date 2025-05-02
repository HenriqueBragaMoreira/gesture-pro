# Gesture Pro

Este repositório contém o código para o backend (API) e frontend (Web) do projeto Gesture Pro.

## Estrutura do Projeto

-   `/api`: Contém o código da API FastAPI (Python).
-   `/web`: Contém o código do frontend Next.js (TypeScript).

## Executando Localmente

Siga os passos abaixo para configurar e executar ambas as partes do projeto em sua máquina local.

### Pré-requisitos

-   [Python](https://www.python.org/) (versão 3.8 ou superior recomendada)
-   [Node.js](https://nodejs.org/) (versão 20.x ou superior recomendada)
-   [pnpm](https://pnpm.io/installation) (gerenciador de pacotes Node.js)
-   [Docker](https://www.docker.com/products/docker-desktop/) e Docker Compose

### 1. Backend (API)

Navegue até o diretório raiz do projeto em seu terminal.

a.  **Configurar Banco de Dados:**
    O backend usa um banco de dados PostgreSQL. Você pode iniciá-lo usando Docker Compose. Este comando também executará o script `database_setup.sql` para criar as tabelas necessárias.

    cd api
    docker compose up -d
    cd ..

b.  **Criar Arquivo `.env`:**
    A API precisa de uma variável de ambiente para se conectar ao banco. Crie um arquivo chamado `.env` dentro do diretório `api/` com o seguinte conteúdo:

    # api/.env
    DATABASE_URL=postgresql://docker:docker@localhost:5432/docker

c.  **Criar e Ativar Ambiente Virtual:**

    # Criar (faça apenas uma vez)
    python -m venv api/venv

    Ativar (faça toda vez que abrir um novo terminal)
    # Linux/macOS/Git Bash:
    source api/venv/Scripts/activate

    # Windows (cmd):
    # api\venv\Scripts\activate.bat

    # Windows (PowerShell):
    # api\venv\Scripts\Activate.ps1
    
    Você saberá que o ambiente está ativo se `(venv)` aparecer no início do prompt do terminal.

d.  **Instalar Dependências Python:**
    Com o ambiente virtual ativo, instale as dependências:

    pip install -r api/requirements.txt

e.  **Rodar a API:**
    Ainda com o ambiente virtual ativo, inicie o servidor FastAPI:

    python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

    A API estará acessível em [http://localhost:8000](http://localhost:8000). A documentação interativa (Swagger UI) estará disponível em [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Frontend (Web)

Abra *outro* terminal (ou aba) e navegue até o diretório raiz do projeto.

a.  **Navegar para o diretório Web:**

    cd web

b.  **Instalar Dependências Node.js:**

    pnpm install

c.  **Rodar o Frontend:**
```bash
pnpm dev


A aplicação web estará acessível em [http://localhost:3000](http://localhost:3000) (ou outra porta indicada pelo Next.js).
```

## Testando

-   **API:** Use a documentação interativa em [http://localhost:8000/docs](http://localhost:8000/docs) para testar os endpoints da API diretamente pelo navegador.
-   **Frontend:** Abra [http://localhost:3000](http://localhost:3000) no seu navegador e interaja com a interface do usuário.
-   **Verificações de Código (Frontend):** Você pode rodar verificações de linting e formatação no diretório `web/`:

    ```bash
    pnpm run lint
    pnpm run check
    pnpm run format
    pnpm run type-check
    ```
