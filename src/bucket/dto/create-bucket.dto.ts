import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, ValidateNested } from "class-validator";
import { FolderNameType, TypeFileUpload } from "src/commom/enums/bucket-enums";

export class CreateUrlSignedBucketDto {

    @IsNotEmpty({ message: 'Usuário que esta realizando o upload é obrigatório' })
    userId: number

    @IsNotEmpty({ message: 'Nome da pasta que vai receber o upload é obrigatório' })    
    @IsEnum(FolderNameType, {
        message: 'Apenas esses tipos de árquivos FolderNameType enum',
    })
    folderNameType = FolderNameType

    @IsArray()
    @ValidateNested({ each: true }) // Valida cada item do array
    @Type(() => ItemToUploadMediasDto)  // Transforma cada item do array no DTO correto
    itemsToUploadMedias: ItemToUploadMediasDto[]     // cada item indica um tipo de objeto para upload das medias exemplo anuncio, produto etc
}


export class ItemToUploadMediasDto {
    @IsArray()
    @ValidateNested({ each: true }) // Valida cada item do array
    @Type(() => MediasUploadDto)  // Transforma cada item do array no DTO correto
    mediasUpload: MediasUploadDto[]
}


export class MediasUploadDto {
    @IsNotEmpty({ message: 'Tipo de media para fazer upload é obrigatório' })
    @IsEnum(TypeFileUpload, {
        message: 'Tipo de mídia inválido. Use: image, video ou pdf',
    })
    type: TypeFileUpload
}
