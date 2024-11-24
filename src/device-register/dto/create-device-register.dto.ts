import { SystemType } from "../entities/device-register.entity";

export class CreateDeviceRegisterDto {    
    userId?: number;
    token?: string;
    systemType?: SystemType;
}
