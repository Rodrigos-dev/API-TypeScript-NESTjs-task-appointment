import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { UserTestBullQueueService } from "src/user-test-bull-queue/user-test-bull-queue.service";
import loggers from "../utils/loggers";


// Decorador @Processor define o nome da fila que este processor irá ouvir
@Processor("users")
export class UserFilasProcessor {

    // Injeta o serviço UserBullService no constructor
    constructor(private userBullService: UserTestBullQueueService) { }

    // Decorador @Process define o nome do job que este método irá processar
    @Process('users-job')
    // Método processarFilaDeUsuarios irá lidar com os jobs que chegam à fila
    async processarFilaDeUsuarios(job: Job) {
        console.log(job, 'job')
        // Chama o método saveUserInDatabase do serviço UserBullService 
        // passando os dados do job para salvar o usuário no banco de dados
        await this.userBullService.saveUserInDatabase(job.data)
    }

}