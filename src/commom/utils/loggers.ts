import { Logger } from '@nestjs/common';

async function loggerMessage(typeMessage: 'error' | 'info' | 'warn' | 'debug' | 'detail', message: string) {
  const logger = new Logger(loggerMessage.name);
 
    switch (typeMessage) {
      case 'info':
        logger.log(message, 'INFO'); // Exibe mensagem informativa
        break;
      case 'error':
        logger.error(message, 'ERROR'); // Exibe erro
        break;
      case 'warn':
        logger.warn(message, 'WARN'); // Exibe aviso
        break;
      case 'debug':
        logger.debug(message, 'DEBUG'); // Exibe debug (útil em desenvolvimento)
        break; 
      case 'detail':  // 'detail' pode mapear para verbose
        logger.verbose(message, 'DETAIL'); // Exibe mensagens detalhadas
        break;
      default:
        logger.log(`Unknown message type: ${typeMessage} - ${message}`);
        break;    
  }
}

export default {
    loggerMessage
}