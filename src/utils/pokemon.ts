export function pokemonIdFromUrl(url: string): string {
  return url.split('/')[6]
}

export function pokemonName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}
