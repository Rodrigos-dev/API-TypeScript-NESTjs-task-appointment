export default {
    // Configuração de conexão com o Redis usando variáveis de ambiente
    redis: {
        host: process.env.REDIS_HOST, // Define o host do Redis usando uma variável de ambiente
        port: process.env.REDIS_PORT, // Define a porta do Redis usando uma variável de ambiente
    },
    // Prefixo para todas as chaves relacionadas à fila no Redis
    prefix: 'bull-queue',
    // Opções padrão para os trabalhos na fila
    defaultJobOptions: {
        attemps: 3, // Número máximo de tentativas para processar um trabalho
        removeOnComplete: false, // Indica se o trabalho deve ser removido da fila após ser concluído
        backoff: {
            type: 'exponential', // Tipo de estratégia de retentativa em caso de falha
            delay: 1000 // Atraso inicial em milissegundos para a retentativa
        }
    }
}