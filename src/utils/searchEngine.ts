import Fuse from 'fuse.js';
import type { Item } from '../types/Item';
import type { DecisionReason } from '../types/Item';
import { SupportedLanguage } from './translationEngine';

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
  private _fuse!: Fuse<SearchableItem>;
  private _items: SearchableItem[];
  private _lang: SupportedLanguage;

  constructor(items: SearchableItem[], lang: SupportedLanguage) {
    this._items = items;
    this._lang = lang;
    this.initalizeFuse();
  }

  public setLanguage(lang: SupportedLanguage) {
    this._lang = lang;
    this.initalizeFuse();
  }

  private initalizeFuse() {
    this._fuse = new Fuse(this._items, {
      keys: [
        { name: 'name', weight: 2, getFn: (item) => item.name[this._lang]},
        { name: 'description', weight: 1, getFn: (item) => item.description?.[this._lang] ?? ""},
        { name: 'type', weight: 1.5 },
        { name: 'id', weight: 0.5 }
      ],
      threshold: 0.3,
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
    const results = this._fuse.search(query);
    return results.map(result => result.item);
  }

  /**
   * Update search index with new items
   */
  updateIndex(items: SearchableItem[]): void {
    this._fuse.setCollection(items);
  }
}
