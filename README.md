## Description

#PADRAO INICIAL DE UMA API NEST

api feita com nest.JS typeScripty para iniciar qualquer projeto a partir dela

* para rodar a api primeiro rode npm install, rode o docker e rode pelo menos o rebbitmq para conectar - docker compose up rabbitmq -d, e de play no docker depois rode debugger ou npm run start:dev

* mysql, typeorm, user CRUD, envia email, esqueceu senha, atualizar senha, login, token, refresh token,
validate no dto, storage firebase, storage drop box, storage cloudnary, decorators personalizados role permission,
docker, filas com pub sub, rabbitmq, redis, logger para retornar erros no console 

* MAPA PASSO A PASSO

* 001 - TYPE ORM
* 001 - MYSQL POSTGRES
* 001 - CRIANDO USUARIO E O CRUD
* 001 - LOGIN
* 001 - REFRESH TOKEN
* 001 - ERROS TRY CATH
* 001 - LOGGER
* 001 - VALIDATORS NO DTO
* 001 - INDEX NAS ENTIDADES
* 001 - SIMPLE JSON NA ENTIDADE
* 001 - MAPA PARA O INSOMINIA CONFIGURAR

* ATEH A PASTA 11 NO MAPA ISSO ********

* 002 - add decorator personalizado para User vindo pela req
* 002 - add decorator para controle de permissao do usuario role
* 002 - add nova coluna e enum na entidade para permissao
* 002 - add refatoracao no update user para role ser permitido so por um administrador

* 003 - add dockerfile e docker-compose conmunicando com banco local do pc
* 003 - add no docker-compose o REDIS para subir antes da aplicacao e podermos usar o redis no futuro

* 004 - ADD FILAS COM REDIS NO DOCKER E BULL PARA MANIPULAR
* 004 - EM MAPS 004 TEM FILAS RABITMQ, PUB SUB, BULL E REDIS, REDIS PURO ETC 

* 005 - ADICIONEI ENVIAR EMAIL USANDO NODEMALER PELO GMAIL  HOTMAIL ETC

* 006 - ADICIONEI A FORMA DE FAZER O ESQUECEU A SENHA...ENVIANDO CODIGO NO EMAIL POREM SEM FILA AINDA
* 006 - ADICIONEI A FORMA DE REALIZAR UPDATE PASSWORD COM O CODIGO RECEBIDO NO EMAIL
* 006 - ADICIONEI A FORMA DE REALIZAR UPDATE PASSWORD POR UM USUÁRIO LOGADO AMBOS OS 007 NO MESMO METODO COM 2 CHAMADAS 

* 007 - ADICIONEI O RABBIT MQ REFATOREI O EMAILS DO ESQUECEU A SENHA PARA O RABBIT ENVIAR O EMAIL 
* 007 - CONFIGURADO RABIT MQ PELO DOCKER ENVIANDO MSG NA FILA E CONSUMINDO AS MSGS FAZENDO O TRABALHO QUE NO CASO É ENVIAR EMAIL
DIFERENTES NO CONTROLLER

* 008 - FIREBASE BUCKET STORAGE - ADD O BUCKET NO CLASSIFIELD API (nessa nao tem) caso precise.
* 008 - GCP BUCKET STORAGE - ADD O BUCKET em outra API (nessa nao tem) caso precise.

* 009 - FIREBASE PUSH NOTIFICATION - ADD FORMA DE ENVIAR O PUSH NOTIFICATION PELO FIREBASE
* 009 - FIREBASE REGISTER-DEVICE - ENTIDADE REGISTER DEVICE PARA SALVAR O TOKEN DO FIREBASE NO BANCO
* 009 - ENTIDADE FIREBASE-PUSH-NOTIFICATION - PARA SALVAR OS DADOS DO PUSH NOTIFICATION NO BANCO

*0010 - DROPBOX - ADD BUCKET COM DROPBOX UPLOAD FILE REMOVE FILE E REMOVE FOLDER
*0010 - CREATE USER JAH ADICIONA IMAGEM NO DROP BOX
*0010 - UPDATE USER REMOVE IMAGEM DROP BOX E ADD IMAGEM NOVA
*0010 - DELETE USER REMOVE A PASTA TODA DO USUARIO

*0011 - CLOUDNARY BUCKET - BUCKET PARA UPLOAD DE MIDIAS 
*0011 - FEITO O UPLOAD - REMOVE TODA PASTA - REMOVE ARQUIVO
*0011 - ADD NO CREATE USER - UPDATE USER - DELETE USER - DELETE IMAGE AVATAR USER
*0011 - BASICAMENTE FIREBASE - DROPBOX - CLOUDNARY - SÃO BUCKETS DE MIDIAS E 
*0011 - ADD TB METODO PARA PEGAR AS URLS DAS MEDIAS E SUBIR DIRETAMENTE PELO FRONT.

*0012 - ADICIONADO A ENTIDADE TASK PARA AGENDAMENTO DE TAREFAS
*0012 - ADICIONADO DATE FNS PARA TRABALHAR COM DATAS
*0012 - RELAÇÃO ONE TO MANY COM A USER - UM USER PARA MUITAS TASKS



## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
