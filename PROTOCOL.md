# Protocol

The protocol is JSON-based. This document presents
the protocol from the Client's side.

The object is stringified and sent over the WebSocket
connection. The Server should only expect/process string
messages and discard/error other formats.

Each message should have an ID. The Server should
acknowledge each message by using the same message ID.

An outgoing message, as seen by the Client, has the
following properties:

```ts
interface OutgoingMessage {
    id: string,
    cmd: string,
    target: string,
    data?: {
        id?: string,
        offer: RTCSessionDescription,
        answer: RTCSessionDescription,
        candidate?: RTCICECandidate,
        message?: string
    }
}
```

An incoming message, as seen by the Client, has the
following properties:

```ts
interface IncomingMessage {
    id: string,
    ok?: boolean,
    cmd?: string,
    origin?: string,
    data?: {
        offer: RTCSessionDescription,
        answer: RTCSessionDescription,
        candidate?: RTCICECandidate,
        message?: string
    }
}
```

## Handshake

The Server should sent a message with the command
`welcome` to the Client, which contains the Client's
ID.

The Client ID can be used by others to initiate
sessions and exchange ICE candidates and offers/answers.

If the connection process was successful the Server
will send the following message:

```json
{
    "id": "<id>",
    "cmd": "welcome",
    "data": {
        "id": "<client id>"
    }
}
```

The client's ID is `data.id`.

## Sending to a Target

To send a message to another Client,
set the `target` property to the target
Client's ID.

The Server should respond to each message
with an OK/Error response.

Request:

```json
{
    "id": "<id>",
    "cmd": "start-session",
    "target": "<target id>"
}
```

OK response:

```json
{
    "id": "<id>",
    "ok": true
}
```

Error response:

```json
{
    "id": "<id>",
    "ok": false,
    "data": {
        "message": "Peer Not Found"
    }
}
```

### Sending an ICE candidate

```json
{
    "id": "<id>",
    "cmd": "ice",
    "target": "<target id>",
    "data": {
        "candidate": "<candidate>"
    }
}
```

### Sending an Offer and Answer

Simply change the command from `offer` to `answer` to
send an answer instead.

```json
{
    "id": "<id>",
    "cmd": "offer",
    "data": {
        "offer": "<offer>"
    }
}
```

## Receiving from an Origin

The Client has received a message from another Client
when the `origin` property is set.

```json
{
  "id": "<id>",
  "cmd": "session-start",
  "origin": "<origin id>"
}
```

### Receiving an ICE Candidate

```json
{
  "id": "<id>",
  "cmd": "ice",
  "origin": "<origin id>",
  "data": {
    "candidate": "<candidate>"
  }
}
```

### Receiving an Offer or Answer

```json
{
  "id": "<id>",
  "cmd": "offer",
  "origin": "<origin id>",
  "data": {
    "offer": "<offer>"
  }
}
```
