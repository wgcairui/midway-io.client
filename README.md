# midway-io.client


### midway自定义组件
#### socket.io-client组件,暴露常用的装饰器

```
npm i -S @cairui/midway-io.client
```

*@IOControll()*

*@OnConnection()*

*@OnDisConnection()*

*@OnIOMessage()*

*@OnIOEmit()*

###示例 src/controll/ioControll.ts
```

import { Provide, Inject } from "@midwayjs/decorator"
import { ioClientService } from "../service/ioClient"
import { IOControll, OnConnection, OnIOEmit, OnIOMessage } from "../../../../npmPackage/midway-io.client/src"

@Provide()
@IOControll()
export class IOClientControll {

    @Inject()
    ctx: ioClientService

    @OnConnection()
    connect() {
        console.log("id===", this.ctx.ioClient.io.id);

    }

    @OnIOMessage("accont")
    @OnIOEmit("register")
    async accont() {
        return {}
    }

    @OnIOMessage("registerSuccess")
    async register(data: any) {
        console.log({ data });

    }
}
```

[midway文档](https://www.yuque.com/midwayjs/midway_v2)

配置 src/config/*.ts

```
import { ioConfig } from "../../../../npmPackage/midway-io.client/src"

export const io: ioConfig = {
    uri: "http://${url}/${namespace}",
    opts: {
        path: "/client"
    }
}

```

