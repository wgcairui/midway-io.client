import { ManagerOptions, SocketOptions } from ".";
import { IOEventInfo } from "./decorator";
export * from "socket.io-client"

export interface IOMethod {
    responseEvents?: IOEventInfo[]
}

export type ioConfig = {
    uri?: string
    opts?: Partial<ManagerOptions & SocketOptions>
}
