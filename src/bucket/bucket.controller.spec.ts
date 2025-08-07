import { Test, TestingModule } from '@nestjs/testing';
import { BucketController } from './bucket.controller';
import { BucketService } from './bucket.service';
import { CreateUrlSignedBucketDto, ItemToUploadMediasDto, MediasUploadDto } from './dto/create-bucket.dto';
import { FolderNameType, TypeFileUpload } from 'src/commom/enums/bucket-enums';

// Mock do BucketService para isolar o teste do controller
const mockBucketService = {
  getUrlSigneds: jest.fn(),
};

describe('BucketController', () => {
  let controller: BucketController;
  let service: BucketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BucketController],
      providers: [
        {
          provide: BucketService,
          useValue: mockBucketService,
        },
      ],
    }).compile();

    controller = module.get<BucketController>(BucketController);
    service = module.get<BucketService>(BucketService);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getUrlSigneds', () => {
    it('deve chamar o método getUrlSigneds do serviço com o DTO correto', async () => {
      // Simula o DTO aninhado exatamente como no seu arquivo original
      const mockMediasUploadDto: MediasUploadDto = {
        type: TypeFileUpload.IMAGE,
      };

      const mockItemToUploadMediasDto: ItemToUploadMediasDto = {
        mediasUpload: [mockMediasUploadDto],
      };

      const mockDto: CreateUrlSignedBucketDto = {
        userId: 123,
        folderNameType: FolderNameType.ADVERTISEMENTS,
        itemsToUploadMedias: [mockItemToUploadMediasDto],
      };
      
      // O mockResult foi ajustado para ter a estrutura correta do seu serviço
      const mockResult = {
        itemMasterCode: 'mock_code',
        description: 'URLs assinadas para upload',
        items: [
          {
            url: 'https://bucket.com/123/avatar/image.jpeg?token=abc',
            type: TypeFileUpload.IMAGE,
          },
        ],
      };
      
      // Simula o retorno do serviço
      jest.spyOn(service, 'getUrlSigneds').mockResolvedValue(mockResult);

      const result = await controller.getUrlSigneds(mockDto);

      // Verifica se o método getUrlSigneds do serviço foi chamado com o DTO correto
      expect(service.getUrlSigneds).toHaveBeenCalledWith(mockDto);
      // Verifica se o controller retornou o resultado do serviço
      expect(result).toEqual(mockResult);
    });
  });
});