import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsIn, IsNotEmpty, IsOptional } from "class-validator";
import { PeriodTasksEnum, StatusTaskEnum } from "src/commom/enums/task.enums";

export class TaskFindAllDto {

    @ApiProperty()
    @IsOptional()
    userOwnerId: number;    

    @ApiProperty()
    @IsEnum(StatusTaskEnum, { message: 'Status inválido' })    
    status: StatusTaskEnum;  
    
    @ApiProperty({
        type: String,
        format: 'date', // só a data
        example: '2025-08-02',
        description: 'Data da tarefa no formato YYYY-MM-DD',
    })
    @IsOptional()
    dateEvent: string;    

    @ApiProperty()
    @IsOptional()
    title: string;

    @ApiProperty()
    @IsOptional()
    description: string;

    @ApiProperty()
    @IsOptional()
    page?: number;

    @ApiProperty()
    @IsOptional()
    take?: number;

    @ApiProperty({
        enum: ['ASC', 'DESC'],
    })
    @IsOptional()
    @IsIn(['ASC', 'DESC'], { message: 'orderBy deve ser ASC ou DESC' })
    orderBy?: 'ASC' | 'DESC'
}

export class TasksPeriodFindDto {

    @ApiProperty()
    @IsOptional()
    userOwnerId?: number;    

    @ApiProperty()
    @IsOptional()
    @IsEnum(StatusTaskEnum, { message: 'Status inválido' })    
    status?: StatusTaskEnum; 
    
    @ApiProperty()
    @IsEnum(PeriodTasksEnum, { message: 'Período inválido' })
    @IsNotEmpty({ message: 'O periodo é obrigatório.' })
    period: PeriodTasksEnum;    

    @ApiProperty()
    @IsOptional()
    page?: number;

    @ApiProperty()
    @IsOptional()
    take?: number;

    @ApiProperty({
        enum: ['ASC', 'DESC'],
    })
    @IsOptional()
    @IsIn(['ASC', 'DESC'], { message: 'orderBy deve ser ASC ou DESC' })
    orderBy?: 'ASC' | 'DESC'
}