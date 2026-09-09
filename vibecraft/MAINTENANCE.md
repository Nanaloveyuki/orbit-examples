# Maintenance

## Ownership

The reference snapshot was vendored once from Vibecraft revision
`77ce56ea2363c7067b14353f10dd0c329aebdb27`. Build/run/test scripts do not read
`ref/`. Do not copy reference build products, package metadata or Python tooling
back into the application. Maintain behavior in `game/` with focused tests.

MoonBit modules are separate because the browser game targets JS while Orbit
targets native. All external MoonBit dependencies resolve through Mooncake;
there are no path dependencies, workspaces linking sibling repositories, or
local Orbit generator overrides. Npm dependencies are locked by
`package-lock.json`. Keep the Orbit CLI and Mooncake Orbit versions aligned.

`desktop/assets/` and `desktop/generated_page.mbt` are generated and ignored.
Run `npm run generate`, not manual edits, to update them. The generator is
discovered inside the desktop module's downloaded Orbit package. Keep the
root package outside ESM mode: the published MoonView prebuild uses CommonJS.
Build scripts use `.mjs` instead.

## Intentional Changes From Vibecraft

- Modern `moon.mod` / `moon.pkg`, `Map` and `FixedArray` JS FFI.
- Three.js GPU resource management, retaining the original atlas and lighting.
- View radius 6 and detail radius 3 instead of 20 and 10. The original working
  set caused a WebGL context loss in desktop-size software-rendered testing.
- Pixel ratio capped at 2, responsive textured palette and touch controls.
- First click captures the pointer without editing a block; text input does
  not trigger movement. Console integers are parsed strictly.
- Orbit resource embedding and a narrowly scoped host-information IPC command.

## Acceptance Boundary

Target source compatibility is MoonBit 0.10.9. The machine's globally installed
compiler is 0.10.11; it is not replaced by this project. See the verification
results recorded below before treating target-toolchain compatibility as proven.

Verified on Windows on 2026-09-09:

- Official `v0.10.9+6e6c44045` WASM compiler with its bundled core: game checks,
  JS compilation, all 5 game tests, and native-target source checks for the
  desktop module and its Mooncake dependencies passed with warnings denied.
- Installed `v0.10.11+6ff76a5f9`: native executable build and strict MoonBit
  checks passed. The published async C stub emits an `EINVAL` redefinition
  warning from the Windows SDK; this is not a MoonBit source warning.
- Playwright Chromium: 1280x800 and 390x844 rendering/interaction tests passed.
- Actual Orbit/WebView2 window: embedded `orbit://app/index.html` rendered and
  `game.host` returned `{ "name": "Orbit", "version": "0.1.0-alpha.8" }`.

The 0.10.9 Windows native archive URLs were unavailable. Compatibility checks
used the [official WASM compiler release](https://github.com/moonbitlang/moonbit-compiler/releases/tag/v0.10.9%2B6e6c44045)
and its `core.tar.gz`, not the installed compiler under another version label.
The installed `moon` generated compiler command plans; their `moonc` commands
were explicitly run with `node --experimental-wasm-exnref moonc.js` against
the matching bundled core. This proves source and JS behavior compatibility,
not a full native link/runtime qualification with a 0.10.9 Windows toolchain.

Browser tests exercise desktop/mobile sizes, nonblank canvas pixels, movement,
block selection, flight and the command console. They are not a long-running
FPS benchmark. Native acceptance requires a real WebView2 window and IPC
round trip, not just a successful executable build.

There is no disk persistence, multiplayer, installer, or cross-platform runtime
qualification in this first example. Modified chunks are retained in memory
as in upstream. Long sessions with extensive edits can grow memory usage.
