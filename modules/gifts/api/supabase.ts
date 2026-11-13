import { supabase } from "@/shared/api/supabaseClient";
import { mapReceivedGift } from "./mapReceivedGift";
import type {
    GetGiftsArgs,
    GiftItem,
    GiftRecipient,
    GiftType,
    ReceivedGift,
} from "./types";

const GIFTS_TABLE = "gifts";

export async function getGiftsByType(
    type: GiftType,
    args: Omit<GetGiftsArgs, "type"> = {},
): Promise<GiftItem[]> {
    const onlyActive = args.onlyActive ?? true;

    let query = supabase
        .from(GIFTS_TABLE)
        .select("*")
        .eq("type", type)
        .order("created_at", { ascending: false });

    if (onlyActive) {
        query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []) as GiftItem[];
}

export async function getGifts(
    args: Omit<GetGiftsArgs, "type"> = {},
): Promise<GiftItem[]> {
    return getGiftsByType("gif", args);
}

export async function getWishes(
    args: Omit<GetGiftsArgs, "type"> = {},
): Promise<GiftItem[]> {
    return getGiftsByType("wish", args);
}

export async function getReceivedGifts(
    receiverId: string,
): Promise<ReceivedGift[]> {
    await supabase.rpc("expire_gifts");
    const { data, error } = await supabase
        .from("user_gifts")
        .select(
            `
                id,
                message,
                status,
                created_at,
                gifts (
                    id,
                    name,
                    description,
                    price,
                    type,
                    duration_days,
                    created_at,
                    asset_url,
                    is_active,
                    rarity
                ),
                sender:sender_id (
                    nickname
                )
            `,
        )
        .eq("receiver_id", receiverId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []).map(mapReceivedGift);
}

export async function getAvailableGiftRecipients(
    currentUserId?: string,
): Promise<GiftRecipient[]> {
    let query = supabase
        .from("profiles")
        .select("id, nickname, avatar_url")
        .order("nickname", { ascending: true });

    if (currentUserId) {
        query = query.neq("id", currentUserId);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []).map((item) => ({
        id: String(item.id),
        nickname:
            typeof item.nickname === "string" && item.nickname.trim()
                ? item.nickname.trim()
                : "unknown",
        avatarUrl:
            typeof item.avatar_url === "string" && item.avatar_url.trim()
                ? item.avatar_url.trim()
                : null,
    }));
}
