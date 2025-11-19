import Fuse from 'fuse.js';
import type { Item } from '../types/Item';
import type { DecisionReason } from '../types/Item';

export interface SearchableItem extends Item {
  decisionData: DecisionReason;
}

/**
 * Determines if an item is a cosmetic (outfit, emote, charm, color)
 */
export function isCosmetic(item: Item): boolean {
  const id = item.id.toLowerCase() || '';
  return (
    id.includes('outfit') ||
    id.includes('emote') ||
    id.includes('backpack-charm') || 
    id.includes('backpack-attachment') ||
    id.includes('color') ||
    id.includes('colour') ||
    id.includes('variant') ||
    id.includes('face-style')
  );
}

export class SearchEngine {
  private fuse: Fuse<SearchableItem>;

  constructor(items: SearchableItem[]) {
    this.fuse = new Fuse(items, {
      keys: [
        { name: 'name', weight: 2, getFn: (item) => Object.keys(item.name).reduce((prev, curr) => `${prev} | ${item.name[curr]}`, "")},
        { name: 'description', weight: 1, getFn: (item) => Object.keys(item.description ?? {}).reduce((prev, curr) => `${prev} | ${item.description![curr] ?? ""}`, "")},
        { name: 'type', weight: 1.5 },
        { name: 'id', weight: 0.5 }
      ],
      threshold: 0.2,
      ignoreDiacritics: true,
      includeScore: true,
      useExtendedSearch: true,
    });
  }

  /**
   * Search items by query
   */
  search(query: string): SearchableItem[] {
    if (!query.trim()) {
      return [];
    }
    const results = this.fuse.search(query);
    return results.map(result => result.item);
  }

  /**
   * Update search index with new items
   */
  updateIndex(items: SearchableItem[]): void {
    this.fuse.setCollection(items);
  }
}
