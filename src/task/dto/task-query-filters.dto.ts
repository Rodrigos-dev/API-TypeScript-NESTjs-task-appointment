import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsIn, IsNotEmpty, IsOptional } from "class-validator";
import { PeriodTasksEnum, StatusTaskEnum } from "src/commom/enums/task.enums";

export class TaskFindAllDto {

    @ApiProperty({ required: false })
    @IsOptional()
    userOwnerId?: number;    

    @ApiProperty({ required: false, enum: StatusTaskEnum })
    @IsEnum(StatusTaskEnum, { message: 'Status inválido' }) 
    @IsOptional()   
    status?: StatusTaskEnum;  
    
    @ApiProperty({
        required: false,
        type: String,
        format: 'date', // só a data
        example: '2025-08-02',
        description: 'Data da tarefa no formato YYYY-MM-DD',
    })
    @IsOptional()
    @IsDateString({}, { message: 'A data deve estar no formato ISO 8601 (YYYY-MM-DD).' })
    dateEvent?: string;    

    @ApiProperty({ required: false })
    @IsOptional()
    title?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    page?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    take?: number;

    @ApiProperty({
        required: false,
        enum: ['ASC', 'DESC'],
    })
    @IsOptional()
    @IsIn(['ASC', 'DESC'], { message: 'orderBy deve ser ASC ou DESC' })
    orderBy?: 'ASC' | 'DESC'
}

export class TasksPeriodFindDto {

    @ApiProperty({ required: false })
    @IsOptional()
    userOwnerId?: number;    

    @ApiProperty({ required: false, enum: StatusTaskEnum })
    @IsOptional()
    @IsEnum(StatusTaskEnum, { message: 'Status inválido' })    
    status?: StatusTaskEnum; 
    
    @ApiProperty({ enum: PeriodTasksEnum })
    @IsEnum(PeriodTasksEnum, { message: 'Período inválido' })
    @IsNotEmpty({ message: 'O periodo é obrigatório.' })
    period: PeriodTasksEnum;    

    @ApiProperty({ required: false })
    @IsOptional()
    page?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    take?: number;

    @ApiProperty({
        required: false,
        enum: ['ASC', 'DESC'],
    })
    @IsOptional()
    @IsIn(['ASC', 'DESC'], { message: 'orderBy deve ser ASC ou DESC' })
    orderBy?: 'ASC' | 'DESC'
}