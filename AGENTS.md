# idle-js — agent instructions

Single toolchain: Vite+ local CLI only (`./node_modules/.bin/vp` or `vp`).

- Install: `vp install`
- Static checks: `vp check` (Oxfmt + Oxlint + tsgolint typeAware/typeCheck)
- Tests: `vp test` (Vitest via `vite-plus/test`)
- Build lib: `vp pack` (tsdown: `pack` block in `vite.config.ts`, entry `src/index.ts`)
- Dev example: `vp dev` (serves root `index.html` + `examples/`)
- Never run raw `tsc`, `eslint`, `prettier`, `vite`, `vitest`, or `tsdown` directly.

Conventions: TypeScript strict, zero runtime deps, SSR-safe (`typeof window` guards),
`sideEffects: false`, `files: ["dist"]`, exports `.` + `./package.json`.
