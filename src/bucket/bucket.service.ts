import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { CreateUrlSignedBucketDto } from './dto/create-bucket.dto';
import { TypeFileUpload } from 'src/commom/enums/bucket-enums';
import cloudinary from 'src/commom/cloudinary';
import loggers from 'src/commom/utils/loggers';
import exceptions from 'src/commom/utils/exceptions';
import timestampGenerator from 'src/commom/utils/timestampGenerator';


@Injectable()
export class BucketService {

  async getUrlSigneds(dataDto: CreateUrlSignedBucketDto) {
    try {

      let returnData = []

      const uniqueCodeMaster = nanoid();

      const folderMasterCodeNameUploadMedia = `${dataDto.userId}_${uniqueCodeMaster}`

      for await (const file of dataDto.itemsToUploadMedias) {

        const uniqueCode = nanoid();

        const folderCodeNameUploadMedia = `${dataDto.userId}_${uniqueCode}`

        const urlsSigneds = []

        if (file.mediasUpload.length > 0) {

          for await (const mediaUpload of file.mediasUpload) {

            const timestamp = await timestampGenerator.generateTimestamp()

            let typeExtension = null

            if (mediaUpload.type === TypeFileUpload.IMAGE) {
              typeExtension = 'jpeg'
            }

            else if (mediaUpload.type === TypeFileUpload.VIDEO) {
              typeExtension = 'mp4'
            }

            else if (mediaUpload.type === TypeFileUpload.PDF) {
              typeExtension = 'pdf'
            }

            if (!typeExtension) {
              continue
            }

            const nameFile = `media-${dataDto.userId}_${timestamp}.${typeExtension}`

            const folderApiName = process.env.ENVIRONMENT === 'development' ? process.env.FOLDER_API_NAME_CLOUDNARY_DEV : process.env.FOLDER_API_NAME_CLOUDNARY_PROD

            const destinationFolder = `${folderApiName}/users/${dataDto.userId}/${dataDto.folderNameType}/${folderMasterCodeNameUploadMedia}/${folderCodeNameUploadMedia}/${nameFile}`

            let urlObjectReturned = await cloudinary.generateSignedUploadUrl(destinationFolder, nameFile)

            urlsSigneds.push(urlObjectReturned)
          }
        }

        returnData.push({
          itemCode: folderCodeNameUploadMedia,
          description: "retorna o destino url com o nome do arquivo já pronto, retorno o nome do arquivo com extensao no public_id, e tambem o código do anúncio para enviar no criar anúncio, esse codigo deve ser enviado no objeto de criacao do item para encontrarmos seus arquivos no bucket",
          urlsSigneds: urlsSigneds
        })

      }

      return {
        itemMasterCode: folderMasterCodeNameUploadMedia,
        description: 'itemMasterCode para enviar na criação do anúncio por exemplo ou qualquer outro item para caso seja um grupo de anúncios por exemplo no bucket conseguir gerar esse grupo de anúncio dentro desse code pasta e quando for apagar apagar tudo pela pasta diretamente, sempre enviar para que tenha 1 ou mais anúncios ele tenha essa pasta',
        items: returnData
      }

    } catch (err) {
      loggers.loggerMessage('error', err)
      return exceptions.exceptionsReturn(err)
    }
  }

}
