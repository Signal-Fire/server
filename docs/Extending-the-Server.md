# Extending the Server

In [Getting Started](./Getting-Started.md) we started
a basic Server. Now we will extend the Server with a new
capability.

The Server is in fact just a [Luce](https://github.com/lucets/luce) application
which can be extended by using the asynchronous hooks.

## Adding Authentication

Let's assume you have, through other means, provided
the prospective Client with a unique authentication
token. The Client will use this token to authenticate
itself with the Server.

We want the token to be sent using the URL's query string:

```typescript
import connect from '@signal-fire/client'

const client = await connect(`ws://localhost:3003?token=${token}`)
```

How should we go about this?

We can use the upgrade `pre` hook to do this:

```typescript
import { parse } from 'url'
import createHttpError from 'http-errors'

const app = createApp(registry)

app.useUpgrade('pre', async function auth (ctx, next) => {
  // Get the token from the query, if set
  const token = parse(ctx.req.url).query['token']

  if (!token) {
    throw createHttpError(401, 'Mising token')
  }

  // verify the token somhow
  const clientId = await verify(token)

  // error if we have no client ID
  if (!clientId) {
    throw createHttpError(401, 'Invalid token')
  }

  // set the client ID on the context state
  ctx.state.id = clientId

  // Don't forget to call next()
  return next()
})
```

Now, any Client connecting to the Server will need to
have a valid `token`.

You just added simple authentication!

## Counting Session Messages

In the next example we want to count the number of
session start, accept, and reject messages received
by the Server. We store this info in a `Stats` object.

In this case we will be adding a stats hook to each
command we want to count. We write a single function which
we can use for all commands.

Command message hooks are inserted after initial validation
of the message has succeeded. This means that if you throw
an error, it will be handled by the upstream hooks.

```typescript
import {
  MessageHook,
  DefaultContext,
  Message,
  State
} from '@lucets/luce'

const stats = {
  sessionStartMessages: 0,
  sessionAcceptMessages: 0,
  sessionRejectMessages: 0
}

// This function will return the message hook
function countMessages (): Promise<MessageHook<Message, DefaultContext<Message, State>>> {
  // this is our hook
  return async function countMessages (message, _ctx, next) {
    // We use the command name to figure out which stat to increment
    switch (message.cmd) {
      case 'session-start':
        stats.sessionStartMessages++
        break
      case 'session-accept':
        stats.sessionAcceptMessages++
        break
      case 'session-reject':
        stats.sessionRejectMessages++
        break
    }
  }
}

// We add the message hook to each command
app.commands.use('session-start', countMessages())
app.commands.use('session-accept', countMessages())
app.commands.use('session-reject', countMessages())
```

We now count the number of received messages for each command.

## Adding a New Command

Imagine we want to add a `exists` command, which tells the
client if the given target ID exists.

```typescript
app.commands.use('exists', async (message, ctx, next) => {
  // Check the registry to see if the ID exists
  const exists = await ctx.app.registry.exists(message.target)

  // Send a reply to the client
  await ctx.send({
    // IMPORTANT: The reponse ID has to be
    // identical to the request ID!
    id: message.id,
    // The request was successful
    ok: true,
    data: {
      exists
    }
  })
})
```

We have now added a new command which clients can call.
