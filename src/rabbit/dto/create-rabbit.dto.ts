import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { TypeQueue } from "src/commom/enums/queue-enum"

export class CreateRabbitDto {
  @ApiProperty({})
  @IsNotEmpty({ message: 'A mensagem não pode ser vazia.' })
  message: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'O tipo de fila não pode ser vazio.' })
  @IsEnum(TypeQueue, { message: 'O tipo de fila inválido.' })
  typeQueueRabbit: TypeQueue;
}
