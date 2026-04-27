import type { GiftItem } from "../api/types";

type GiftRarityClassName =
    | "rarityCommon"
    | "rarityRare"
    | "rarityEpic"
    | "rarityMystical";

const rarityLabelByKey = {
    common: "Обычный",
    rare: "Редкий",
    epic: "Эпический",
    mystical: "Мистический",
} as const satisfies Record<GiftItem["rarity"], string>;

const rarityClassNameByKey = {
    common: "rarityCommon",
    rare: "rarityRare",
    epic: "rarityEpic",
    mystical: "rarityMystical",
} as const satisfies Record<GiftItem["rarity"], GiftRarityClassName>;

export const getGiftRarityLabel = (rarity: GiftItem["rarity"]) =>
    rarityLabelByKey[rarity];

export const getGiftRarityClassName = (rarity: GiftItem["rarity"]) =>
    rarityClassNameByKey[rarity];
