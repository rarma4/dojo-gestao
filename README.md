# 🥋 Dojo Gestão

Sistema completo de gestão para academias de artes marciais (dojos), desenvolvido com Next.js 16, TypeScript, Prisma e Better Auth.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.7-2D3748?style=flat-square&logo=prisma)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)

## 📋 Sobre o Projeto

Dojo Gestão é uma plataforma web moderna e intuitiva para gerenciamento completo de academias de artes marciais. O sistema oferece controle detalhado de alunos, professores, modalidades, graduações e mensalidades, facilitando a administração do dia a dia do dojo.

### ✨ Funcionalidades Principais

- **👤 Gestão de Alunos**
  - Cadastro completo com dados pessoais e contato
  - Controle de graduação atual e histórico
  - Acompanhamento de status de mensalidade
  - Gestão de planos de pagamento (mensal, bimestral, trimestral, semestral, anual)

- **👨‍🏫 Gestão de Professores**
  - Cadastro de professores vinculados às modalidades
  - Controle de permissões (admin/professor)
  - Gestão de graduações aplicadas

- **🥊 Modalidades**
  - Cadastro de diferentes artes marciais
  - Personalização com descrição e cor tema
  - Vinculação de professores e alunos

- **🎖️ Graduações**
  - Tipos de graduação por modalidade
  - Ordem hierárquica de faixas/graus
  - Histórico completo de graduações por aluno
  - Registro de professor responsável e valores

- **💰 Mensalidades**
  - Controle de pagamentos e vencimentos
  - Múltiplos planos de pagamento
  - Status automático (em dia, atrasado, isento)
  - Histórico de pagamentos

- **📊 Dashboard e Relatórios**
  - Visão geral da academia
  - Estatísticas de alunos e mensalidades
  - Atividades recentes

- **🔐 Autenticação e Segurança**
  - Login com email/senha
  - Autenticação OAuth (Google)
  - Recuperação de senha
  - Diferentes níveis de acesso

## 🚀 Tecnologias

