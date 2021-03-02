# Protocol

The protocol is JSON-based. The message is stringified
and sent over the connection as a string.

```ts
interface OutgoingMessage {
    id: string,
    cmd: string,
    target: string,
    data?: {
        id?: string
        candidate?: string,
        sdp?: string,
        message?: string
    }
}
```

```ts
interface IncomingMessage {
    id: string,
    ok?: boolean,
    cmd?: string,
    origin?: string,
    data?: {
        candidate?: string,
        sdp?: string,
        message?: string
    }
}
```

## Welcome

The Server sends the client a `welcome` message which
contains the client's ID. This ID can then be used by
others to connect to the peer.

If the connection process was successful the Server
will send the following message:

```json
{
    "id": "<id>",
    "cmd": "welcome",
    "data": {
        "id": "<id>
    }
}
```

The client's ID is `data.id`.

## Sending to a Target

The Server should respond to each message with
an `ok` response.

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
        "message": "<message."
    }
}
```

## Sending an ICE candidate

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

## Sending an Offer and Answer

Simply change the command from `offer` to `answer` to
send an answer instead.

```json
{
    "id": "<id>",
    "cmd": "offer",
    "data": {
        "sdp": "<sdp>"
    }
}
```
