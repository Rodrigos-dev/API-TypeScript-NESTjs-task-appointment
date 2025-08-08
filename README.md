# 🚀 API NestJS – Projeto para agendamento de tarefas/serviços etc....

✨API construída com NestJS e TypeScript para gerenciar horários de serviços de prestadores e tarefas pessoais.
Oferece autenticação completa, CRUD de usuários, integração com serviços externos (filas, provedores de storage, envio de e-mail, etc.), validação 100% nos DTOs e tipagem 100% no TypeScript para máxima segurança e consistência de dados.

Funcionalidades principais:

Cadastro e login (JWT + refresh token).

Recuperação e atualização de senha.

Agendamento de serviços com validação de conflito (impede criar/atualizar quando já há outro serviço no mesmo horário).

Relatórios de serviços (executados / pendentes).

Filtros avançados: por dia, semana, mês, ano, usuário, status, etc.

Integração com filas e storage em nuvem para processamento assíncrono e upload de mídias.

Validação de dados 100% nos DTOs usando decorators e pipes.

Tipagem completa no TypeScript para evitar erros em tempo de desenvolvimento.

---

## 📌 Tecnologias Principais

- **NestJS** + **TypeScript**
- **Bancos - MySQL** / **PostgreSQL** via **TypeORM**
- **Docker** e **Docker Compose**
- **RabbitMQ** (filas, pub/sub)
- **Redis** (cache e filas)
- **JWT** (token & refresh token)
- **Buckets Storage** - Dropbox, Cloudinary
- **Firebase** - Push notifications
- **Nodemailer** (envio de emails)
- **Swagger** (documentação completa)
- **Date-fns** (manipulação de datas)
- **Bull** (gerenciamento de filas)
- **Logger personalizado**
- **Testes unitários com Jest cobertura completa**

---

🗄️ Serviços Integrados
MySQL / PostgreSQL com TypeORM

JWT + Refresh Token

RabbitMQ (fila de envio de emails e outras tarefas assíncronas)

Redis para cache e filas

Armazenamento de mídias:

Firebase

Dropbox

Cloudinary

Envio de email (Nodemailer – Gmail, Hotmail etc.)

Swagger para documentação (/api)

Controle de permissões com decorators personalizados (Role, Permission)

--------

📍 Funcionalidades
🔑 Autenticação & Usuários
Registro de usuário

Login com JWT

Refresh Token

Atualização de senha:

Por código enviado por email

Por senha antiga (usuário logado)

Recuperação de senha

CRUD de usuário

Upload de avatar para Dropbox ou Cloudinary

Controle de permissões e papéis (roles)

📬 Email
Envio direto via SMTP (Nodemailer)

Envio assíncrono via RabbitMQ

☁️ Armazenamento de Mídia

Dropbox (upload, remoção de arquivos e pastas)

Cloudinary (upload, remoção e listagem de URLs)

📅 Tarefas (Tasks)
CRUD de tarefas

Relacionamento 1:N com usuário

Filtros por período (diário, semanal, mensal, anual)

Controle de acesso (somente dono ou admin)

📊 Infraestrutura
Dockerfile e docker-compose configurados

Redis pronto para cache e filas

Logger personalizado

Validação de DTOs

Index e campos JSON simples nas entidades

Testes unitários com Jest para services, controllers e DTOs


---------


🗺️ Mapa de Desenvolvimento
001 – Configuração Base

TypeORM + MySQL/PostgreSQL

CRUD de usuário

Login e Refresh Token

Tratamento de erros (try/catch)

Logger personalizado

Validações nos DTOs

Index e Simple JSON nas entidades

Configuração inicial no Insomnia

002 – Permissões

Decorator para usuário na requisição

Decorator para controle de permissões (role)

Enum de permissões na entidade

Update de usuário com controle de administrador

003 – Docker

Dockerfile e docker-compose com banco local

Redis no docker-compose

004 – Filas

Filas com Bull + Redis

RabbitMQ (pub/sub, envio e consumo de mensagens)

005 – Emails

Envio via Nodemailer

006 – Recuperação de Senha

Fluxo de envio de código por email

Atualização de senha via código ou usuário logado

007 – RabbitMQ para Emails

Refatoração para envio de emails via fila RabbitMQ

008 – Firebase Storage

Integração com Bucket do Firebase

009 – Firebase Push Notification

Registro de dispositivos e envio de notificações

010 – Dropbox

Upload, remoção de arquivos e pastas

Integração no CRUD de usuário

011 – Cloudinary

Upload e remoção de mídias

Integração no CRUD de usuário

Obtenção de URLs para uso no frontend

012 – Refatorações e Tipagens

Melhorias em tipagem e organização

013 – Simple JSON

Uso de Simple JSON para avatar

014 – Swagger

Documentação completa (/api)

015 – Tarefas

CRUD de tasks

Filtros por status, data e período

Controle de acesso por usuário/administrador

016 – Testes

Cobertura total de testes com Jest


📖 Documentação da API
Após iniciar o projeto, acesse:

http://localhost:3000/api























