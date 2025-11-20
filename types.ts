export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface Asset {
    id: number;
    asset_code: string;
    asset_name: string;
    model?: string;
    fa_ledger?: string;
    date_of_purchase?: string;
    cost_of_asset?: number;
    useful_life?: string; // Interval type
    number_marked?: string;
    quantity?: number;
    assigned_to?: string;
    location?: string;
    closing_stock_rs?: number;
    status: 'In Use' | 'In Storage' | 'For Repair' | string;
    remarks?: string;
    category_id?: number;
    category?: string; // from JOIN
}

export type AssetSortKey = 'asset_code' | 'asset_name' | 'status' | 'quantity' | 'location' | 'assigned_to';

export type SortDirection = 'asc' | 'desc';

export interface AssetSortConfig {
    key: AssetSortKey;
    direction: SortDirection;
}
