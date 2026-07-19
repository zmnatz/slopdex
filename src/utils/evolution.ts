interface EvolvesTo {
  species: { name: string; url: string }
  evolves_to: EvolvesTo[]
}

export interface ChainRoot {
  species: { name: string; url: string }
  evolves_to: EvolvesTo[]
}

export interface EvolutionStep {
  name: string
  id: string
}

export function flattenEvolutionChain(chain: ChainRoot): EvolutionStep[] {
  const steps: EvolutionStep[] = []
  function walk(node: { species: { name: string; url: string }; evolves_to?: EvolvesTo[] }) {
    if (!node) return
    const id = node.species.url.split('/')[6]
    steps.push({ name: node.species.name, id })
    if (node.evolves_to) {
      node.evolves_to.forEach(walk)
    }
  }
  walk(chain)
  return steps
}
