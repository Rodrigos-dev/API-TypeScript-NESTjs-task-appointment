import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";

export class UserFindAllDto {
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


export class UserFindAllByQueryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    userId?: number

    @ApiProperty({ required: false })
    @IsOptional()
    email?: string

    @ApiProperty({ required: false })
    @IsOptional()
    name?: string

    @ApiProperty({ required: false })
    @IsOptional()
    page?: number

    @ApiProperty({ required: false })
    @IsOptional()
    take?: number

    @ApiProperty({
        required: false,
        enum: ['ASC', 'DESC'],
    })
    @IsOptional()
    @IsIn(['ASC', 'DESC'], { message: 'orderBy deve ser ASC ou DESC' })
    orderBy?: 'ASC' | 'DESC'
}