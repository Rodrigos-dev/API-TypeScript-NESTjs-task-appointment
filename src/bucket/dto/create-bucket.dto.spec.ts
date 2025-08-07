import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { MediasUploadDto, ItemToUploadMediasDto, CreateUrlSignedBucketDto } from './create-bucket.dto';
import { FolderNameType, TypeFileUpload } from "src/commom/enums/bucket-enums";

// ---
describe('MediasUploadDto', () => {
    const validPayload = { type: TypeFileUpload.IMAGE };

    it('deve passar a validação com um tipo de mídia válido', async () => {
        const dto = plainToInstance(MediasUploadDto, validPayload) as any;
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('deve falhar com um tipo de mídia inválido', async () => {
        const dto = plainToInstance(MediasUploadDto, { type: 'invalid_type' }) as any;
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('deve falhar se o tipo de mídia estiver ausente', async () => {
        const dto = plainToInstance(MediasUploadDto, {}) as any;
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
});

// ---
describe('ItemToUploadMediasDto', () => {
    const validPayload = {
        mediasUpload: [{ type: TypeFileUpload.IMAGE }, { type: TypeFileUpload.PDF }],
    };

    it('deve passar a validação com um array de DTOs de mídia válido', async () => {
        const dto = plainToInstance(ItemToUploadMediasDto, validPayload) as any;
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('deve falhar se o array contiver um DTO de mídia inválido', async () => {
        const invalidMedias = [{ type: TypeFileUpload.IMAGE }, { type: 'invalid_type' }];
        const dto = plainToInstance(ItemToUploadMediasDto, { mediasUpload: invalidMedias });
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);

        expect(errors[0].property).toBe('mediasUpload');

        const invalidDtoError = errors[0].children[0];

        expect(invalidDtoError.children[0].constraints).toHaveProperty('isEnum');
    });

    it('deve falhar se `mediasUpload` não for um array', async () => {
        const dto = plainToInstance(ItemToUploadMediasDto, { mediasUpload: 'not an array' }) as any;
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].constraints).toHaveProperty('isArray');
    });
});

// ---
describe('CreateUrlSignedBucketDto', () => {
    const validPayload = {
        userId: 1,
        folderNameType: FolderNameType.ADVERTISEMENTS,
        itemsToUploadMedias: [{
            mediasUpload: [{ type: TypeFileUpload.IMAGE }, { type: TypeFileUpload.PDF }]
        }]
    };

    it('deve passar a validação com um payload completo e válido', async () => {
        const dto = plainToInstance(CreateUrlSignedBucketDto, validPayload) as any;
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it.each([
        ['userId', { ...validPayload, userId: undefined }, 'isNotEmpty'],
        ['folderNameType', { ...validPayload, folderNameType: 'invalid_folder' }, 'isEnum'],
        ['itemsToUploadMedias', { ...validPayload, itemsToUploadMedias: 'not an array' }, 'isArray'],
    ])('deve falhar se %s estiver inválido', async (property, invalidPayload, constraint) => {
        const dto = plainToInstance(CreateUrlSignedBucketDto, invalidPayload) as any;
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe(property);
        expect(errors[0].constraints).toHaveProperty(constraint);
    });
});