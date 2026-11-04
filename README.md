# idle-js

Detect user idleness. Zero dependencies, framework-agnostic, TypeScript-first.

- return to a page after no activity
- display a modal depending on activity
- change things while the user is away

## Install

```sh
npm i idle-js
```

## Usage

```ts
import { IdleJs } from "idle-js";

const idle = new IdleJs({
  idle: 10000, // ms without activity before onIdle
  // events that reset the timer (scroll uses capture, all passive)
  events: ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel"],
  onIdle: () => console.log("idle"),
  onActive: () => console.log("active again"),
  onHide: () => console.log("tab hidden"),
  onShow: () => console.log("tab visible"),
  keepTracking: true,
  startAtIdle: false,
  recurIdleCall: false,
  // target: iframe.contentWindow, // listen inside an iframe (#25)
}).start();

idle.stop(); // stop all tracking
idle.stop().reset().start(); // restart from initial state
idle.reset({ idle: false }); // reset to a specific state
idle.set({ idle: 5000 }); // change timeout at runtime, re-arms timer (#19)
console.log(idle.lastActive); // timestamp of last activity
```

SSR-safe: `start()` is a no-op without `window`.

Background tabs / locked mobile (#29): on visibility return the wall-clock
elapsed time since `lastActive` is compared against `idle`, so sleep counts as
inactivity even though timers are frozen.

Scroll (#26): listeners use `{ capture: event === 'scroll', passive: true }`.

## Example

```sh
vp install
vp dev   # http://localhost:5173
```

## Development

```sh
vp install
vp check   # fmt + lint + typecheck
vp test    # vitest
vp pack    # build dist/ (esm + cjs + dts)
```

## Security

See [SECURITY.md](./SECURITY.md). Report vulnerabilities via GitHub Security Advisories.
