export type CollectionType = 'post' | 'food';

export interface CollectionItem {
    id: number; // Unique ID for the collection entry itself
    collectedId: number; // ID of the collected post or food item
    type: CollectionType;
    title: string;
    imageUrl: string;
    collectedAt: string | Date; // ISO string or Date object
    link: string; // Router link to the detail page
} 