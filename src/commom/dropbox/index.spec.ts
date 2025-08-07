import dropbox from './index';
import { HttpException, HttpStatus } from '@nestjs/common';

// Mocks
// Moca o 'fetch' para simular as chamadas à API do Dropbox
const mockFetch = jest.fn();
global.fetch = mockFetch;

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

const loggersMock = require('../utils/loggers').default;
const exceptionsMock = require('../utils/exceptions').default;

describe('Dropbox Service', () => {
    const mockUploadData = {
        urlPathToUpload: 'users/123/image.jpeg',
        base64: 'data:image/jpeg;base64,mocked_base64_string',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Configura as variáveis de ambiente necessárias para todos os testes
        process.env.DROPBOX_URL_BASE_TO_UPLOAD_OR_DOWNLOAD = '/test_app';
        process.env.DROPBOX_ACCESS_TOKEN = 'mock_access_token';
    });

    // --- Testes para uploadFileToDropbox ---
    describe('uploadFileToDropbox', () => {
        it('deve fazer upload e retornar a URL compartilhada com sucesso', async () => {
            // Moca a resposta de upload e de compartilhamento para o caminho feliz
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(''),
            });
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ url: 'https://www.dropbox.com/s/mocked_url?dl=0' }),
            });

            const result = await dropbox.uploadFileToDropbox(mockUploadData);

            // Verifica se as chamadas de fetch foram feitas corretamente
            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(result).toBe('https://www.dropbox.com/s/mocked_url?dl=1');
        });

        it('deve retornar um erro para arquivos com extensão inválida', async () => {
            const invalidData = { ...mockUploadData, urlPathToUpload: 'users/123/arquivo.zip' };
            const expectedError = new HttpException(
                'A apenas arquivos com extensão .jpeg, .mp4, .pdf ou .txt',
                HttpStatus.BAD_REQUEST
            );
            exceptionsMock.exceptionsReturn.mockReturnValue(expectedError);

            const result = await dropbox.uploadFileToDropbox(invalidData);

            expect(loggersMock.loggerMessage).toHaveBeenCalledWith('error', 'A apenas arquivos com extensão .jpeg, .mp4, .pdf ou .txt');
            expect(result).toEqual(expectedError);
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('deve lidar com falha durante o upload', async () => {
            const error = new Error('Upload falhou: Erro simulado');
            mockFetch.mockResolvedValueOnce({
                ok: false,
                text: () => Promise.resolve('Erro simulado'),
            });
            exceptionsMock.exceptionsReturn.mockReturnValue(new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR));

            const result = await dropbox.uploadFileToDropbox(mockUploadData);

            expect(result).toBeInstanceOf(HttpException);
            expect(result.message).toBe('Upload falhou: Erro simulado');
        });

        it('deve lidar com falha ao gerar o link compartilhado', async () => {
            const error = new Error('Falha ao gerar link compartilhavel: Erro simulado');
            // Moca a primeira chamada de upload para ter sucesso
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(''),
            });
            // Moca a segunda chamada de compartilhamento para falhar
            mockFetch.mockResolvedValueOnce({
                ok: false,
                text: () => Promise.resolve('Erro simulado'),
            });
            exceptionsMock.exceptionsReturn.mockReturnValue(new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR));

            const result = await dropbox.uploadFileToDropbox(mockUploadData);

            expect(result).toBeInstanceOf(HttpException);
            expect(result.message).toBe('Falha ao gerar link compartilhavel: Erro simulado');
        });
    });

    // --- Testes para deleteFolderUserDropbox ---
    describe('deleteFolderUserDropbox', () => {
        it('deve deletar a pasta do usuário com sucesso', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ status: 'ok' }),
            });

            await dropbox.deleteFolderUserDropbox(123);

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(consoleLogSpy).toHaveBeenCalledWith('Pasta deletada com sucesso:', { status: 'ok' });
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.dropboxapi.com/2/files/delete_v2',
                expect.objectContaining({
                    body: JSON.stringify({ path: '/test_app/users/123' }),
                })
            );
            consoleLogSpy.mockRestore();
        });

        it('deve retornar um erro se o userId for inválido ou ausente', async () => {
            const expectedError = new HttpException('userId deve ser enviado', HttpStatus.BAD_REQUEST);
            exceptionsMock.exceptionsReturn.mockReturnValue(expectedError);

            const result = await dropbox.deleteFolderUserDropbox(undefined);

            expect(loggersMock.loggerMessage).toHaveBeenCalledWith('error', 'userId deve ser enviado');
            expect(result).toEqual(expectedError);
            expect(mockFetch).not.toHaveBeenCalled();
        });
    });

    // --- Testes para deleteFileDropbox ---
    describe('deleteFileDropbox', () => {
        it('deve deletar um arquivo com sucesso', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ status: 'ok' }),
            });

            const result = await dropbox.deleteFileDropbox('users/123/image.jpeg');

            expect(result).toBe(true);
            expect(consoleLogSpy).toHaveBeenCalledWith('Media deletado com sucesso:', { status: 'ok' });
            expect(mockFetch).toHaveBeenCalledTimes(1);
            consoleLogSpy.mockRestore();
        });

        it('deve retornar um erro se a URL do arquivo for inválida', async () => {
            const expectedError = new HttpException(
                'A URL não é válida, deve terminar com .jpeg, .mp4, .pdf ou .txt',
                HttpStatus.BAD_REQUEST
            );
            exceptionsMock.exceptionsReturn.mockReturnValue(expectedError);

            const result = await dropbox.deleteFileDropbox('users/123/arquivo.zip');

            expect(result).toEqual(expectedError);
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('deve lidar com falhas do Dropbox ao deletar um arquivo', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const mockErrorResponse = { error: 'file_not_found' };
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve(mockErrorResponse),
            });

            await dropbox.deleteFileDropbox('users/123/image.jpeg');

            expect(consoleErrorSpy).toHaveBeenCalledWith('Falha ao deletar a media:', mockErrorResponse);
            consoleErrorSpy.mockRestore();
        });
    });
});