# Introduction

__Signal-Fire Server__ is a __WebRTC__ signaling server built for node.js.

A WebRTC signaling server communicates between peers to set up peer-to-peer audio/video and/or data channels. This allows your clients to communicate directly with each other.

## Install

Install through npm:

```
> npm i @signal-fire/server
```

## Command-Line Interface (CLI)

There is also a CLI available for simple and easy set-up
of one or more Server workers. This allows you to get
started with Signal-Fire Server quickly.

Install the CLI globally:

```
> npm i -g @signal-fire/cli
```

To start a new worker on port 3003:

```
> signal-fire start -p 3003
```

[See the CLI repository for more information](https://github.com/Signal-Fire/cli).
