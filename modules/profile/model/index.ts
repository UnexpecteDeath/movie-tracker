import type { ProfileViewData } from "./types";

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

export type { ProfileViewData } from "./types";
