import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { UserTestBullQueueService } from "src/user-test-bull-queue/user-test-bull-queue.service";

@Processor("users")
export class UserFilasProcessor {

    constructor(private userBullService: UserTestBullQueueService) { }
    
    @Process('users-job')
    async processarFilaDeUsuarios(job: Job) {
        console.log(job, 'job - users-queue-consumer-processor.ts:12')
        await this.userBullService.saveUserInDatabase(job.data)
    }

}