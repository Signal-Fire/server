'use strict'

import Luce from '@lucets/luce'
import Commands from '@lucets/commands'
import { Registry, DefaultClientInfo } from '@lucets/registry'
import { nanoid } from 'nanoid/async'

import {
  assertCandidate,
  assertId,
  assertSdp,
  assertTarget,
  catchErrors,
  catchRegistryErrors,
  catchWebSocketErrors,
  handleUpgrade,
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

  app.useUpgrade('post', handleUpgrade(registry))

  commands.use('session-start',
    assertId(),
    assertTarget(registry),
    pipe(registry),
    sendOk()
  )

  commands.use('session-accept',
    assertId(),
    assertTarget(registry),
    pipe(registry),
    sendOk()
  )

  commands.use('session-reject',
    assertId(),
    assertTarget(registry),
    pipe(registry),
    sendOk()
  )

  commands.use('session-cancel',
    assertId(),
    assertTarget(registry),
    pipe(registry),
    sendOk()
  )

  commands.use('ice',
    assertId(),
    assertTarget(registry),
    assertCandidate(),
    pipe(registry, true),
    sendOk()
  )

  commands.use('offer',
    assertId(),
    assertTarget(registry),
    assertSdp(),
    pipe(registry, true),
    sendOk()
  )

  commands.use('answer',
    assertId(),
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
