# External Runtime Client (Protocol Validation)

A completely independent, event-driven Node.js Runtime Client to validate the `RendererFrame` WebSocket stream protocol from the simulation streaming server.

## Architecture

```mermaid
graph TD
    Sim[Simulation Core] --> MAP[Canonical Map State]
    MAP --> Mapper[Renderer Frame Mapper]
    Mapper --> Server[Runtime Streaming Server (WebSocket)]
    Server -->|ws://localhost:8080| Client[External Runtime Client]
    Client --> Val[Frame Validator]
    Client --> Stats[Frame Statistics Printer]
```

## Protocol Frame Format

The protocol frame format is a serialized JSON object of type `RendererFrame`. The primary payload fields are:

- `version` (number): Protocol version (expected `1`).
- `tick` (number): Integer simulation tick counter.
- `theme` (string): UI theme (`"dark"` or `"light"`).
- `activeLayer` (string): Active map rendering layer.
- `activeHudMode` (string): HUD Mode (`"STATE"`, `"WAR_ROOM"`, or `"ANALYST"`).
- `globalThreatLevel` (string): Threat rating (`"GREEN"`, `"YELLOW"`, `"ORANGE"`, `"RED"`, `"BLACK"`).
- `nuclearExchangeOccurred` (boolean): Flag indicating if a nuclear weapon has been launched.
- `playerCountryId` (string): Identifier of the player's country.
- `targetCountryId` (string, optional): Selected opponent country.
- `countries` (object): Map of country IDs to country metadata.
- `units` (object): Map of unit IDs to unit positions and status.
- `activeStrikes` (array): Active weapon trajectories.
- `activeTethers` (array): Treaties or connections between countries.

---

## Installation

1. Navigate to the client directory:
   ```bash
   cd tools/runtime-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Client

Start the client using the following command:
```bash
npm run client
```

### Environment Variables
- `STREAM_URL`: Override the default streaming endpoint (default: `ws://localhost:8080`).

---

## Expected Output

```
Connected to Runtime Stream
Protocol Version: 1
Tick: 128
Countries: 214
Units: 153
Strikes: 7
Tethers: 31
FPS: 60
Tick Rate: 60 ticks/sec
Latency: 3 ms
Dropped Frames: 0
Out-of-order Frames: 0
Protocol Valid: YES
```

---

## Technical Details

- **Independent**: Written in Node.js with no browser APIs, React, Three.js, or external rendering wrappers.
- **Resilient**: Implements automatic reconnect intervals when the stream server disconnects or fails to respond.
- **Non-mutating**: Frame payload contents are parsed, read, and verified without modification.
- **Latency Measurement**: Actively measures connection round-trip latency via WebSocket ping/pong frames.
- **Out-of-Order / Drop Detection**: Tracks sequential ticks to count any packets arriving out of order or dropped along the transport.
