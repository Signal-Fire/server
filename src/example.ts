'use strict'

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
