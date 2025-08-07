import exceptions from './exceptions';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('Exceptions Return Utility', () => {

    // --- Cenário 1: Erro de driver (err.driverError) ---
    it('deve lançar HttpException com status 500 para erro de driver', async () => {
        const mockError = { driverError: 'Erro de conexão com o banco de dados' };
        
        await expect(async () => {
            await exceptions.exceptionsReturn(mockError);
        }).rejects.toThrow(new HttpException(mockError.driverError, HttpStatus.INTERNAL_SERVER_ERROR));
    });

    // --- Cenário 2: Erro HTTP Client-side ou Server-side (status 300-499) ---
    it('deve relançar o erro original se o status estiver entre 300 e 499', async () => {
        const mockError = new HttpException('Recurso não encontrado', HttpStatus.NOT_FOUND);
        
        await expect(async () => {
            await exceptions.exceptionsReturn(mockError);
        }).rejects.toThrow(mockError);
    });

    // --- Cenário 3: Erro com uma mensagem genérica (err.message) ---
    it('deve lançar HttpException com status 500 para erro com apenas uma mensagem', async () => {
        const mockError = new Error('Falha na requisição');
        
        const expectedResponse = {
            message: mockError.message,
            response: null
        };
        
        await expect(async () => {
            await exceptions.exceptionsReturn(mockError);
        }).rejects.toThrow(new HttpException(expectedResponse, HttpStatus.INTERNAL_SERVER_ERROR));
    });

    // --- Cenário 4: Erro com mensagem e resposta de erro da API
    it('deve lançar HttpException com status 500 e resposta detalhada', async () => {
        const mockError = {
            message: 'Erro interno',
            response: {
                data: {
                    error_messages: ['Campo obrigatório ausente', 'Formato inválido']
                }
            }
        };

        const expectedResponse = {
            message: mockError.message,
            response: mockError.response.data.error_messages
        };

        await expect(async () => {
            await exceptions.exceptionsReturn(mockError);
        }).rejects.toThrow(new HttpException(expectedResponse, HttpStatus.INTERNAL_SERVER_ERROR));
    });

    // --- Cenário 5: Erro genérico (final 'else') ---
    it('deve lançar HttpException com status 500 para erro não tratado', async () => {
        const mockError = 'Erro desconhecido';

        await expect(async () => {
            await exceptions.exceptionsReturn(mockError);
        }).rejects.toThrow(new HttpException(mockError, HttpStatus.INTERNAL_SERVER_ERROR));
    });
});