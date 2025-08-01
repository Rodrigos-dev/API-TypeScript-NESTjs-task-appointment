import exceptions from "./exceptions";
import loggers from "./loggers"

async function generateTimestamp() {
    try {

        const timestamp = Math.floor(Date.now() / 1000); // Obtém o timestamp atual em segundos
        return timestamp;

    } catch (err) {
        loggers.loggerMessage('error', err)
        return exceptions.exceptionsReturn(err);
    }
}

export default {
    generateTimestamp
};