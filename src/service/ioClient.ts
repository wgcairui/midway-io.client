import * as Client from "socket.io-client"
import { Provide, Config, Init, Scope, ScopeEnum } from "@midwayjs/decorator"
import { ioConfig } from "../interface"

@Provide("ioClient")
@Scope(ScopeEnum.Singleton)
export class ioClient {

    @Config("io")
    ioConfig: ioConfig

    io: Client.Socket

    @Init()
    async init() {
        this.io = Client.io(this.ioConfig.uri, this.ioConfig.opts)
    }
}