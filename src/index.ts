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

export type Application<TMessage, TState> = Luce<TMessage, TState> & {
  commands?: Commands<TMessage, TState>
}

export default function createApp<
  TMessage extends Message = Message,
  TState extends State = State
> (registry: Registry<DefaultClientInfo, TMessage>): Application<TMessage, TState> {
  const app: Application<TMessage, TState> = new Luce()
  const commands = app.commands = new Commands<TMessage, TState>()

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

    // @ts-ignore
    await ctx.send({
      id: await nanoid(),
      cmd: 'id',
      data: {
        id: ctx.state.id
      }
    })
  })

  commands.use('session-start',
    assertTarget(registry),
    pipe(registry),
    sendOk()
  )

  commands.use('session-accept',
    assertTarget(registry),
    pipe(registry),
    sendOk()
  )

  commands.use('session-reject',
    assertTarget(registry),
    pipe(registry),
    sendOk()
  )

  commands.use('session-cancel',
    assertTarget(registry),
    pipe(registry),
    sendOk()
  )

  commands.use('ice',
    assertTarget(registry),
    assertCandidate(),
    pipe(registry, true),
    sendOk()
  )

  commands.use('offer',
    assertTarget(registry),
    assertSdp(),
    pipe(registry, true),
    sendOk()
  )

  commands.use('answer',
    assertTarget(registry),
    assertSdp(),
    pipe(registry, true),
    sendOk()
  )

  app.useMessage(
    catchErrors(),
    catchRegistryErrors(),
    catchWebSocketErrors(),
    commands.compose()
  )

  return app
}
