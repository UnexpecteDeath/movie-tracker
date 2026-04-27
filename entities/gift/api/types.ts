export type GiftType = "gif" | "wish";

export type GiftItem = {
    id: number;
    name: string;
    description: string;
    price: number;
    rarity: "common" | "rare" | "epic" | "mystical";
    type: GiftType;
    asset_url: string | null;
    duration_days: number | null;
    is_active: boolean;
    created_at: string;
};

export type GetGiftsArgs = {
    type?: GiftType;
    onlyActive?: boolean;
};

export type GiftRecipient = {
    id: string;
    nickname: string;
    avatarUrl: string | null;
};
