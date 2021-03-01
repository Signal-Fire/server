'use strict'

import Luce from '@lucets/luce'
import Commands from '@lucets/commands'
import { Registry, DefaultClientInfo } from '@lucets/registry'
import { nanoid } from 'nanoid/async'

import {
  assertCandidate,
  assertSdp,
  assertTarget,
  catchErrors,
  catchRegistryErrors,
  catchWebSocketErrors,
  pipe,
  sendOk
} from './hooks'

export interface Message {
  id?: string,
  cmd?: string,
  ok?: boolean,
  target?: string,
  origin?: string,
  data?: {
    id?: string,
    candidate?: string,
    sdp?: string,
    message?: string
  }
}

export interface State {
  id: string,
  deleteOnClose?: boolean
}

export type Application = Luce<Message, State> & {
  commands?: Commands<Message, State>
}

export default function createApp (registry: Registry<DefaultClientInfo, Message>): Application {
  const app: Application = new Luce<Message, State>()
  const commands = app.commands = new Commands<Message, State>()

  // Upgrade POST hook to set ID if not set yet
  app.useUpgrade('post', async (ctx, next) => {
    await next()

    // Set ID if previous hooks haven't
    const id = ctx.state.id = ctx.state.id ?? await nanoid()

    // Set deleteOnClose if previous hooks haven't
    if (typeof ctx.state.deleteOnClose !== 'boolean') {
      ctx.state.deleteOnClose = true
    }

    // Create client in registry if it doesn't exist
    if (!await registry.exists(id)) {
      await registry.create(id)
    }

    // Handle socket close
    ctx.socket.once('close', async () => {
      await registry.unregister(ctx.state.id)

      if (ctx.state.deleteOnClose === true) {
        await registry.delete(ctx.state.id)
      }
    })

    // Register the client with the registry
    await registry.register(id, ctx.socket)

    await ctx.send({
      id: await nanoid(),
      cmd: 'id',
      data: {
        id: ctx.state.id
      }
    })
  })

  commands.use('session-start',
    catchErrors(),
    catchRegistryErrors(),
    catchWebSocketErrors(),
    assertTarget(registry),
    pipe(registry),
    sendOk()
  )

  commands.use('session-accept',
    catchErrors(),
    catchRegistryErrors(),
    catchWebSocketErrors(),
    assertTarget(registry),
    pipe(registry),
    sendOk()
  )

  commands.use('session-reject',
    catchErrors(),
    catchRegistryErrors(),
    catchWebSocketErrors(),
    assertTarget(registry),
    pipe(registry),
    sendOk()
  )

  commands.use('session-cancel',
    catchErrors(),
    catchRegistryErrors(),
    catchWebSocketErrors(),
    assertTarget(registry),
    pipe(registry),
    sendOk()
  )

  commands.use('ice',
    catchErrors(),
    catchRegistryErrors(),
    catchWebSocketErrors(),
    assertTarget(registry),
    assertCandidate(),
    pipe(registry, true),
    sendOk()
  )

  commands.use('offer',
    catchErrors(),
    catchRegistryErrors(),
    catchWebSocketErrors(),
    assertTarget(registry),
    assertSdp(),
    pipe(registry, true),
    sendOk()
  )

  commands.use('answer',
    catchErrors(),
    catchRegistryErrors(),
    catchWebSocketErrors(),
    assertTarget(registry),
    assertSdp(),
    pipe(registry, true),
    sendOk()
  )

  app.useMessage(commands.compose())

  return app
}
