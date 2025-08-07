import loggers from '../utils/loggers';
import exceptions from '../utils/exceptions';
import { HttpException, HttpStatus } from '@nestjs/common';

interface UploadFileDto {
    urlPathToUpload: string,
    base64: string
}

//models to urls users and products
// assets or files -> process.env.DROPBOX_URL_BASE_TO_UPLOAD_OR_DOWNLOAD/users/userIdOwnerAssets/assets/tipeFile - pdf - txt etc/nameMedia.jpeg
// user avatar -> process.env.DROPBOX_URL_BASE_TO_UPLOAD_OR_DOWNLOAD/users/userId/avatar/nameMedia.jpeg
// product -> process.env.DROPBOX_URL_BASE_TO_UPLOAD_OR_DOWNLOAD/users/userIdOwnerProduct/products/productId/nameMedia.jpeg

const uploadFileToDropbox = async (data: UploadFileDto) => {
    try {

        if (
            !data.urlPathToUpload.endsWith('.jpeg') &&
            !data.urlPathToUpload.endsWith('.mp4') &&
            !data.urlPathToUpload.endsWith('.pdf') &&
            !data.urlPathToUpload.endsWith('.txt')
        ) {
            loggers.loggerMessage('error', 'A apenas arquivos com extensão .jpeg, .mp4, .pdf ou .txt');
            throw new HttpException('A apenas arquivos com extensão .jpeg, .mp4, .pdf ou .txt', HttpStatus.BAD_REQUEST);
        }

        const cleanedBase64 = prepareBase64File(data.base64);
        const filePath = `${process.env.DROPBOX_URL_BASE_TO_UPLOAD_OR_DOWNLOAD}/${data.urlPathToUpload}`//data.urlPathToUpload// url destino do arquivo
        const fileContent = Buffer.from(cleanedBase64, 'base64');//converte um base64 em blob  

        // Upload do arquivo
        const uploadResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
                'Content-Type': 'application/octet-stream',
                'Dropbox-API-Arg': JSON.stringify({
                    path: filePath,
                    mode: 'overwrite',
                    autorename: true,
                    mute: false
                }),
            },
            body: fileContent
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload falhou: ${await uploadResponse.text()}`);
        }

        // Gerar URL compartilhável
        const shareResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: filePath,
                settings: {
                    requested_visibility: 'public',
                }
            }),
        });

        if (!shareResponse.ok) {
            throw new Error(`Falha ao gerar link compartilhavel: ${await shareResponse.text()}`);
        }

        const shareData = await shareResponse.json();
        return shareData.url.replace('?dl=0', '?dl=1');
    } catch (err) {
        loggers.loggerMessage('error', err.message || err);
        return exceptions.exceptionsReturn(err);
    }
};

const prepareBase64File = (base64String) => {
    // Verifica se há um prefixo do tipo "data:image/jpeg;base64,"
    const prefixPattern = /^data:image\/[a-z]+;base64,/;
    if (prefixPattern.test(base64String)) {
        return base64String.replace(prefixPattern, ''); // Remove o prefixo
    }
    return base64String; // Retorna sem alterações se não houver prefixo
};

const deleteFolderUserDropbox = async (userId: number) => {
    try {

        if (!userId || userId === undefined) {
            loggers.loggerMessage('error', 'userId deve ser enviado');
            throw new HttpException('userId deve ser enviado', HttpStatus.BAD_REQUEST);
        }
        const response = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: `${process.env.DROPBOX_URL_BASE_TO_UPLOAD_OR_DOWNLOAD}/users/${userId}`,  // Exemplo: "/folder_name"
            }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Pasta deletada com sucesso: - index.ts:109', data);
        } else {
            console.error('Falha ao deletar a pasta: - index.ts:111', data);
        }
    } catch (err) {
        loggers.loggerMessage('error', err.message || err);
        return exceptions.exceptionsReturn(err);
    }

};

const deleteFileDropbox = async (urlFileTodelete: string) => {
    // exemplo de envio -> users/userId/products/productId/name.jpge ou .txt etc... exemplo de url
    try {

        if (
            !urlFileTodelete.endsWith('.jpeg') &&
            !urlFileTodelete.endsWith('.mp4') &&
            !urlFileTodelete.endsWith('.pdf') &&
            !urlFileTodelete.endsWith('.txt')
        ) {
            loggers.loggerMessage('error', 'A URL não termina com .jpeg, .mp4, .pdf ou .txt');
            throw new HttpException('A URL não é válida, deve terminar com .jpeg, .mp4, .pdf ou .txt', HttpStatus.BAD_REQUEST);
        }

        const response = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: `${process.env.DROPBOX_URL_BASE_TO_UPLOAD_OR_DOWNLOAD}/${urlFileTodelete}`,  // Exemplo: "/folder_name"
            }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Media deletado com sucesso: - index.ts:148', data);
            return true
        } else {
            console.error('Falha ao deletar a media: - index.ts:151', data);
        }
    } catch (err) {
        loggers.loggerMessage('error', err.message || err);
        return exceptions.exceptionsReturn(err);
    }

};



export default {
    uploadFileToDropbox,
    deleteFolderUserDropbox,
    deleteFileDropbox,    
};