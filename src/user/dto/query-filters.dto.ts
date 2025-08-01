export class UserFindAllDto {
    page: number;
    take: number;
    orderBy: 'ASC' | 'DESC'
}


export class UserFindAllByQueryDto {
    userId: number
    email: string
    name: string
    page: number
    take: number
    orderBy: 'ASC' | 'DESC';
}