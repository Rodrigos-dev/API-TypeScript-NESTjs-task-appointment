import firebaseService from './index';
import { HttpException, HttpStatus } from '@nestjs/common';
import loggers from '../utils/loggers';
import exceptions from '../utils/exceptions';

// Mocks
// Cria um mock de objeto para a API de messaging
const mockMessaging = {
    sendEachForMulticast: jest.fn(),
};

// Configura o mock do firebase-admin para retornar a mesma instância
// do objeto de messaging toda vez que for chamado
jest.mock('firebase-admin', () => ({
    messaging: () => mockMessaging,
}));

// Moca os utilitários de log e exceções
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

// Importa os mocks para facilitar o uso nos testes
const loggersMock = require('../utils/loggers').default;
const exceptionsMock = require('../utils/exceptions').default;

describe('Firebase Service', () => {
    const mockNotificationData = {
        tokens: ['token1', 'token2'],
        notification: {
            title: 'Test Title',
            body: 'Test Body',
        },
        data: {
            key1: 'value1',
        },
    };

    beforeEach(() => {
        // Limpa o estado dos mocks antes de cada teste
        jest.clearAllMocks();
    });

    it('deve enviar uma notificação push com sucesso e retornar a resposta', async () => {
        const mockResponse = {
            successCount: 2,
            failureCount: 0,
            responses: [{ success: true }, { success: true }],
        };
        // Aplica o mock na instância única
        mockMessaging.sendEachForMulticast.mockResolvedValue(mockResponse);

        const result = await firebaseService.postPushNotification(mockNotificationData);

        expect(mockMessaging.sendEachForMulticast).toHaveBeenCalledWith({
            tokens: mockNotificationData.tokens,
            notification: mockNotificationData.notification,
            data: mockNotificationData.data,
        });
        expect(result).toEqual(mockResponse);
        expect(loggersMock.loggerMessage).toHaveBeenCalledWith('detail', JSON.stringify(mockResponse));
    });

    it('deve lidar com erros ao enviar uma notificação push', async () => {
        const mockError = new Error('Erro do Firebase');
        mockMessaging.sendEachForMulticast.mockRejectedValue(mockError);

        const expectedException = new HttpException(mockError.message, HttpStatus.INTERNAL_SERVER_ERROR);
        exceptionsMock.exceptionsReturn.mockReturnValue(expectedException);

        const result = await firebaseService.postPushNotification(mockNotificationData);

        expect(loggersMock.loggerMessage).toHaveBeenCalledWith('error', mockError);
        expect(result).toEqual(expectedException);
    });
});