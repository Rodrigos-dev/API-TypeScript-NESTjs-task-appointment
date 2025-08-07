import { Test, TestingModule } from '@nestjs/testing';
import { DeviceRegisterController } from './device-register.controller';
import { DeviceRegisterService } from './device-register.service';
import { CreateDeviceRegisterDto } from './dto/create-device-register.dto';
import { UpdateDeviceRegisterDto } from './dto/update-device-register.dto';
import { SystemType } from './entities/device-register.entity';


// Mock do DeviceRegisterService para isolar o teste do controller
const mockDeviceRegisterService = {
    createOrUpdateRegisterToken: jest.fn(),
    findAllTokenRegisters: jest.fn(),
    getOneByUserOwnerRegisterId: jest.fn(),
    remove: jest.fn(),
};

describe('DeviceRegisterController', () => {
    let controller: DeviceRegisterController;
    let service: DeviceRegisterService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DeviceRegisterController],
            providers: [
                {
                    provide: DeviceRegisterService,
                    useValue: mockDeviceRegisterService,
                },
            ],
        }).compile();

        controller = module.get<DeviceRegisterController>(DeviceRegisterController);
        service = module.get<DeviceRegisterService>(DeviceRegisterService);
        jest.clearAllMocks();
    });

    it('deve estar definido', () => {
        expect(controller).toBeDefined();
    });

    // --- Teste do endpoint POST /device-register ---
    describe('create', () => {
        it('deve chamar createOrUpdateRegisterToken do serviço com o DTO correto', async () => {
            const mockDto: CreateDeviceRegisterDto = {
                userId: 1,
                token: 'mock-token-123',
                systemType: SystemType.ANDROID,
            };

            // O mockResult foi corrigido para usar a propriedade `deletedAt`
            const mockResult = {
                id: 1,
                userId: 1,
                token: 'mock-token-123',
                systemType: SystemType.ANDROID,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null, // Nome da propriedade corrigido
            };
            jest.spyOn(service, 'createOrUpdateRegisterToken').mockResolvedValue(mockResult);

            const result = await controller.create(mockDto);

            expect(service.createOrUpdateRegisterToken).toHaveBeenCalledWith(mockDto);
            expect(result).toEqual(mockResult);
        });
    });

    // --- Teste do endpoint GET /device-register ---
    describe('findAllTokenRegisters', () => {
        it('deve chamar findAllTokenRegisters do serviço com os parâmetros de query corretos', async () => {
            const mockQuery = { page: 1, take: 10, orderBy: 'ASC' };
            const mockResult = { data: [], total: 0 };
            jest.spyOn(service, 'findAllTokenRegisters').mockResolvedValue(mockResult as any);

            const result = await controller.findAllTokenRegisters(mockQuery as any);

            expect(service.findAllTokenRegisters).toHaveBeenCalledWith(mockQuery);
            expect(result).toEqual(mockResult);
        });
    });

    // --- Teste do endpoint GET /device-register/:userIdOwnerRegisterToken ---
    describe('getOneByUserOwnerRegisterId', () => {
        it('deve chamar getOneByUserOwnerRegisterId do serviço com o userId correto', async () => {
            const mockUserId = 1;
            const mockResult = { id: 1, userId: 1, token: 'mock-token-123', systemType: SystemType.ANDROID };
            jest.spyOn(service, 'getOneByUserOwnerRegisterId').mockResolvedValue(mockResult as any);

            // O @Param do NestJS converte o valor para número, então o teste deve passar um número
            const result = await controller.getOneByUserOwnerRegisterId(mockUserId);

            expect(service.getOneByUserOwnerRegisterId).toHaveBeenCalledWith(mockUserId);
            expect(result).toEqual(mockResult);
        });
    });

    // --- Teste do endpoint DELETE /device-register/:userIdOwnerRegisterToken/ ---
    describe('remove', () => {
        it('deve chamar o método remove do serviço com o userId correto', async () => {
            const mockUserId = 1;
            const mockResult = { deleted: true };
            jest.spyOn(service, 'remove').mockResolvedValue(mockResult as any);

            // O @Param do NestJS converte o valor para número, então o teste deve passar um número
            const result = await controller.remove(mockUserId);

            expect(service.remove).toHaveBeenCalledWith(mockUserId);
            expect(result).toEqual(mockResult);
        });
    });
});