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
  const token = parse(ctx.req.url).quary['token']

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
