# Signal-Fire Server

**Signal-Fire Server** is a **WebRTC** signaling server built for node.js.

## Install

The Server is currently a work-in-progress.
f you want to take a look at it anyway,
you can install the module through npm:I

```
npm i @signal-fire/server
```

## Documentation

There is no documentation. Yet.

## Example

In this example we use the `LocalRegistry` in-memory
registry from the [@lucets/registry](https://github.com/lucets/registry) package.

The resulting app is in fact just a [Luce](https://github.com/lucets/luce) application,
which you can extend yourself. You'll also need to
use your own HTTP server, of course.


```ts
import { Server } from 'http'

import createApp from './index'
import { LocalRegistry } from '@lucets/registry'

const registry = new LocalRegistry()
const app = createApp(registry)
const server = new Server()

server.on('upgrade', app.onUpgrade())
server.listen(3003, () => {
  console.log('Server listening on port 3003')
})

```

## License

Copyright 2021 Michiel van der Velde.

This software is licensed under [the MIT License](LICENSE).
