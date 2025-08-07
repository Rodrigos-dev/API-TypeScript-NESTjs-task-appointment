import timestampGenerator from './timestampGenerator';
import loggers from './loggers';
import exceptions from './exceptions';
import { HttpException, HttpStatus } from '@nestjs/common';

// Mocks
jest.mock('./loggers', () => ({
    default: {
        loggerMessage: jest.fn(),
    },
}));

jest.mock('./exceptions', () => ({
    default: {
        exceptionsReturn: jest.fn(),
    },
}));

const loggersMock = require('./loggers').default;
const exceptionsMock = require('./exceptions').default;

describe('Timestamp Generator Utility', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        // Moca Date.now() para um valor fixo, garantindo previsibilidade no teste
        jest.spyOn(Date, 'now').mockReturnValue(1672531200000); // 1 de Janeiro de 2023, 00:00:00 GMT
    });

    afterEach(() => {
        // Restaura o mock de Date.now() para não afetar outros testes
        jest.restoreAllMocks();
    });

    it('deve gerar e retornar o timestamp atual em segundos', async () => {
        const expectedTimestamp = 1672531200; // 1672531200000 / 1000

        const timestamp = await timestampGenerator.generateTimestamp();

        // Verifica se o valor retornado é o timestamp esperado
        expect(timestamp).toBe(expectedTimestamp);
    });

    it('deve lidar com erros e retornar uma exceção', async () => {
        // Simula um erro ao chamar Date.now()
        const mockError = new Error('Erro ao obter a data');
        jest.spyOn(Date, 'now').mockImplementation(() => {
            throw mockError;
        });

        // Configura o mock de exceptionsReturn para retornar um HttpException
        const expectedException = new HttpException(mockError.message, HttpStatus.INTERNAL_SERVER_ERROR);
        exceptionsMock.exceptionsReturn.mockReturnValue(expectedException);

        const result = await timestampGenerator.generateTimestamp();

        // Cobre o bloco catch e verifica se o log e a exceção foram chamados
        expect(loggersMock.loggerMessage).toHaveBeenCalledWith('error', mockError);
        expect(exceptionsMock.exceptionsReturn).toHaveBeenCalledWith(mockError);
        expect(result).toEqual(expectedException);
    });
});