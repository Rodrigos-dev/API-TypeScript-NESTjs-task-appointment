import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigBullProvider } from './config-bull.provider';
import { UserFilasProcessor } from './users-queue-consumer-processor';
import { UserTestBullQueueModule } from 'src/user-test-bull-queue/user-test-bull-queue.module';


@Module({
  imports: [    
    forwardRef(() => UserTestBullQueueModule),
    BullModule.forRootAsync({useClass: ConfigBullProvider }),
    BullModule.registerQueue({
      name: 'users',
    }),
    
    BullModule.registerQueue({
      name: 'fila2',
    }),
  ],  
 
  providers: [UserFilasProcessor],
  exports: [BullModule],
})
export class QueueBullModule {}