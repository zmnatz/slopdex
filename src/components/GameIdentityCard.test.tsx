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

type Props = React.ComponentProps<typeof GameIdentityCard>;

function renderCard(props?: Partial<Props>) {
  return render(
    <GameIdentityCard
      pokeData={mockPokemon}
      speciesData={mockSpecies}
      masked={true}
      onToggle={() => {}}
      onNext={() => {}}
      {...props}
    />
  );
}

describe("GameIdentityCard", () => {
  it("shows silhouette and ??? while masked", () => {
    renderCard();
    expect(screen.getByAltText("Mystery Pokémon")).toBeTruthy();
    expect(screen.getByText("???")).toBeTruthy();
    expect(screen.getByAltText("gengar")).toBeTruthy();
    expect(screen.getByText("gengar")).toBeTruthy();
  });

  it("shows artwork and name once unmasked", () => {
    renderCard({ masked: false });
    expect(screen.getByAltText("gengar")).toBeTruthy();
    expect(screen.getByText("gengar")).toBeTruthy();
    expect(screen.getByAltText("Mystery Pokémon")).toBeTruthy();
    expect(screen.getByText("???")).toBeTruthy();
  });

  it("shows type chips and genus as static clues", () => {
    renderCard();
    expect(screen.getByText("ghost")).toBeTruthy();
    expect(screen.getByText("Shadow Pokémon")).toBeTruthy();
  });

  it("clicking the card reveals while masked", () => {
    const onToggle = vi.fn();
    const onNext = vi.fn();
    renderCard({ masked: true, onToggle, onNext });

    fireEvent.click(screen.getByTestId("flip-card"));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();
  });

  it("clicking the card advances once unmasked", () => {
    const onToggle = vi.fn();
    const onNext = vi.fn();
    renderCard({ masked: false, onToggle, onNext });

    fireEvent.click(screen.getByTestId("flip-card"));
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("the flip button toggles without advancing", () => {
    const onToggle = vi.fn();
    const onNext = vi.fn();
    const masked = renderCard({ masked: true, onToggle, onNext });
    const flip = masked.container.querySelector('[aria-label="Flip"]')!;

    fireEvent.click(flip);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();

    const unmasked = renderCard({ masked: false, onToggle, onNext });
    const flipAgain = unmasked.container.querySelector('[aria-label="Flip"]')!;

    fireEvent.click(flipAgain);
    expect(onToggle).toHaveBeenCalledTimes(2);
    expect(onNext).not.toHaveBeenCalled();
  });

  it("shows the description clearly once unmasked", () => {
    const unmasked = renderCard({ masked: false });
    const flavorEl = Array.from(unmasked.container.querySelectorAll("p")).find((p) =>
      p.textContent?.includes("It hides in shadows")
    );
    expect(flavorEl?.textContent).toContain("It hides in shadows");
    expect((flavorEl as HTMLElement).style.filter).not.toContain("blur");
  });
});
