# slopdex — domain glossary

## Concepts

### Pokémon
A species from the Pokémon universe. Identified by a numeric id and a name.

### PokeAPI
The external HTTP API that serves Pokémon data. The `pokeApi` facade is the sole adapter between the app and this external system — no other module constructs PokeAPI URLs or calls `fetch` directly.

### Facade
A deep module whose interface names domain operations (`listAll`, `getPokemon`, `getSpecies`) and whose implementation encapsulates transport concerns (base URL, retry policy, response parsing). The facade is the app's only seam against the PokeAPI.

### Evolution chain
A tree of species linked by evolution. Flattened into a linear `EvolutionStep[]` by `flattenEvolutionChain`, a pure function with no side effects.

### Filter
A predicate applied to the full Pokémon list. Three filter dimensions exist: search term (text match on name), generation (numeric range of ids), and type (membership in a type's pokemon set).

### Move
An attack or technique a Pokémon can learn, sourced from `pokemon.moves[].move`. Displayed as a flat, alphabetized, deduplicated-by-name list — the app does not track which game/version group a move's learn method or level applies to, so per-move learn detail (level-up level, TM, egg, tutor) is intentionally not surfaced.

### Game
An individual game title a Pokémon appears in (e.g. `red`, `gold`, `scarlet`), sourced from `pokemon.game_indices[].version`. Distinct from a **version group** (a paired release sharing move-learn data, e.g. `red-blue`) — the app uses `game_indices`, not `moves[].version_group_details`, as the source of truth for "games this Pokémon appears in," since that's the field PokeAPI purpose-built for dex presence. Never used for the app's own player-facing activity — see **Who's That Pokémon?**.

### Round
In **Who's That Pokémon?**, one draw→reveal cycle: a random Pokémon is drawn, shown obscured, revealed on click, then replaced by the next "Next" press. Rounds are independent — the pool is always all 1025 Pokémon, unaffected by the sidebar's filters, and a round never scores a guess.

### Who's That Pokémon?
A round-based activity in the app. Each **Round** shows a random Pokémon's full card with its **identity obscured** — the name rendered as `???` and the artwork as a silhouette — while the rest of the card's information (stats, types, height, weight, base XP, abilities, moves, games, generation, genus, flavour text) and an auto-played cry remain visible as clues. Clicking the card flips it to **reveal** the identity (name + official artwork). Guessing happens among people in the real world: the app never accepts a guess input nor scores one.

## Architecture vocabulary

When describing modules, interfaces, and their relationships, use the terms from the `/codebase-design` skill: module, interface, implementation, depth, shallow, seam, adapter, leverage, locality.
