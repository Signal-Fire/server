# Signal-Fire Server

**Signal-Fire Server** is a **WebRTC** signaling server built for node.js.

A WebRTC signaling server communicates between peers to set up peer-to-peer
audio/video and/or data channels. This allows your clients to communicate
directly with each other.

## Features

* WebSockets powered __[WebRTC](https://en.wikipedia.org/wiki/WebRTC) signaling server__
  * Messages are passed using simple JSON objects
* There is a __tailor-made [browser client](https://github.com/Signal-Fire/client)__
  available as well
* __Automatic__ peer ID generation (also possible to plug in your own)
* __Automatic__ routing of messages
* Supports __one-to-one__, __one-to-many__ and __many-to-many__ out of the box
* Horizontally __scalable__ by using [registries](https://github.com/lucets/registry)

## Install

> The Server is currently a __work-in-progress__. You can help
> by reporting bugs or unexpected behavior. If you encounter
> anything, please open an issue, or even better, a pull request.

Install the module through npm:

```
npm i @signal-fire/server
```

## Command Line Interface (CLI)

There is also a CLI available to start and manage multiple
workers simultaneously. The CLI is a work-in-progress,
but can already be used.

To install the CLI:

```
npm i -g @signal-fire/cli
```

To start a new worker on port 3003:

```
> signal-fire start -p 3003
```

[See the CLI documentation](https://github.com/Signal-Fire/cli)
to learn how to use the CLI.

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
