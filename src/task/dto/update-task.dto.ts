import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { StatusTaskEnum } from 'src/commom/enums/task.enums';

export class UpdateTaskDto {

    @ApiProperty({        
        enum: StatusTaskEnum,
        example: 'schema propriedades a enviar'
    })
    @IsOptional()
    @IsEnum(StatusTaskEnum, { message: 'Valor inválido para status da tarefa' })
    status?: StatusTaskEnum;

    @ApiProperty({
        type: String,
        format: 'date', // só a data
        example: '2025-08-02',
        description: 'Data da tarefa no formato YYYY-MM-DD',
    })
    @IsOptional()
    @IsDateString({}, { message: 'A data deve estar no formato ISO 8601 (YYYY-MM-DD).' })
    dateEvent?: string;

    @ApiProperty({
        type: String,
        format: 'time', // só hora
        example: '14:30',
        description: 'Hora de início no formato HH:mm',
    })
    @IsOptional()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'A hora de início deve estar no formato HH:mm.' })
    startTime?: string;

    @ApiProperty({
        type: String,
        format: 'time', // só hora
        example: '16:00',
        description: 'Hora de término no formato HH:mm',
    })
    @IsOptional()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'A hora de início deve estar no formato HH:mm.' })
    endTime?: string;

    @ApiProperty()
    @IsOptional()
    title?: string;

    @ApiProperty()
    @IsOptional()
    description?: string;
}
