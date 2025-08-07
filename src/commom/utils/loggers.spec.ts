import { Logger } from '@nestjs/common';
import loggers from './loggers';

// Mocks
// 1. Cria uma única instância mockada da classe Logger
const mockLoggerInstance = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
};

// 2. Moca a classe Logger para retornar a instância única sempre
jest.mock('@nestjs/common', () => ({
    Logger: jest.fn(() => mockLoggerInstance),
}));


describe('Loggers Utility', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve chamar o método log para o tipo "info"', async () => {
        const message = 'Mensagem informativa';
        await loggers.loggerMessage('info', message);
        // Agora, o expect usa a instância única que a função também usa
        expect(mockLoggerInstance.log).toHaveBeenCalledWith(message, 'INFO');
    });

    it('deve chamar o método error para o tipo "error"', async () => {
        const message = 'Mensagem de erro';
        await loggers.loggerMessage('error', message);
        expect(mockLoggerInstance.error).toHaveBeenCalledWith(message, 'ERROR');
    });

    it('deve chamar o método warn para o tipo "warn"', async () => {
        const message = 'Mensagem de aviso';
        await loggers.loggerMessage('warn', message);
        expect(mockLoggerInstance.warn).toHaveBeenCalledWith(message, 'WARN');
    });

    it('deve chamar o método debug para o tipo "debug"', async () => {
        const message = 'Mensagem de debug';
        await loggers.loggerMessage('debug', message);
        expect(mockLoggerInstance.debug).toHaveBeenCalledWith(message, 'DEBUG');
    });

    it('deve chamar o método verbose para o tipo "detail"', async () => {
        const message = 'Mensagem detalhada';
        await loggers.loggerMessage('detail', message);
        expect(mockLoggerInstance.verbose).toHaveBeenCalledWith(message, 'DETAIL');
    });

    it('deve chamar o método log para um tipo de mensagem desconhecido', async () => {
        const message = 'Mensagem desconhecida';
        await loggers.loggerMessage('desconhecido' as any, message);
        expect(mockLoggerInstance.log).toHaveBeenCalledWith(`Unknown message type: desconhecido - ${message}`);
    });
});