### Core
- **[Next.js 16](https://nextjs.org/)** - Framework React com SSR e App Router
- **[React 19](https://react.dev/)** - Biblioteca para interfaces de usuário
- **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[Prisma](https://www.prisma.io/)** - ORM moderno para Node.js e TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional

### Autenticação
- **[Better Auth](https://www.better-auth.com/)** - Solução completa de autenticação
- **OAuth 2.0** - Integração com Google

### UI/UX
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Radix UI](https://www.radix-ui.com/)** - Componentes acessíveis e não estilizados
- **[Lucide React](https://lucide.dev/)** - Ícones modernos
- **[Phosphor Icons](https://phosphoricons.com/)** - Família de ícones flexível

### Formulários e Validação
- **[React Hook Form](https://react-hook-form.com/)** - Gestão de formulários performática
- **[Zod](https://zod.dev/)** - Schema validation TypeScript-first

### Utilitários
- **[date-fns](https://date-fns.org/)** - Manipulação de datas moderna
- **[clsx](https://github.com/lukeed/clsx)** - Utilitário para classes CSS
- **[class-variance-authority](https://cva.style/)** - Variantes de componentes

## 📦 Instalação

### Pré-requisitos

- Node.js 20.x ou superior
- PostgreSQL 14.x ou superior
- npm ou yarn

### Passo a passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/dojo-gestao.git
cd dojo-gestao
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/dojo_gestao"

# Better Auth
BETTER_AUTH_SECRET="sua-chave-secreta-aqui"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth - Google (opcional)
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"

# Email (Resend - opcional para recuperação de senha)
RESEND_API_KEY="sua-chave-resend-api"
```

4. **Configure o banco de dados**

Execute as migrations do Prisma:

```bash
npx prisma migrate dev
```

5. **Gere o Prisma Client**
```bash
npx prisma generate
```

6. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 🗂️ Estrutura do Projeto

```
dojo-gestao/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── migrations/            # Histórico de migrations
├── public/                    # Arquivos estáticos
├── src/
│   ├── app/                   # App Router do Next.js
│   │   ├── _components/       # Componentes da página inicial
│   │   ├── api/              # API Routes
│   │   ├── dashboard/        # Área autenticada
│   │   │   ├── alunos/       # Gestão de alunos
│   │   │   ├── professores/  # Gestão de professores
│   │   │   ├── modalidades/  # Gestão de modalidades
│   │   │   ├── graduacoes/   # Gestão de graduações
│   │   │   ├── mensalidades/ # Gestão de mensalidades
│   │   │   └── relatorios/   # Relatórios
│   │   ├── forgot-password/  # Recuperação de senha
│   │   ├── reset-password/   # Redefinir senha
│   │   └── signup/           # Cadastro de usuários
│   ├── components/
│   │   └── ui/               # Componentes de UI reutilizáveis
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilitários e configurações
│   └── generated/            # Prisma Client gerado
├── components.json           # Configuração shadcn/ui
├── next.config.ts            # Configuração Next.js
├── tailwind.config.ts        # Configuração Tailwind CSS
├── tsconfig.json             # Configuração TypeScript
└── package.json
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Cria build de produção

# Produção
npm start           # Inicia servidor de produção

# Linting
npm run lint        # Executa ESLint

# Prisma
npx prisma studio   # Abre Prisma Studio (GUI para banco de dados)
npx prisma migrate dev       # Cria e aplica nova migration
npx prisma migrate reset     # Reseta banco de dados
npx prisma generate          # Gera Prisma Client
```

## 🗄️ Modelo de Dados

O sistema utiliza os seguintes modelos principais:

- **User** - Usuários do sistema (autenticação)
- **Professor** - Professores vinculados às modalidades
- **Aluno** - Alunos matriculados
- **Modalidade** - Artes marciais oferecidas (Judô, Karatê, Jiu-jitsu, etc.)
- **GraduacaoTipo** - Tipos de graduação por modalidade (faixas, graus)
- **Graduacao** - Histórico de graduações dos alunos
- **Mensalidade** - Pagamentos e vencimentos
- **Session/Account** - Gestão de sessões e contas (Better Auth)

Ver [schema.prisma](prisma/schema.prisma) para detalhes completos.

## 🔐 Autenticação

O sistema utiliza **Better Auth** para autenticação, oferecendo:

- ✅ Login com email e senha
- ✅ OAuth com Google
- ✅ Recuperação de senha via email
- ✅ Sessões seguras com tokens
- ✅ Proteção de rotas
- ✅ Níveis de acesso (Admin/Professor)

## 🎨 UI/UX

A interface foi construída com foco em:

- **Responsividade** - Funciona perfeitamente em mobile, tablet e desktop
- **Acessibilidade** - Componentes Radix UI com ARIA attributes
- **Design System** - Componentes consistentes e reutilizáveis
- **Dark Mode** - Suporte a tema escuro (planejado)
- **Feedback Visual** - Loading states, validações e mensagens claras

## 🚢 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório no [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente
3. O deploy será automático a cada push

### Docker (Alternativo)

```bash
# Em breve - Dockerfile em desenvolvimento
```

## 📝 Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `DATABASE_URL` | String de conexão PostgreSQL | Sim |
| `BETTER_AUTH_SECRET` | Chave secreta para auth | Sim |
| `BETTER_AUTH_URL` | URL base da aplicação | Sim |
| `GOOGLE_CLIENT_ID` | ID do OAuth Google | Não |
| `GOOGLE_CLIENT_SECRET` | Secret do OAuth Google | Não |
| `RESEND_API_KEY` | Chave API Resend (emails) | Não |

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com 💙 para facilitar a gestão de dojos e academias de artes marciais.

## 🙏 Agradecimentos

- [Next.js Team](https://nextjs.org/)
- [Vercel](https://vercel.com/)
- [Prisma](https://www.prisma.io/)
- [Better Auth](https://www.better-auth.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- Comunidade open source

---

⭐ Se este projeto foi útil, considere dar uma estrela no repositório!
