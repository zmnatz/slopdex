import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PokemonData, SpeciesData } from "../utils/types";
import { GameIdentityCard } from "./GameIdentityCard";

const mockPokemon: PokemonData = {
  name: "gengar",
  sprites: {
    front_default: "https://example.com/gengar.png",
    other: { "official-artwork": { front_default: "https://example.com/gengar-art.png" } },
  },
  types: [{ slot: 1, type: { name: "ghost" } }],
  stats: [],
  abilities: [],
  height: 15,
  weight: 405,
  cries: { latest: "", legacy: "" },
  moves: [],
  game_indices: [],
};

const mockSpecies: SpeciesData = {
  generation: { name: "generation-i" },
  evolution_chain: { url: "" },
  flavor_text_entries: [
    { flavor_text: "It hides in shadows.", language: { name: "en" }, version: { name: "red" } },
  ],
  genera: [{ genus: "Shadow Pokémon", language: { name: "en" } }],
};

function renderCard(props?: { flipping?: boolean; onNext?: () => void }) {
  return render(
    <GameIdentityCard
      pokeData={mockPokemon}
      speciesData={mockSpecies}
      onNext={props?.onNext ?? (() => {})}
      {...props}
    />
  );
}

describe("GameIdentityCard", () => {
  it("starts masked: silhouette and ???", () => {
    renderCard();
    expect(screen.getByAltText("Mystery Pokémon")).toBeTruthy();
    expect(screen.getByText("???")).toBeTruthy();
    expect(screen.getByAltText("gengar")).toBeTruthy();
    expect(screen.getByText("gengar")).toBeTruthy();
  });

  it("shows artwork and name once unmasked", () => {
    renderCard();
    fireEvent.click(screen.getByTestId("flip-card"));
    expect(screen.getByAltText("gengar")).toBeTruthy();
    expect(screen.getByText("gengar")).toBeTruthy();
  });

  it("shows type chips and genus as static clues", () => {
    renderCard();
    expect(screen.getByText("ghost")).toBeTruthy();
    expect(screen.getByText("Shadow Pokémon")).toBeTruthy();
  });

  it("clicking the card reveals when masked", () => {
    renderCard();
    fireEvent.click(screen.getByTestId("flip-card"));
    expect(screen.getByAltText("gengar")).toBeTruthy();
    expect(screen.getByText("gengar")).toBeTruthy();
  });

  it("clicking the card calls onNext once unmasked", () => {
    const onNext = vi.fn();
    renderCard({ onNext });
    fireEvent.click(screen.getByTestId("flip-card"));
    fireEvent.click(screen.getByTestId("flip-card"));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("the flip button toggles without advancing", () => {
    renderCard();
    const flip = document.querySelector('[aria-label="Flip"]')!;
    fireEvent.click(flip);
    expect(screen.getByAltText("gengar")).toBeTruthy();
    fireEvent.click(flip);
    expect(screen.getByAltText("Mystery Pokémon")).toBeTruthy();
  });

  it("shows the description clearly once unmasked", () => {
    const { container } = renderCard();
    fireEvent.click(screen.getByTestId("flip-card"));
    const flavorEl = Array.from(container.querySelectorAll("p")).find((p) =>
      p.textContent?.includes("It hides in shadows")
    );
    expect(flavorEl?.textContent).toContain("It hides in shadows");
    expect((flavorEl as HTMLElement).style.filter).not.toContain("blur");
  });
});
