import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, Matches } from "class-validator";

export class CreateTaskDto {

    @ApiProperty()
    @IsNotEmpty({ message: 'Usuario que está criando a tarefa deve ser enviado.' })
    userOwnerId: number;

    @ApiProperty({
        type: String,
        format: 'date', // só a data
        example: '2025-08-02',
        description: 'Data da tarefa no formato YYYY-MM-DD',
    })
    @IsNotEmpty({ message: 'Data da tarefa deve ser enviada.' })
    @IsDateString({}, { message: 'A data deve estar no formato ISO 8601 (YYYY-MM-DD).' })
    dateEvent: string;

    @ApiProperty({
        type: String,
        format: 'time', // só hora
        example: '14:30',
        description: 'Hora de início no formato HH:mm',
    })
    @IsNotEmpty({ message: 'Início da tarefa deve ser enviado.' })
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'A hora de início deve estar no formato HH:mm.' })
    startTime: string;

    @ApiProperty({
        type: String,
        format: 'time', // só hora
        example: '16:00',
        description: 'Hora de término no formato HH:mm',
    })
    @IsNotEmpty({ message: 'Fim da tarefa deve ser enviado.' })
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'A hora de início deve estar no formato HH:mm.' })
    endTime: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Titulo da tarefa deve ser enviada.' })
    title: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Descrição da tarefa deve ser enviada.' })
    description: string;

}
