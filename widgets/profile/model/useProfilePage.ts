"use client";

import { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/useAuth";
import { supabase } from "@/shared/api/supabaseClient";
import type { ProfileGiftViewData, ProfileViewData } from "./types";
import {
    mapProfileToViewData,
    mapUserGiftToViewData,
} from "@/widgets/profile/model/index";

type UseProfilePageArgs = {
    profileId?: string;
};

type DailyBonusResponse = {
    status?: string;
    text?: string;
};

const getReceivedGifts = async (
    receiverId: string,
): Promise<ProfileGiftViewData[]> => {
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

    return (data ?? []).map(mapUserGiftToViewData);
};

export const useProfilePage = ({ profileId }: UseProfilePageArgs = {}) => {
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileViewData | null>(null);
    const [receivedGifts, setReceivedGifts] = useState<ProfileGiftViewData[]>(
        [],
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);
    const [isClaimingDailyBonus, setIsClaimingDailyBonus] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [giftsError, setGiftsError] = useState<string | null>(null);
    const { getPrivateInfo, getProfileByUuid, getUser, signOut, avatarChange } =
        useAuth();

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            try {
                setError(null);
                setGiftsError(null);
                setReceivedGifts([]);

                const user = await getUser();
                const isOwnerProfile = !profileId || user?.id === profileId;

                if (isOwnerProfile) {
                    const receiverId = user?.id;
                    const [privateProfile, nextGifts] = await Promise.all([
                        getPrivateInfo(),
                        receiverId
                            ? getReceivedGifts(receiverId).catch(
                                  (giftError) => {
                                      if (isMounted) {
                                          setGiftsError(
                                              giftError instanceof Error
                                                  ? giftError.message
                                                  : "Не удалось загрузить подарки.",
                                          );
                                      }

                                      return [];
                                  },
                              )
                            : Promise.resolve([]),
                    ]);

                    if (!isMounted) return;

                    if (!privateProfile) {
                        router.replace("/sign-in");
                        return;
                    }

                    setProfile(
                        mapProfileToViewData(
                            {
                                nickname: privateProfile.nickname,
                                avatarUrl: privateProfile.avatarUrl,
                                createdAt: privateProfile.createdAt,
                                streakCount: privateProfile.streakCount,
                                balance: privateProfile.balance,
                            },
                            true,
                            privateProfile.email ?? null,
                        ),
                    );
                    setReceivedGifts(nextGifts);

                    return;
                }

                const [publicProfile, nextGifts] = await Promise.all([
                    getProfileByUuid(profileId),
                    getReceivedGifts(profileId).catch((giftError) => {
                        if (isMounted) {
                            setGiftsError(
                                giftError instanceof Error
                                    ? giftError.message
                                    : "Не удалось загрузить подарки.",
                            );
                        }

                        return [];
                    }),
                ]);

                if (!isMounted) return;

                setProfile(mapProfileToViewData(publicProfile, false));
                setReceivedGifts(nextGifts);
            } catch {
                if (!isMounted) {
                    return;
                }

                setError("Не удалось загрузить профиль.");
                setProfile(null);
            } finally {
                if (!isMounted) return;

                setIsLoading(false);
            }
        };

        setIsLoading(true);
        void loadProfile();

        return () => {
            isMounted = false;
        };
    }, [getPrivateInfo, getProfileByUuid, getUser, profileId, router]);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        await signOut();
    };

    const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
        setIsAvatarUploading(true);

        try {
            const avatarUrl = await avatarChange(event);

            if (!avatarUrl) {
                return;
            }

            setProfile((currentProfile) => {
                if (!currentProfile) {
                    return currentProfile;
                }

                return {
                    ...currentProfile,
                    avatarUrl,
                };
            });
        } finally {
            setIsAvatarUploading(false);
        }
    };

    const handleClaimDailyBonus = async () => {
        setIsClaimingDailyBonus(true);

        try {
            const user = await getUser();

            if (!user) {
                toast.error("decline: Пользователь не авторизован.");
                router.replace("/sign-in");
                return;
            }

            const { data, error: rpcError } = await supabase.rpc(
                "claim_daily_bonus",
                {
                    user_id: user.id,
                },
            );

            if (rpcError) {
                toast.error(`decline: ${rpcError.message}`);
                return;
            }

            const result = data as DailyBonusResponse | null;
            const status = result?.status;
            const text = result?.text;

            if (typeof status !== "string" || typeof text !== "string") {
                toast.error("decline: Некорректный ответ сервера.");
                return;
            }

            const message = `${status}: ${text}`;

            if (status === "success") {
                const refreshedProfile = await getPrivateInfo();

                if (refreshedProfile) {
                    setProfile(
                        mapProfileToViewData(
                            {
                                nickname: refreshedProfile.nickname,
                                avatarUrl: refreshedProfile.avatarUrl,
                                createdAt: refreshedProfile.createdAt,
                                streakCount: refreshedProfile.streakCount,
                                balance: refreshedProfile.balance,
                            },
                            true,
                            refreshedProfile.email ?? null,
                        ),
                    );
                }

                toast.success(message);
                return;
            }

            toast.error(message);
        } catch {
            toast.error("decline: Не удалось получить ежедневный бонус.");
        } finally {
            setIsClaimingDailyBonus(false);
        }
    };

    return {
        profile,
        receivedGifts,
        isLoading,
        error,
        giftsError,
        isSigningOut,
        isAvatarUploading,
        isClaimingDailyBonus,
        handleSignOut,
        handleAvatarChange,
        handleClaimDailyBonus,
    };
};
