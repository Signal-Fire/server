'use strict'

import Luce from '@lucets/luce'
import Commands from '@lucets/commands'
import { Registry, DefaultClientInfo } from '@lucets/registry'

import {
  assertCandidate,
  assertId,
  assertOffer,
  assertAnswer,
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
    offer?: RTCSessionDescription,
    answer?: RTCSessionDescription,
    candidate?: RTCIceCandidate,
    message?: string,
    configuration?: RTCConfiguration
  }
}

export interface State {
  id: string,
  deleteOnClose?: boolean
}

export type Application<
  TMessage extends Message = Message,
  TState extends State = State
> = Luce<TMessage, TState> & {
  commands?: Commands<TMessage, TState>
}

export default function createApp<
  TMessage extends Message = Message,
  TState extends State = State,
  TClientInfo extends DefaultClientInfo = DefaultClientInfo
> (registry: Registry<TClientInfo, TMessage>, configuration?: RTCConfiguration): Application<TMessage, TState> {
  const app: Application<TMessage, TState> = new Luce()
  const commands = app.commands = new Commands<TMessage, TState>()

  app.useUpgrade('post', handleUpgrade(registry, configuration))

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
    assertOffer(),
    pipe(registry, true),
    sendOk()
  )

  commands.use('answer',
    assertId(),
    assertTarget(registry),
    assertAnswer(),
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
