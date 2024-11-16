import { HttpException, HttpStatus } from "@nestjs/common"

async function exceptionsReturn(err: any) {

    if (err.driverError) {
        throw new HttpException(err.driverError, HttpStatus.INTERNAL_SERVER_ERROR)
    } else {
        if (err.status >= 300 && err.status < 500) {
            throw err
        } else if (err.message) {

            const error = {
                message: err.message ? err.message : null,
                response: err.response && err.response.data.error_messages ? err.response.data.error_messages : null
            }

            console.log(error)

            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)

        } else {
            throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}


export default {
    exceptionsReturn
};

