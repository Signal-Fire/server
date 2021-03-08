# Getting Started

## Installation

Install through npm:

```
> npm i @signal-fire/server
```

## Registries

The Server requires a __registry__. A registry manages
client IDs and their associated information.

By using registries it is possible to horizontally
scale the Server in a decentralized environment. Registries
also enable authentication and storage of clients with
enduring IDs.

The [registry package](https://github.com/lucets/registr)
contains an in-memory registry to get you started. It can
also be used as a reference implementation.

## Setting up a basic Server

In the below example we use `LocalRegistry` as the registry.
The in-memory registry is meant for development purposed
and should not be used in production.

```typescript
import { Server } from 'http'

import { LocalRegistry } from '@signal-fire/registry'
import createApp from '@signal-fire/server'

const registry = new LocalRegistry()
const app = createApp(registry)
const server = new Server()

server.on('upgrade', app.onUpgrade())
server.listen(3000, () => {
  console.log('Server listening on port 3000')
})
```

Congratulations, you now have a basic Server running!

## Next Steps

Now you can to learn how to [extend the Server](./Extending-the-Server.md).
