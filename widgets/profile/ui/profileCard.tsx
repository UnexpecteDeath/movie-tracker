"use client";

import type { ChangeEvent } from "react";
import { LiquidGlass } from "@/shared";
import type { ProfileGiftViewData, ProfileViewData } from "../model/types";
import Image from "next/image";
import popcorn from "../assets/popcorn.gif";
import fire from "../assets/fire.gif";
import styles from "./profileCard.module.css";
import { ProfileGiftsShowcase } from "./profileGiftsShowcase";

type Props = {
    profile: ProfileViewData;
    receivedGifts: ProfileGiftViewData[];
    giftsError: string | null;
    isSigningOut: boolean;
    isAvatarUploading: boolean;
    isClaimingDailyBonus: boolean;
    onSignOut: () => Promise<void>;
    onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
    onClaimDailyBonus: () => Promise<void>;
};

type ProfileStatCardProps = {
    icon: React.ReactNode;
    value: number;
    toneClassName: string;
};

const getInitial = (nickname: string) =>
    nickname.slice(0, 1).toUpperCase() || "M";

function ProfileStatCard({ icon, value, toneClassName }: ProfileStatCardProps) {
    return (
        <LiquidGlass
            className={`${styles.statCard} ${toneClassName}`}
            radius="lg"
            padding="none"
        >
            <div className={styles.statCardBody}>
                <span className={styles.statIcon} aria-hidden="true">
                    {icon}
                </span>
                <span className={styles.statValue}>{value}</span>
            </div>
        </LiquidGlass>
    );
}

export function ProfileCard({
    profile,
    receivedGifts,
    giftsError,
    isSigningOut,
    isAvatarUploading,
    isClaimingDailyBonus,
    onSignOut,
    onAvatarChange,
    onClaimDailyBonus,
}: Props) {
    const avatar = profile.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.avatar} src={profile.avatarUrl} alt="" />
    ) : (
        <span className={styles.avatarFallback}>
            {getInitial(profile.nickname)}
        </span>
    );

    return (
        <LiquidGlass className={styles.card} radius="xl" padding="none">
            <div className={`${styles.content} ${styles.cardPanel}`}>
                <div className={styles.profileMain}>
                    <div className={styles.identityBlock}>
                        {profile.isOwner ? (
                            <label
                                className={styles.avatarWrap}
                                aria-label="Изменить аватарку"
                            >
                                <input
                                    className={styles.avatarInput}
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        void onAvatarChange(event)
                                    }
                                    disabled={isAvatarUploading}
                                />
                                {avatar}
                                <span className={styles.avatarOverlay}>
                                    {isAvatarUploading ? "..." : "+"}
                                </span>
                            </label>
                        ) : (
                            <div
                                className={`${styles.avatarWrap} ${styles.avatarWrapStatic}`}
                            >
                                {avatar}
                            </div>
                        )}

                        <div className={styles.profileInfo}>
                            <h2 className={styles.name}>
                                {profile.nickname || "Киноман"}
                            </h2>
                            {profile.isOwner && profile.email ? (
                                <p className={styles.email}>{profile.email}</p>
                            ) : null}
                        </div>
                    </div>

                    <div className={styles.detailsStack}>
                        <div className={styles.meta}>
                            <span className={styles.metaLabel}>
                                Аккаунт создан
                            </span>
                            <span className={styles.metaValue}>
                                {profile.createdAt}
                            </span>
                        </div>

                        <div className={styles.statsGrid}>
                            <ProfileStatCard
                                icon={
                                    <Image
                                        src={fire}
                                        alt="Серия"
                                        width={50}
                                        height={50}
                                    />
                                }
                                value={profile.streakCount}
                                toneClassName={styles.statCardStreak}
                            />
                            <ProfileStatCard
                                icon={
                                    <Image
                                        src={popcorn}
                                        alt="Баланс"
                                        width={50}
                                        height={50}
                                    />
                                }
                                value={profile.balance}
                                toneClassName={styles.statCardBalance}
                            />
                        </div>
                    </div>

                    {profile.isOwner ? (
                        <div className={styles.actions}>
                            <button
                                className={styles.dailyBonusButton}
                                type="button"
                                onClick={() => void onClaimDailyBonus()}
                                disabled={isClaimingDailyBonus}
                            >
                                <span className={styles.dailyBonusLabel}>
                                    {isClaimingDailyBonus
                                        ? "Начисляем ежедневный бонус..."
                                        : "Получить ежедневный бонус"}
                                </span>
                                <span className={styles.dailyBonusHint}>
                                    Доступно один раз в 24 часа
                                </span>
                            </button>

                            <button
                                className={styles.signOutButton}
                                type="button"
                                onClick={() => void onSignOut()}
                                disabled={isSigningOut}
                            >
                                {isSigningOut ? "Выход..." : "Выйти"}
                            </button>
                        </div>
                    ) : null}
                </div>

                <ProfileGiftsShowcase
                    gifts={receivedGifts}
                    giftsError={giftsError}
                />
            </div>
        </LiquidGlass>
    );
}
