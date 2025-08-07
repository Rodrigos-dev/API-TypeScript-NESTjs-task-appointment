import { Test, TestingModule } from '@nestjs/testing';
import { BucketService } from './bucket.service';
import { nanoid } from 'nanoid';
import { FolderNameType, TypeFileUpload } from 'src/commom/enums/bucket-enums';
import cloudinary from 'src/commom/cloudinary';
import timestampGenerator from 'src/commom/utils/timestampGenerator';
import exceptions from 'src/commom/utils/exceptions';
import loggers from 'src/commom/utils/loggers';

// Mocka as dependências externas para evitar chamadas reais
jest.mock('nanoid');
jest.mock('src/commom/cloudinary');
jest.mock('src/commom/utils/timestampGenerator');
jest.mock('src/commom/utils/exceptions');
jest.mock('src/commom/utils/loggers');

describe('BucketService', () => {
  let service: BucketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BucketService],
    }).compile();

    service = module.get<BucketService>(BucketService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('getUrlSigneds', () => {

    it('deve retornar URLs assinadas para upload de imagens com sucesso', async () => {
      process.env.ENVIRONMENT = 'development';
      process.env.FOLDER_API_NAME_CLOUDNARY_DEV = 'teste-folder-api-cloudinary';

      const mockMasterCode = 'master-code';
      const mockItemCode = 'item-code';
      const mockTimestamp = '12345';

      // Configurando os mocks para retornar os valores definidos acima
      (nanoid as jest.Mock)
        .mockReturnValueOnce(mockMasterCode)
        .mockReturnValueOnce(mockItemCode);
      (timestampGenerator.generateTimestamp as jest.Mock).mockResolvedValue(mockTimestamp);
      (cloudinary.generateSignedUploadUrl as jest.Mock).mockResolvedValue({
        url: 'https://teste-url-cloudinary.com/signed',
        public_id: 'public-id',
      });

      const dataDto = {
        userId: 123,
        folderNameType: FolderNameType.ADVERTISEMENTS,
        itemsToUploadMedias: [
          {
            mediasUpload: [{ type: TypeFileUpload.IMAGE }],
          },
        ],
      };

      const result = await service.getUrlSigneds(dataDto);

      expect(nanoid).toHaveBeenCalledTimes(2);
      expect(timestampGenerator.generateTimestamp).toHaveBeenCalled();
      expect(cloudinary.generateSignedUploadUrl).toHaveBeenCalledWith(
        `${process.env.FOLDER_API_NAME_CLOUDNARY_DEV}/users/${dataDto.userId}/${dataDto.folderNameType}/${dataDto.userId}_${mockMasterCode}/${dataDto.userId}_${mockItemCode}/media-${dataDto.userId}_${mockTimestamp}.jpeg`,
        `media-${dataDto.userId}_${mockTimestamp}.jpeg`,
      );

      expect(result).toEqual({
        itemMasterCode: `${dataDto.userId}_${mockMasterCode}`,
        description: expect.any(String),
        items: [
          {
            itemCode: `${dataDto.userId}_${mockItemCode}`,
            description: expect.any(String),
            urlsSigneds: [
              {
                url: 'https://teste-url-cloudinary.com/signed',
                public_id: 'public-id',
              },
            ],
          },
        ],
      });
    });

    it('deve retornar URLs assinadas para múltiplos arquivos de diferentes tipos', async () => {
      // Mockando valores
      (nanoid as jest.Mock)
        .mockReturnValueOnce('master-code')
        .mockReturnValueOnce('item-code-1')
        .mockReturnValueOnce('item-code-2');
      (timestampGenerator.generateTimestamp as jest.Mock)
        .mockResolvedValueOnce('ts1')
        .mockResolvedValueOnce('ts2');
      (cloudinary.generateSignedUploadUrl as jest.Mock).mockResolvedValue({
        url: 'https://cloudinary.com/signed-url',
        public_id: 'public-id',
      });

      // Dados de entrada
      const dataDto = {
        userId: 456,
        folderNameType: FolderNameType.ADVERTISEMENTS,
        itemsToUploadMedias: [
          {
            mediasUpload: [
              { type: TypeFileUpload.VIDEO },
              { type: TypeFileUpload.PDF },
            ],
          },
        ],
      };

      const result = await service.getUrlSigneds(dataDto);

      // Verificando os resultados
      expect(nanoid).toHaveBeenCalledTimes(2); // CORRIGIDO: O nanoid é chamado apenas 2 vezes com esse input
      expect(timestampGenerator.generateTimestamp).toHaveBeenCalledTimes(2);
      expect(cloudinary.generateSignedUploadUrl).toHaveBeenCalledTimes(2);

      if (result && 'items' in result) {
        expect(result.items[0].urlsSigneds.length).toBe(2);
      } else {
        fail('O resultado não possui a propriedade items ou é nulo.');
      }
    });

    it('deve capturar e retornar exceção em caso de falha', async () => {
      // Mockando um erro
      const error = new Error('Erro de teste');
      (nanoid as jest.Mock).mockReturnValue('master-code');
      (timestampGenerator.generateTimestamp as jest.Mock).mockRejectedValue(error);
      (exceptions.exceptionsReturn as jest.Mock).mockReturnValue({
        status: 500,
        message: 'Erro interno',
      });

      // Dados de entrada
      const dataDto = {
        userId: 678,
        folderNameType: FolderNameType.ADVERTISEMENTS,
        itemsToUploadMedias: [
          {
            mediasUpload: [{ type: TypeFileUpload.IMAGE }],
          },
        ],
      };

      // Executando o método
      const result = await service.getUrlSigneds(dataDto);

      // Verificando se o erro foi tratado
      expect(loggers.loggerMessage).toHaveBeenCalledWith('error', error);
      expect(exceptions.exceptionsReturn).toHaveBeenCalledWith(error);
      expect(result).toEqual({ status: 500, message: 'Erro interno' });
    });

    it('deve pular arquivos com tipo inválido', async () => {
      // Mockando valores
      (nanoid as jest.Mock)
        .mockReturnValueOnce('master-code')
        .mockReturnValueOnce('item-code');
      (timestampGenerator.generateTimestamp as jest.Mock).mockResolvedValue('12345');

      // Mock para simular o retorno da função, mas ela não deve ser chamada
      const generateUrlSpy = jest.spyOn(cloudinary, 'generateSignedUploadUrl');

      // Dados de entrada com um tipo inválido
      const dataDto = {
        userId: 123,
        folderNameType: FolderNameType.ADVERTISEMENTS,
        itemsToUploadMedias: [
          {
            mediasUpload: [
              { type: 'INVALID_TYPE' as any }, // Simula um tipo inválido
              { type: TypeFileUpload.IMAGE }, // Um tipo válido para garantir que o array não está vazio
            ],
          },
        ],
      };

      // Executando o método
      await service.getUrlSigneds(dataDto);

      // Verificando que a chamada para gerar URL só aconteceu para o arquivo válido
      expect(generateUrlSpy).toHaveBeenCalledTimes(1);
    });

    it('deve usar o nome da pasta de produção quando o ambiente não for development', async () => {
      process.env.ENVIRONMENT = 'production';
      process.env.FOLDER_API_NAME_CLOUDNARY_PROD = 'apiBancoTypeOrmIniciado_prod';

      const mockMasterCode = 'master-code-prod';
      const mockItemCode = 'item-code-prod';
      const mockTimestamp = '67890';

      (nanoid as jest.Mock)
        .mockReturnValueOnce(mockMasterCode)
        .mockReturnValueOnce(mockItemCode);
      (timestampGenerator.generateTimestamp as jest.Mock).mockResolvedValue(mockTimestamp);
      (cloudinary.generateSignedUploadUrl as jest.Mock).mockResolvedValue({
        url: 'https://cloudinary.com/signed-url-prod',
        public_id: 'public-id-prod',
      });

      const dataDto = {
        userId: 987,
        folderNameType: FolderNameType.ADVERTISEMENTS,
        itemsToUploadMedias: [
          {
            mediasUpload: [{ type: TypeFileUpload.IMAGE }],
          },
        ],
      };

      await service.getUrlSigneds(dataDto);

      // Verificando se a URL de upload usa a pasta de produção
      expect(cloudinary.generateSignedUploadUrl).toHaveBeenCalledWith(
        `${process.env.FOLDER_API_NAME_CLOUDNARY_PROD}/users/${dataDto.userId}/${dataDto.folderNameType}/${dataDto.userId}_${mockMasterCode}/${dataDto.userId}_${mockItemCode}/media-${dataDto.userId}_${mockTimestamp}.jpeg`,
        `media-${dataDto.userId}_${mockTimestamp}.jpeg`,
      );
    });
  });
});