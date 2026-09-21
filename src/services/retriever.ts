import interactions from "../data/interactions.json" with { type: "json" };

export interface Interaction {
  id: string;
  drugs: string[];
  severity: string;
  summary: string;
}

export function retrieveRelevantInteractions(drugNames: string[]): Interaction[] {
  const normalized = drugNames.map(d => d.toLowerCase());
  return (interactions as Interaction[]).filter(entry =>
    entry.drugs.some(d => normalized.includes(d.toLowerCase()))
  );
}