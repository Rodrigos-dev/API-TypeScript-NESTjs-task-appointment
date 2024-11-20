import { BullRootModuleOptions, InjectQueue, SharedBullConfigurationFactory } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import configBull from "./config -bull";



@Injectable()
export class ConfigBullProvider implements SharedBullConfigurationFactory{

    createSharedConfiguration(): BullRootModuleOptions | Promise<BullRootModuleOptions> {
        return configBull as any
    }

}