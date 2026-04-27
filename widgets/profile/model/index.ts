import type { GiftItem } from "@/entities/gift";
import type {
    ProfileGiftViewData,
    ProfileViewData,
} from "@/widgets/profile/model/types";

type RelationValue<T> = T | T[] | null;

type UserGiftRow = {
    id: string | number;
    message: string | null;
    status: string | null;
    created_at: string | null;
    gifts: RelationValue<Partial<GiftItem>>;
    sender: RelationValue<SenderRelationRow>;
};

type SenderRelationRow = {
    nickname: string | null;
};

const EMPTY_DATE = new Date(0).toISOString();

const pickRelationRow = <T>(value: RelationValue<T>): T | null => {
    if (Array.isArray(value)) {
        return value[0] ?? null;
    }

    return value ?? null;
};

const toGiftItem = (giftRow: RelationValue<Partial<GiftItem>>): GiftItem => {
    const gift = pickRelationRow(giftRow);
    const giftId = Number(gift?.id);

    return {
        id: Number.isFinite(giftId) ? giftId : 0,
        name:
            typeof gift?.name === "string" && gift.name.trim()
                ? gift.name.trim()
                : "Без названия",
        description:
            typeof gift?.description === "string" ? gift.description : "",
        price: typeof gift?.price === "number" ? gift.price : 0,
        type: gift?.type === "wish" ? "wish" : "gif",
        asset_url:
            typeof gift?.asset_url === "string" && gift.asset_url.trim()
                ? gift.asset_url.trim()
                : null,
        duration_days:
            typeof gift?.duration_days === "number" ? gift.duration_days : null,
        is_active: typeof gift?.is_active === "boolean" ? gift.is_active : true,
        created_at:
            typeof gift?.created_at === "string" && gift.created_at.trim()
                ? gift.created_at
                : EMPTY_DATE,
        rarity: gift?.rarity ?? "common",
    };
};

export const mapProfileToViewData = (
    profile: Omit<ProfileViewData, "isOwner" | "email">,
    isOwner: boolean,
    email?: string | null,
): ProfileViewData => ({
    nickname: profile.nickname,
    avatarUrl: profile.avatarUrl,
    createdAt: profile.createdAt,
    streakCount: profile.streakCount,
    balance: profile.balance,
    email: email ?? null,
    isOwner,
});

export const mapUserGiftToViewData = (
    giftRow: UserGiftRow,
): ProfileGiftViewData => {
    const sender = pickRelationRow(giftRow.sender);

    return {
        id: String(giftRow.id),
        gift: toGiftItem(giftRow.gifts),
        message:
            typeof giftRow.message === "string" && giftRow.message.trim()
                ? giftRow.message.trim()
                : null,
        status:
            typeof giftRow.status === "string" && giftRow.status.trim()
                ? giftRow.status.trim()
                : "unknown",
        createdAt:
            typeof giftRow.created_at === "string" && giftRow.created_at.trim()
                ? giftRow.created_at
                : EMPTY_DATE,
        senderName:
            typeof sender?.nickname === "string" && sender.nickname.trim()
                ? sender.nickname.trim()
                : "Аноним",
    };
};

export type { ProfileGiftViewData, ProfileViewData } from "./types";
