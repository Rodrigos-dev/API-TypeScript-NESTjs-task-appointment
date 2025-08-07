import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bull';
import { UserFilasProcessor } from './users-queue-consumer-processor';
import { UserTestBullQueueService } from '../../user-test-bull-queue/user-test-bull-queue.service';

describe('UserFilasProcessor', () => {
    let processor: UserFilasProcessor;
    let userTestBullQueueService: UserTestBullQueueService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserFilasProcessor,
                {
                    provide: UserTestBullQueueService,
                    useValue: {
                        saveUserInDatabase: jest.fn(), // Mocka o método saveUserInDatabase
                    },
                },
            ],
        }).compile();

        processor = module.get<UserFilasProcessor>(UserFilasProcessor);
        userTestBullQueueService = module.get<UserTestBullQueueService>(UserTestBullQueueService);
    });

    it('deve ser definido', () => {
        expect(processor).toBeDefined();
    });

    it('deve chamar o método saveUserInDatabase com os dados do job ao processar um job de usuário', async () => {
        const userData = { id: 1, nome: 'Usuário de Teste', email: 'teste@exemplo.com' };
        const jobMock: Job = { data: userData } as Job;

        await processor.processarFilaDeUsuarios(jobMock);

        expect(userTestBullQueueService.saveUserInDatabase).toHaveBeenCalled();
        expect(userTestBullQueueService.saveUserInDatabase).toHaveBeenCalledWith(userData);
    });

});


















