<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

#PADRAO INICIAL DE UMA API NEST

api feita com nest.JS typeScripty para iniciar qualquer projeto a partir dela

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

* 008 - FIREBASE BUCKET STORAGE - ADD O BUCKET NO CLASSIFIELD E TEM A EXPLICACAO AQUI POREM AKI NAO COLOQUEI PQ O GOOGLE NAO PERMITE FREE SEM POR O CARTAO

DIFERENTES NO CONTROLLER

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
