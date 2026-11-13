export type ProfileViewData = {
    nickname: string;
    avatarUrl: string | null;
    createdAt: string;
    streakCount: number;
    balance: number;
    email?: string | null;
    isOwner: boolean;
};
