import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";

export class UserFindAllDto {
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


export class UserFindAllByQueryDto {
    @ApiProperty()
    @IsOptional()
    userId?: number

    @ApiProperty()
    @IsOptional()
    email?: string

    @ApiProperty()
    @IsOptional()
    name?: string

    @ApiProperty()
    @IsOptional()
    page?: number

    @ApiProperty()
    @IsOptional()
    take?: number

    @ApiProperty({
        enum: ['ASC', 'DESC'],
    })
    @IsOptional()
    @IsIn(['ASC', 'DESC'], { message: 'orderBy deve ser ASC ou DESC' })
    orderBy?: 'ASC' | 'DESC'
}