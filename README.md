# Pokédex

Browse Pokémon: search, filter by generation and type, and see details, moves, and evolution chains, with data from [PokeAPI](https://pokeapi.co). See `CONTEXT.md` for the domain glossary.

## Develop

`vp` ([Vite+](https://viteplus.dev)) is the only command. Run everything through it, not through `bun`, `npm`, or `npx`.

```sh
vp install
vp dev          # dev server
vp test run     # unit and Storybook tests
vp lint         # vp lint --fix to auto-fix
vp fmt          # format
vp run build    # production build into dist/
vp run storybook
```

## Stack

- **Vite+ (`vp`)** runs the dev server, build, tests, lint, format, git hooks, and package-manager commands (`vp install`, `vp add -D <pkg>`, `vp exec <bin>`).
- **Bun** is the package manager underneath (`bun.lock`, `devEngines`); `vp` picks it up automatically.
- **React + TypeScript**, with the latest versions that Vite+ and Storybook support.
- **Storybook** with the Vitest addon: every story runs as a browser test (Playwright Chromium) alongside the unit tests. First run needs `vp exec playwright install chromium`. Stories use MSW to mock PokeAPI.
- **Lint** is Oxlint through `vp lint`, with the `prefer-vite-plus-imports` rule, so tests import from `vite-plus/test`, not `vitest`.
- **Pre-commit hook** (`.vite-hooks/pre-commit`) runs `vp lint`, `vp run build`, and `vp test run`.

## Deploy

Pushes to `main` run `.github/workflows/deploy.yml`, which lints, tests, builds, and publishes to GitHub Pages at `/slopdex/`. In the repo settings, set Pages → Source to "GitHub Actions". CI uses `voidzero-dev/setup-vp`, which installs Vite+, Node, and Bun and runs `vp install`.

## Setup and updates (scaffold-kids-app skill)

This project follows the `scaffold-kids-app` agent skill (`~/Work/agents/skills/scaffold-kids-app/SKILL.md`); slopninja is its reference app. Use it:

- **To start a new kids app:** run `/scaffold-kids-app <name> <description>` in Claude Code.
- **To update this setup:** when the tooling changes (Vite+, Storybook, CI, hooks), follow the skill's steps here to bring this app in line.
