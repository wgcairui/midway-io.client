// src/configuration.ts
import { Configuration, listModule, getProviderId, getClassMetadata, } from '@midwayjs/decorator';
import { IOEventInfo, IOEventTypeEnum, IO_CONTROLLER_KEY, IO_EVENT_KEY } from "./decorator"
import { IMidwayApplication } from "@midwayjs/core";
import { join } from 'path';
import { IOMethod } from "./interface";
import { ioClient } from "./service/ioClient"

@Configuration({
  namespace: 'io',
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {
  async onReady(ctx: any, app: IMidwayApplication) {

    const modules = listModule(IO_CONTROLLER_KEY)

    for (let target of modules) {
      const providerId = getProviderId(target);
      if (providerId) {
        await this.addEmint(app, target, providerId)
      }
    }

  }

  async onStop(ctx: any, app: IMidwayApplication) {
    const socket = await app.getApplicationContext().getAsync(ioClient)
    socket.io.disconnect()
    socket.io.close()
    console.log('socket disconnect', socket.io.disconnected);

  }

  /**
   * 添加监听
   * @param target 
   * @param providerId 
   */
  private async addEmint(app: IMidwayApplication, target: any, providerId: string) {
    const IOEvents: IOEventInfo[] = getClassMetadata(IO_EVENT_KEY, target)
    // 控制器controll
    const controller = await app.getApplicationContext().getAsync(providerId) as any

    const socket = await app.getApplicationContext().getAsync(ioClient)

    const methodMap: Record<string, IOMethod> = {}
    for (let event of IOEvents) {
      methodMap[event.propertyName] = methodMap[event.propertyName] || { responseEvents: [] }

      // result是控制器方法返回的结果
      switch (event.eventType) {
        case IOEventTypeEnum.ON_CONNECTION:
          {
            // 监听断开,执行disconnecting操作
            socket.io.on("connect", () => {
              console.log('socket.io connecting');

              const result = controller[event.propertyName].apply(controller)
              this.bindSocketResponse(result, socket, event.propertyName, methodMap)
            })

          }
          break;

        case IOEventTypeEnum.ON_DISCONNECTION:
          {
            // 监听断开,执行disconnecting操作
            socket.io.on("disconnecting", async (reason: string) => {
              const result = await controller[event.propertyName].apply(controller, [reason])
              await this.bindSocketResponse(result, socket, event.propertyName, methodMap)
            })
          }
          break

        case IOEventTypeEnum.ON_MESSAGE:
          {
            // 监听绑定事件,
            socket.io.on(event.messageEventName!, async (buffer: Buffer | string) => {
              const result = await controller[event.propertyName].apply(controller, [buffer])
              await this.bindSocketResponse(result, socket, event.propertyName, methodMap)
            })
          }
          break

        default:
          {
            methodMap[event.propertyName].responseEvents!.push(event)
          }
          break;
      }
    }
  }

  /**
   * 处理监听处理程序返回的数据,当有Emit或Write装饰器,发送数据
   * @param result 
   * @param socket 
   * @param propertyName 
   * @param methodMap 
   */
  async bindSocketResponse(result: any, socket: ioClient, propertyName: string, methodMap: Record<string, IOMethod>) {
    if (result) {
      const du = methodMap[propertyName]
      // console.log({ result, propertyName, du: du.responseEvents });
      // 如果监听事件还有挂载的返回
      if (du && du.responseEvents && du.responseEvents.length > 0) {
        for (const IOEventInfo of du.responseEvents) {
          switch (IOEventInfo.eventType) {
            case IOEventTypeEnum.EMIT:
              {
                socket.io.emit(IOEventInfo.messageEventName!, ...[result].flat())
              }
              break;
          }
        }
      }
    }
  }
}

