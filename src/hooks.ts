'use strict'

import { MessageHook, DefaultContext, WebSocketError } from '@lucets/luce'
import { Registry, RegistryError } from '@lucets/registry'
import { nanoid } from 'nanoid/async'
import { Message, State } from './index'

/** Pipe the message command (and optionally data) to the target client. */
export function pipe (registry: Registry, data = false): MessageHook<Message, DefaultContext<Message, State>> {
  return async function pipe (message, ctx, next) {
    const request: Message = {
      id: await nanoid(),
      cmd: message.cmd,
      origin: ctx.state.id
    }

    if (data && message.data) {
      request.data = message.data
    }

    await registry.send(message.target, request)
    return next()
  }
}

/** Sends an OK response. */
export function sendOk (): MessageHook<Message, DefaultContext<Message, State>> {
  return async function sendOk (message, ctx) {
    return ctx.send({
      id: message.id,
      ok: true
    })
  }
}

/** Asserts if a target is set, exists, and is online. */
export function assertTarget (registry: Registry): MessageHook<Message, DefaultContext<Message, State>> {
  return async function assertTarget (message, ctx, next) {
    if (!message.target) {
      throw new WebSocketError(4400, 'Missing Target')
    }

    const info = await registry.info(message.target)

    if (!info) {
      throw new WebSocketError(4404, 'Peer Not Found')
    } else if (info.status === 'offline') {
      throw new WebSocketError(4405, 'Peer Offline')
    }

    return next()
  }
}

/** Asserts if ICE candidate data is present. */
export function assertCandidate (): MessageHook<Message, DefaultContext<Message, State>> {
  return async function assertCandidate (message, ctx, next) {
    if (!message.data?.candidate) {
      throw new WebSocketError(4400, 'Missing ICE Candidate')
    }

    return next()
  }
}

/** Asserts if SDP data is present. */
export function assertSdp (): MessageHook<Message, DefaultContext<Message, State>> {
  return async function assertSdp (message, ctx, next) {
    if (!message.data?.sdp) {
      throw new WebSocketError(4400, 'Missing SDP')
    }

    return next()
  }
}

/** Catches registry error and sends the response to the client. */
export function catchRegistryErrors (): MessageHook<Message, DefaultContext<Message, State>> {
  return async function catchRegistryErrors (message, ctx, next) {
    try {
      await next()
    } catch (e) {
      if (e instanceof RegistryError) {
        return ctx.send({
          id: message.id,
          ok: false,
          data: {
            message: e.message
          }
        })
      }

      throw e
    }
  }
}

/** Catches `WebSocketError`s and sends the message to the client. */
export function catchWebSocketErrors (): MessageHook<Message, DefaultContext<Message, State>> {
  return async function catchWebSocketErrors (message, ctx, next) {
    try {
      await next()
    } catch (e) {
      if (e instanceof WebSocketError && e.expose) {
        return ctx.send({
          id: message.id,
          ok: false,
          data: {
            message: e.message
          }
        })
      }

      throw e
    }
  }
}

/** Catches all remaining errors and sends an Internal Server Error response. */
export function catchErrors (): MessageHook<Message, DefaultContext<Message, State>> {
  return async function catchErrors (message, ctx, next) {
    try {
      await next()
    } catch (e) {
      return ctx.send({
        id: message.id,
        ok: false,
        data: {
          message: 'Internal Server Error'
        }
      })
    }
  }
}
