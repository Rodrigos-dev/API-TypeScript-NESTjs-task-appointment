import cloudinary from './index';
import { HttpException, HttpStatus } from '@nestjs/common';

// Mocks
jest.mock('cloudinary', () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload: jest.fn(),
            destroy: jest.fn(),
        },
        api: {
            delete_resources_by_prefix: jest.fn(),
            delete_folder: jest.fn(),
        },
        utils: {
            api_sign_request: jest.fn(),
        },
    },
}));

jest.mock('../utils/loggers', () => ({
    default: {
        loggerMessage: jest.fn(),
    },
}));

jest.mock('../utils/exceptions', () => ({
    default: {
        exceptionsReturn: jest.fn(),
    },
}));

const cloudinaryMock = require('cloudinary').v2;
const exceptionsMock = require('../utils/exceptions').default;
const loggersMock = require('../utils/loggers').default;

describe('Cloudinary Service', () => {
    const mockUploadData = {
        urlPathToUpload: 'users/123',
        nameFile: 'image.jpeg',
        base64: 'data:image/jpeg;base64,mocked_base64_string'
    };

    const mockUploadResult = {
        secure_url: 'https://mocked.cloudinary.com/image.jpeg'
    };

    beforeEach(() => {
        jest.clearAllMocks();

        process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
        process.env.CLOUDINARY_API_KEY = 'test_key';
        process.env.CLOUDINARY_API_SECRET = 'test_secret';
        process.env.ENVIRONMENT = 'development';
        process.env.FOLDER_API_NAME_CLOUDNARY_DEV = 'dev_folder';
        process.env.FOLDER_API_NAME_CLOUDNARY_PROD = 'prod_folder';
    });

    describe('initConfigCloudnary', () => {
        it('deve configurar o Cloudinary para o ambiente de desenvolvimento', async () => {

            await cloudinary.initConfigCloudnary();
            expect(cloudinaryMock.config).toHaveBeenCalledWith({
                cloud_name: 'test_cloud',
                api_key: 'test_key',
                api_secret: 'test_secret'
            });

        });

        it('deve configurar o Cloudinary para o ambiente de produção', async () => {
            process.env.ENVIRONMENT = 'production';
            await cloudinary.initConfigCloudnary();
            expect(cloudinaryMock.config).toHaveBeenCalledWith({
                cloud_name: 'test_cloud',
                api_key: 'test_key',
                api_secret: 'test_secret'
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

    });

    describe('generateSignedUploadUrl', () => {
        it('deve gerar uma URL de upload assinada com sucesso', async () => {
            const mockUrlDestination = 'users/123/profile-image';
            const mockNameFile = 'photo.jpeg';
            const mockSignature = 'mocked_signature';
            cloudinaryMock.utils.api_sign_request.mockReturnValue(mockSignature);

            const result = await cloudinary.generateSignedUploadUrl(mockUrlDestination, mockNameFile);

            expect(cloudinaryMock.utils.api_sign_request).toHaveBeenCalled();
            expect(result.url).toBe(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`);
            expect(result.params.signature).toBe(mockSignature);
            expect(result.params.public_id).toBe(mockNameFile);
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

    });

    describe('uploadFileToCloudinary', () => {
        it('deve fazer upload de um arquivo com sucesso e retornar a URL segura', async () => {
            cloudinaryMock.uploader.upload.mockResolvedValue(mockUploadResult);
            const result = await cloudinary.uploadFileToCloudinary(mockUploadData);
            expect(cloudinaryMock.uploader.upload).toHaveBeenCalled();
            expect(result).toBe(mockUploadResult.secure_url);
        });

        it('não deve fazer upload para arquivos com extensão inválida', async () => {
            const invalidData = { ...mockUploadData, nameFile: 'arquivo.zip' };

            const expectedError = new HttpException('Apenas arquivos com extensão .jpeg, .mp4, .pdf ou .txt são permitidos', HttpStatus.BAD_REQUEST);

            exceptionsMock.exceptionsReturn.mockRejectedValue(expectedError);

            await expect(async () => {
                await cloudinary.uploadFileToCloudinary(invalidData);
            }).rejects.toThrow(expectedError);

            expect(cloudinaryMock.uploader.upload).not.toHaveBeenCalled();
        });

        it('deve lidar com erros do Cloudinary durante o upload', async () => {
            const error = new Error('Erro de upload do Cloudinary');
            cloudinaryMock.uploader.upload.mockRejectedValue(error);
            exceptionsMock.exceptionsReturn.mockReturnValue(new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR));
            const result = await cloudinary.uploadFileToCloudinary(mockUploadData);
            expect(result).toBeInstanceOf(HttpException);
            expect(result.message).toBe('Erro de upload do Cloudinary');
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

    });

    describe('deleteFileFromCloudinary', () => {
        it('deve deletar um arquivo com sucesso', async () => {
            cloudinaryMock.uploader.destroy.mockResolvedValue({ result: 'ok' });
            const result = await cloudinary.deleteFileFromCloudinary('users/123/image.jpeg');
            expect(cloudinaryMock.uploader.destroy).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('deve lidar com falhas do Cloudinary ao deletar um arquivo', async () => {
            cloudinaryMock.uploader.destroy.mockResolvedValue({ result: 'not ok' });

            const expectedError = new HttpException('Falha ao deletar arquivo do Cloudinary', HttpStatus.INTERNAL_SERVER_ERROR);

            exceptionsMock.exceptionsReturn.mockReturnValue(expectedError);

            const result = await cloudinary.deleteFileFromCloudinary('users/123/image.jpeg');

            expect(loggersMock.loggerMessage).toHaveBeenCalledWith('error', 'Falha ao deletar arquivo do Cloudinary');

            expect(result).toEqual(expectedError);
        });

        it('deve retornar um erro para uma extensão de arquivo inválida', async () => {
            const expectedError = new HttpException(
                'Apenas arquivos com extensão .jpeg, .mp4, .pdf ou .txt são permitidos',
                HttpStatus.BAD_REQUEST,
            );

            exceptionsMock.exceptionsReturn.mockReturnValue(expectedError);

            const result = await cloudinary.deleteFileFromCloudinary('users/123/file.zip');

            expect(result).toEqual(expectedError);
        });

        it('deve lidar com erros do Cloudinary ao deletar um arquivo', async () => {
            const error = new Error('Erro de exclusão do Cloudinary');

            cloudinaryMock.uploader.destroy.mockRejectedValue(error);

            exceptionsMock.exceptionsReturn.mockRejectedValue(new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR));

            await expect(async () => {
                await cloudinary.deleteFileFromCloudinary('users/123/image.jpeg');
            }).rejects.toThrow('Erro de exclusão do Cloudinary');
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

    });

    describe('deleteFolderUserFromCloudinary', () => {
        it('deve deletar a pasta e seus recursos com sucesso', async () => {
            process.env.ENVIRONMENT = 'development';
            await cloudinary.initConfigCloudnary();

            cloudinaryMock.api.delete_resources_by_prefix.mockResolvedValue({});
            cloudinaryMock.api.delete_folder.mockResolvedValue({});

            await cloudinary.deleteFolderUserFromCloudinary(123);

            expect(cloudinaryMock.api.delete_resources_by_prefix).toHaveBeenCalledWith('dev_folder/users/123/');
            expect(cloudinaryMock.api.delete_folder).toHaveBeenCalledWith('dev_folder/users/123/');
        });

        it('deve logar um erro se o userId for inválido ou ausente', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            await cloudinary.deleteFolderUserFromCloudinary(undefined);

            expect(loggersMock.loggerMessage).toHaveBeenCalledWith('error', 'userId deve ser enviado');

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Erro ao deletar arquivos ou pasta: - index.ts:103',
                expect.any(HttpException)
            );

            consoleErrorSpy.mockRestore();
        });

        it('deve lidar com erros do Cloudinary ao deletar uma pasta', async () => {
            const mockError = new Error('Erro ao deletar pasta');
            cloudinaryMock.api.delete_folder.mockRejectedValue(mockError);

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            await cloudinary.deleteFolderUserFromCloudinary(123);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao deletar arquivos ou pasta: - index.ts:103', mockError);
            consoleErrorSpy.mockRestore(); 
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

    });

});

