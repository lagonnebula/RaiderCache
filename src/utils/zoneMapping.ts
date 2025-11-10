export type ZoneType =
  | 'ARC'
  | 'Commercial'
  | 'Electrical'
  | 'Exodus'
  | 'Industrial'
  | 'Mechanical'
  | 'Medical'
  | 'Nature'
  | 'Old World'
  | 'Raider'
  | 'Residential'
  | 'Security'
  | 'Technological';

export interface ZoneInfo {
  name: ZoneType;
  displayName: string;
  description: string;
  maps: string[];
  color: string;
  category: 'building' | 'vendor' | 'environment' | 'enemy';
}

export const ZONE_INFO: Record<ZoneType, ZoneInfo> = {
  ARC: {
    name: 'ARC',
    displayName: 'ARC',
    description: 'Looted from ARC enemies',
    maps: ['All Maps'],
    color: '#3b82f6',
    category: 'enemy',
  },
  Commercial: {
    name: 'Commercial',
    displayName: 'Commercial',
    description: 'Commercial buildings and shops',
    maps: ['Dam Battleground', 'Spaceport', 'Buried City', 'Blue Gate'],
    color: '#8b5cf6',
    category: 'building',
  },
  Electrical: {
    name: 'Electrical',
    displayName: 'Electrical',
    description: 'Electrical rooms and power facilities',
    maps: ['Dam Battleground', 'Spaceport', 'Buried City', 'Blue Gate'],
    color: '#eab308',
    category: 'building',
  },
  Exodus: {
    name: 'Exodus',
    displayName: 'Exodus Vendor',
    description: 'Available from Exodus faction vendor',
    maps: ['Hideout'],
    color: '#06b6d4',
    category: 'vendor',
  },
  Industrial: {
    name: 'Industrial',
    displayName: 'Industrial',
    description: 'Industrial facilities and warehouses',
    maps: ['Dam Battleground', 'Spaceport', 'Buried City', 'Blue Gate'],
    color: '#64748b',
    category: 'building',
  },
  Mechanical: {
    name: 'Mechanical',
    displayName: 'Mechanical',
    description: 'Mechanical workshops and garages',
    maps: ['Dam Battleground', 'Spaceport', 'Buried City', 'Blue Gate'],
    color: '#78716c',
    category: 'building',
  },
  Medical: {
    name: 'Medical',
    displayName: 'Medical',
    description: 'Medical facilities and clinics',
    maps: ['Dam Battleground', 'Spaceport', 'Buried City', 'Blue Gate'],
    color: '#10b981',
    category: 'building',
  },
  Nature: {
    name: 'Nature',
    displayName: 'Nature',
    description: 'Natural outdoor areas',
    maps: ['Dam Battleground', 'Spaceport', 'Buried City', 'Blue Gate'],
    color: '#22c55e',
    category: 'environment',
  },
  'Old World': {
    name: 'Old World',
    displayName: 'Old World',
    description: 'Pre-war ruins and structures',
    maps: ['Dam Battleground', 'Spaceport', 'Buried City', 'Blue Gate'],
    color: '#a16207',
    category: 'building',
  },
  Raider: {
    name: 'Raider',
    displayName: 'Raider',
    description: 'Looted from Raider enemies',
    maps: ['All Maps'],
    color: '#dc2626',
    category: 'enemy',
  },
  Residential: {
    name: 'Residential',
    displayName: 'Residential',
    description: 'Residential buildings and homes',
    maps: ['Dam Battleground', 'Spaceport', 'Buried City', 'Blue Gate'],
    color: '#f59e0b',
    category: 'building',
  },
  Security: {
    name: 'Security',
    displayName: 'Security',
    description: 'Security checkpoints and stations',
    maps: ['Dam Battleground', 'Spaceport', 'Buried City', 'Blue Gate'],
    color: '#ef4444',
    category: 'building',
  },
  Technological: {
    name: 'Technological',
    displayName: 'Technological',
    description: 'High-tech facilities and labs',
    maps: ['Dam Battleground', 'Spaceport', 'Buried City', 'Blue Gate'],
    color: '#6366f1',
    category: 'building',
  },
};

/**
 * Get recommended maps for given zones
 */
export function getMapRecommendations(zones: string[]): string[] {
  const allMaps = new Set<string>();

  zones.forEach(zone => {
    const zoneInfo = ZONE_INFO[zone as ZoneType];
    if (zoneInfo) {
      zoneInfo.maps.forEach(map => allMaps.add(map));
    }
  });

  return Array.from(allMaps).sort();
}

/**
 * Get zone info for a specific zone
 */
export function getZoneInfo(zone: string): ZoneInfo | undefined {
  return ZONE_INFO[zone as ZoneType];
}

/**
 * Get all zones sorted by category
 */
export function getAllZones(): ZoneInfo[] {
  return Object.values(ZONE_INFO).sort((a, b) => {
    // Sort by category first, then by name
    if (a.category !== b.category) {
      const categoryOrder = { vendor: 0, building: 1, environment: 2, enemy: 3 };
      return categoryOrder[a.category] - categoryOrder[b.category];
    }
    return a.displayName.localeCompare(b.displayName);
  });
}

/**
 * Get zones grouped by category
 */
export function getZonesByCategory(): Record<string, ZoneInfo[]> {
  const grouped: Record<string, ZoneInfo[]> = {
    vendor: [],
    building: [],
    environment: [],
    enemy: [],
  };

  Object.values(ZONE_INFO).forEach(zone => {
    grouped[zone.category].push(zone);
  });

  return grouped;
}

/**
 * Count items in each zone
 */
export function countItemsByZone(items: Array<{ foundIn?: string[] }>): Record<ZoneType, number> {
  const counts: Record<string, number> = {};

  // Initialize counts
  Object.keys(ZONE_INFO).forEach(zone => {
    counts[zone] = 0;
  });

  // Count items
  items.forEach(item => {
    if (item.foundIn) {
      item.foundIn.forEach(zone => {
        if (zone in counts) {
          counts[zone]++;
        }
      });
    }
  });

  return counts as Record<ZoneType, number>;
}
