# Gestão de Salão de Beleza (SaaS)

Sistema desenvolvido com Next.js 14 (App Router), Prisma, Authenticação e ShadowCN/ui.

## Configuração

1.  **Variáveis de Ambiente (.env)**:
    Certifique-se de que seu arquivo `.env` contenha:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/salao?schema=public"
    NEXTAUTH_SECRET="sua-chave-secreta-aleatoria"
    NEXTAUTH_URL="http://localhost:3000"
    ```

2.  **Instalar Dependências**:
    ```bash
    bun install
    ```

3.  **Banco de Dados**:
    Sincronize o schema com o banco:
    ```bash
    bunx prisma generate
    bunx prisma db push
    ```

4.  **Rodar o Projeto**:
    ```bash
    bun dev
    ```

## Estrutura do Projeto

*   `src/app/(admin)`: Painel administrativo protegido.
*   `src/app/(auth)`: Páginas de login.
*   `src/actions`: Server Actions para mutações de dados.
*   `src/components/forms`: Formulários interativos (Client Components).
*   `src/lib/db.ts`: Conexão com o banco (Prisma Singleton).

## Funcionalidades Prontas (MVP)

*   **Autenticação**: Login com Email/Senha (validado no banco `Usuario`).
*   **Dashboard**: KPIs de Agendamentos do dia, Clientes e Faturamento projetado.
*   **Agendamentos**:
    *   Listagem de agendamentos.
    *   Criação de novo agendamento (Modal + Form).
    *   Validação com Zod e Server Actions.
