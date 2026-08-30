import { useQuery } from "@tanstack/react-query";
/* eslint-disable react/only-export-components */
import { type ReactNode, createContext, useContext, useState } from "react";
import { pokeApi } from "../utils/api";

interface TypeInfo {
  name: string;
}

interface FiltersValue {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  genFilter: string;
  setGenFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  types: { name: string }[];
}

// eslint-disable-next-line react/only-export-components
const FiltersContext = createContext<FiltersValue | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [genFilter, setGenFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const typeListQuery = useQuery({
    queryKey: ["types", "list"],
    queryFn: pokeApi.getTypeList,
    staleTime: Number.POSITIVE_INFINITY,
    select: (data: { results: TypeInfo[] }) =>
      data.results.filter((t) => t.name !== "unknown" && t.name !== "shadow"),
  });

  return (
    <FiltersContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        genFilter,
        setGenFilter,
        typeFilter,
        setTypeFilter,
        types: typeListQuery.data ?? [],
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters(): FiltersValue {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used inside <FiltersProvider>");
  return ctx;
}
