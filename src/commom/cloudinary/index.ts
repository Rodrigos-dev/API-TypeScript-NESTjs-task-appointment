import loggers from '../utils/loggers';
import exceptions from '../utils/exceptions';
import { HttpException, HttpStatus } from '@nestjs/common';

interface UploadFileDto {
    urlPathToUpload: string, 
    nameFile: string,
    base64: string
}

const cloudinary = require('cloudinary').v2; // Certifique-se de ter o node-fetch instalado

let folderApiName = null

const initConfigCloudnary = async () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    folderApiName = process.env.ENVIRONMENT === 'development' ? process.env.FOLDER_API_NAME_CLOUDNARY_DEV : process.env.FOLDER_API_NAME_CLOUDNARY_PROD
}

const generateSignedUploadUrl = async (urlDestination: string, nameFile?: string) => {
    const timestamp = Math.floor(Date.now() / 1000); 
    
    const signature = cloudinary.utils.api_sign_request(
        { timestamp, urlDestination, public_id: nameFile, resource_type: 'auto' }, 
        process.env.CLOUDINARY_API_SECRET,
    );

    // Retorna a URL fixa e os parâmetros necessários para o upload
    return {
        url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`, // URL fixa para upload
        params: {
            timestamp,
            urlDestination,
            public_id: nameFile, 
            resource_type: 'auto', 
            api_key: process.env.CLOUDINARY_API_KEY,
            signature,
        },
    };
};

const uploadFileToCloudinary = async (data: UploadFileDto) => {
    try {
        if (
            !data.nameFile.endsWith('.jpeg') &&
            !data.nameFile.endsWith('.mp4') &&
            !data.nameFile.endsWith('.pdf') &&
            !data.nameFile.endsWith('.txt')
        ) {
            throw new HttpException('Apenas arquivos com extensão .jpeg, .mp4, .pdf ou .txt são permitidos', HttpStatus.BAD_REQUEST);
        }

        // Limpeza do Base64
        //const cleanedBase64 = prepareBase64File(data.base64);
        
        const result = await cloudinary.uploader.upload(data.base64, {
            folder: `${folderApiName}/${data.urlPathToUpload}`,
            public_id: data.nameFile, 
            resource_type: 'auto', 
            overwrite: true, 
            eager: [{ width: 500, height: 500, crop: 'limit' }] 
        });

        return result.secure_url 

    } catch (err) {
        loggers.loggerMessage('error', err);
        return exceptions.exceptionsReturn(err);
    }
};

// Função auxiliar para limpar o prefixo base64
// const prepareBase64File = (base64String: string) => {
//     const prefixPattern = /^data:image\/[a-z]+;base64,/;
//     if (prefixPattern.test(base64String)) {
//         return base64String.replace(prefixPattern, ''); // Remove o prefixo
//     }
//     return base64String; // Retorna sem alterações se não houver prefixo
// };

const deleteFolderUserFromCloudinary = async (userId: number) => {
    try {

        if (!userId || userId === undefined) {
            loggers.loggerMessage('error', 'userId deve ser enviado');
            throw new HttpException('userId deve ser enviado', HttpStatus.BAD_REQUEST);
        }

        //OBS: modelo da url para apagar tudo que tiver dendro dela -> `users/userId/` -> tem que ser assim sem barr inicial e com barra no final perceba
        
        //apagar td os arquivos debtro da pasta incluindo subpastas
        const resources = await cloudinary.api.delete_resources_by_prefix(`${folderApiName}/users/${userId}/`)

        // Passo 3: Deletar a pasta depois de remover os arquivos
        const deleteFolderResponse = await cloudinary.api.delete_folder(`${folderApiName}/users/${userId}/`);
        console.log('Pasta deletada com sucesso: - index.ts:101', deleteFolderResponse);
    } catch (error) {
        console.error('Erro ao deletar arquivos ou pasta: - index.ts:103', error);
    }
};

const deleteFileFromCloudinary = async (urlPathToDelete: string) => {
    try {

        if (
            !urlPathToDelete.endsWith('.jpeg') &&
            !urlPathToDelete.endsWith('.mp4') &&
            !urlPathToDelete.endsWith('.pdf') &&
            !urlPathToDelete.endsWith('.txt')
        ) {
            throw new HttpException('Apenas arquivos com extensão .jpeg, .mp4, .pdf ou .txt são permitidos', HttpStatus.BAD_REQUEST);
        }


        // Deleta o arquivo do Cloudinary usando o caminho (public_id)
        const result = await cloudinary.uploader.destroy(`${folderApiName}/${urlPathToDelete}`);
        if (result.result === 'ok') {
            console.log('Arquivo deletado com sucesso: - index.ts:123', result);
            return true;
        } else {
            loggers.loggerMessage('error', 'Falha ao deletar arquivo do Cloudinary');
            throw new HttpException('Falha ao deletar arquivo do Cloudinary', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } catch (err) {
        loggers.loggerMessage('error', err.message || err);
        return exceptions.exceptionsReturn(err);
    }
};

export default {
    generateSignedUploadUrl,
    initConfigCloudnary,
    uploadFileToCloudinary,
    deleteFileFromCloudinary,
    deleteFolderUserFromCloudinary    
};