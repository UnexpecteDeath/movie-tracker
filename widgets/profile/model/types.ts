import type { GiftItem } from "@/entities/gift";

export type ProfileGiftViewData = {
    id: string;
    gift: GiftItem;
    message: string | null;
    status: string;
    createdAt: string;
    senderName: string;
};

export type ProfileViewData = {
    nickname: string;
    avatarUrl: string | null;
    createdAt: string;
    streakCount: number;
    balance: number;
    email?: string | null;
    isOwner: boolean;
};
