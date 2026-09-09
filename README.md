# Orbit Examples

Runnable example applications for [Orbit](https://github.com/Nanaloveyuki/orbit).

## Orbit Voxel

A MoonBit voxel sandbox derived from Vibecraft: procedural terrain, collision,
walking and flight, block placement/removal, textured chunks and particles.
Three.js renders the MoonBit-generated meshes. The native host uses
`Nanaloveyuki/orbit@0.1.0-alpha.8` from Mooncake, embedded web assets and a
capability-protected `game.host` IPC command.

### Run

Prerequisites: MoonBit, Node.js 20+, and a native C/C++ build environment.
Windows also needs the WebView2 Evergreen Runtime. MoonView downloads its SDK
during the first native build. Linux needs the platform dependencies documented
by Orbit; this example has only been run on Windows.

```sh
npm ci
npm start
```

`npm start` builds the MoonBit JS game, bundles the web assets, invokes the
published Orbit generator, and runs the native application. No development
server or internet connection is needed at application runtime.

Browser preview (without native IPC):

```sh
npm run dev
```

Open the URL printed by the server, normally `http://127.0.0.1:4173`.

### Controls

- Click the world to capture the pointer; Escape releases it.
- WASD: move. Space: jump or fly up. Shift: sneak or fly down.
- Ctrl or double-tap W: sprint. Fly checkbox: toggle flight.
- Left/right mouse buttons: break/place a block.
- Number keys, minus/equal, or the block palette: select a block.
- Shuffle: teleport to another land position.
- Console: `tp x y z`, `tp x z`, or `look yaw pitch` with integer arguments.
- Narrow screens: on-screen movement/edit buttons and drag-to-look.

World edits are in memory only. Closing the application discards them.

### Validate

```sh
npm test
npm run generate
moon -C vibecraft/desktop check --target native --deny-warn
npm run build
npx playwright install chromium
npm run test:web
```

See [maintenance and verification](vibecraft/MAINTENANCE.md) for the exact
toolchain evidence and remaining limitations.

## Layout

- `vibecraft/game/`: independently maintained MoonBit JS module.
- `vibecraft/web/`: Three.js adapter and application UI.
- `vibecraft/desktop/`: Mooncake-based native Orbit module and configuration.
- `scripts/`: build and browser preview entry points.
- `tests/`: browser rendering and interaction checks.
- `ref/`: ignored, read-only reference material; never a build input.

The root MIT license covers original host/build code. Derived Vibecraft game
code remains Apache-2.0; see [attribution](vibecraft/NOTICE.md).
