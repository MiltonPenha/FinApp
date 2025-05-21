# FinApp

FinApp é uma aplicação web/mobile desenvolvida para simplificar o controle financeiro pessoal através do registro intuitivo de gastos e da facilidade de leitura de boletos via OCR (Optical Character Recognition). Nosso objetivo é tornar o gerenciamento de finanças mais acessível, eficiente e educativo.

## 🚀 Objetivo do Projeto

Oferecer uma solução completa para o controle financeiro pessoal que integra:

- Registro simplificado de despesas e gastos.
- Leitura automática de informações de boletos através de OCR.
- Uma visão clara e organizada da situação financeira do usuário.
- Recursos futuros de educação financeira para auxiliar na tomada de decisões.

## 🛠️ Tecnologias Utilizadas

### Backend
- **Framework**: NestJS
- **Banco de Dados**: PostgreSQL
- **Autenticação**: Clerk

### Frontend
- **Frameworks**: React.js e Next.js
- **Estilização**: Tailwind CSS
- **Bibliotecas Adicionais**: Shadcn/ui para componentes de interface de usuário

## ⚙️ Funcionalidades

1.  **Registro de Gastos Simplificado**: Interface intuitiva para registrar despesas de forma rápida, categorizando-as para melhor facilidade visual.
2.  **Controle Financeiro Aprimorado**: Visão geral dos gastos, permitindo identificar padrões e áreas para otimização financeira.
3.  **Registro de Boletos via OCR**: Facilidade de registrar pagamentos através da leitura automática de boletos, economizando tempo e evitando erros de digitação.
4.  **Educação Financeira**: Futuros recursos para fornecer dicas, informações e ferramentas que ajudem os usuários a melhorar sua saúde financeira.

## 💻 Padrões de Projeto Implementados no FinApp

Este documento descreve os padrões de projeto de software utilizados no desenvolvimento do FinApp, com foco nos princípios SOLID e no padrão Strategy.

### Princípios SOLID

Os princípios SOLID são um conjunto de cinco princípios de design de classe que visam tornar os sistemas de software mais compreensíveis, flexíveis e fáceis de manter.

#### 1. Princípio da Responsabilidade Única (SRP - Single Responsibility Principle)

*   **Conceito:** Uma classe deve ter apenas uma razão para mudar, ou seja, deve ter apenas uma responsabilidade.
*   **Implementação no FinApp (Backend - Módulo `expenses`):**
    *   **`ExpensesController` (`backend/src/expenses/expenses.controller.ts`):** Sua única responsabilidade é lidar com as requisições HTTP (rotas, validação de entrada básica via DTOs, formatação de respostas) e delegar a lógica de negócios para o serviço apropriado. Ele não contém lógica de acesso a dados ou regras de negócio complexas.
    *   **`ExpensesService` (`backend/src/expenses/expenses.service.ts`):** É responsável por toda a lógica de negócios relacionada a despesas. Isso inclui criar, ler, atualizar, deletar despesas, interagir com a camada de persistência (banco de dados, através do Mongoose) e com o cache (através do `CacheService`).
    *   **`ExpenseSchema` (`backend/src/expenses/expenses.schema.ts`):** Define a estrutura e as regras de validação para os dados de despesas, sendo sua única responsabilidade a definição do modelo de dados.

#### 2. Princípio Aberto/Fechado (OCP - Open/Closed Principle)

*   **Conceito:** Entidades de software (classes, módulos, funções, etc.) devem ser abertas para extensão, mas fechadas para modificação.
*   **Implementação no FinApp (Backend - Estrutura NestJS):**
    *   **Módulos, Controladores e Serviços:** A arquitetura do NestJS facilita a extensão. É possível adicionar novos endpoints ao `ExpensesController`, novos métodos ao `ExpensesService`, ou até mesmo módulos inteiros (ex: `IncomesModule`) sem a necessidade de alterar significativamente o código existente e funcional dos outros módulos.
    *   **Injeção de Dependência:** O sistema de injeção de dependência do NestJS permite que novas funcionalidades ou dependências (como um novo serviço de notificação) sejam adicionadas e injetadas onde necessário, sem modificar as classes que as consomem diretamente.
    *   **Decorators e Pipes:** Funcionalidades como validação (`ValidationPipe` em `main.ts`), autenticação (Guards), e transformação de dados podem ser adicionadas ou estendidas de forma declarativa usando decorators e pipes, sem alterar o código principal dos controladores ou serviços.

#### 3. Princípio da Inversão de Dependência (DIP - Dependency Inversion Principle)

*   **Conceito:** Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações. Abstrações não devem depender de detalhes. Detalhes devem depender de abstrações.
*   **Implementação no FinApp (Backend - Estrutura NestJS):**
    *   **Injeção de Dependência:** O NestJS gerencia a criação e o fornecimento de dependências. Por exemplo, o `ExpensesController` não instancia diretamente o `ExpensesService`. Em vez disso, ele declara uma dependência de `ExpensesService` (uma abstração, nesse contexto) em seu construtor, e o framework NestJS injeta uma instância concreta. Isso desacopla o controller do serviço.
    *   **Módulos:** Os módulos do NestJS definem claramente suas exportações e importações, permitindo que dependam de interfaces ou tokens fornecidos por outros módulos, em vez de implementações concretas.

#### Outros Princípios SOLID

*   **Princípio da Substituição de Liskov (LSP):** Não há exemplos claros de hierarquias de classes nos trechos fornecidos que permitiriam uma análise profunda do LSP. No entanto, ao usar TypeScript e interfaces, incentiva-se a criação de contratos que, se seguidos, naturalmente apoiam o LSP.
*   **Princípio da Segregação de Interface (ISP):** Similar ao LSP, a análise completa do ISP exigiria uma visão mais ampla das interfaces do sistema. O NestJS, ao promover serviços focados e controladores enxutos, indiretamente apoia a criação de interfaces menores e mais específicas.

### Padrão Strategy

*   **Conceito:** O padrão Strategy é um padrão de projeto comportamental que permite definir uma família de algoritmos, encapsular cada um deles e torná-los intercambiáveis. Ele permite que o algoritmo varie independentemente dos clientes que o utilizam.
*   **Implementação no FinApp:**
    *   Nos trechos de código analisados até o momento, **não foi identificada uma implementação explícita do padrão Strategy.**

Este documento serve como uma visão geral. A aplicação desses padrões é um esforço contínuo e pode evoluir à medida que o projeto cresce.

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

