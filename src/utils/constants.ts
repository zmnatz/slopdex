import type { GenRange } from './types'

export const GEN_RANGES: GenRange[] = [
  { name: 'Generation I', start: 1, end: 151 },
  { name: 'Generation II', start: 152, end: 251 },
  { name: 'Generation III', start: 252, end: 386 },
  { name: 'Generation IV', start: 387, end: 493 },
  { name: 'Generation V', start: 494, end: 649 },
  { name: 'Generation VI', start: 650, end: 721 },
  { name: 'Generation VII', start: 722, end: 809 },
  { name: 'Generation VIII', start: 810, end: 905 },
  { name: 'Generation IX', start: 906, end: 1025 },
]

export const TYPE_COLORS: Record<string, string> = {
  grass: '#7AC74C', fire: '#EE8130', water: '#6390F0',
  bug: '#A6B91A', normal: '#A8A77A', poison: '#A33A76',
  electric: '#F7D02C', ground: '#E2BF65', fairy: '#D685AD',
  fighting: '#C22E8E', psychic: '#F95587', rock: '#B6A136',
  ghost: '#735797', ice: '#96D9D6', dragon: '#6F35FC',
  dark: '#705746', steel: '#B7B7CE', flying: '#A98FFF',
}
