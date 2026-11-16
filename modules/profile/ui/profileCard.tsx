"use client";

import Image from "next/image";
import type { ChangeEvent, ReactNode } from "react";
import { Card } from "@/shared/ui/card";
import type { ReceivedGift } from "@/modules/gifts";
import type { ProfileViewData } from "../model/types";
import fire from "../assets/fire.gif";
import popcorn from "../assets/popcorn.gif";
import { ProfileGiftsShowcase } from "./profileGiftsShowcase";
import styles from "./profileCard.module.css";

type Props = {
    profile: ProfileViewData;
    receivedGifts: ReceivedGift[];
    giftsError: string | null;
    isSigningOut: boolean;
    isAvatarUploading: boolean;
    isClaimingDailyBonus: boolean;
    onSignOut: () => Promise<void>;
    onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
    onClaimDailyBonus: () => Promise<void>;
};

function ProfileStat({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className={styles.stat}>
            <span className={styles.statIcon} aria-hidden="true">
                {icon}
            </span>
            <span className={styles.statLabel}>{label}</span>
            <strong className={styles.statValue}>{value}</strong>
        </div>
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
    const name = profile.nickname || "Киноман";
    const avatar = profile.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.avatar} src={profile.avatarUrl} alt="" />
    ) : (
        <span className={styles.avatarFallback} aria-hidden="true">
            {name.charAt(0).toUpperCase()}
        </span>
    );

    return (
        <div className={styles.layout}>
            <Card>
                <header className={styles.identity}>
                    {profile.isOwner ? (
                        <label className={styles.avatarControl}>
                            <input
                                className={styles.avatarInput}
                                type="file"
                                accept="image/*"
                                aria-label="Изменить аватарку"
                                onChange={(event) => void onAvatarChange(event)}
                                disabled={isAvatarUploading}
                            />
                            {avatar}
                            <span
                                className={styles.avatarBadge}
                                aria-hidden="true"
                            >
                                {isAvatarUploading ? "…" : "+"}
                            </span>
                        </label>
                    ) : (
                        <div className={styles.avatarControl}>{avatar}</div>
                    )}

                    <div className={styles.profileInfo}>
                        <h2 className={styles.name}>{name}</h2>
                        {profile.isOwner && profile.email && (
                            <p className={styles.secondary}>{profile.email}</p>
                        )}
                        <p className={styles.secondary}>
                            Аккаунт создан {profile.createdAt}
                        </p>
                    </div>
                </header>

                <div className={styles.stats}>
                    <ProfileStat
                        icon={
                            <Image src={fire} alt="" width={28} height={28} />
                        }
                        label="Серия"
                        value={profile.streakCount}
                    />
                    <ProfileStat
                        icon={
                            <Image
                                src={popcorn}
                                alt=""
                                width={28}
                                height={28}
                            />
                        }
                        label="Баланс"
                        value={profile.balance}
                    />
                </div>

                {profile.isOwner && (
                    <footer className={styles.actions}>
                        <button
                            className={styles.bonusButton}
                            type="button"
                            onClick={() => void onClaimDailyBonus()}
                            disabled={isClaimingDailyBonus}
                        >
                            {isClaimingDailyBonus
                                ? "Начисляем бонус…"
                                : "Получить ежедневный бонус"}
                        </button>
                        <button
                            className={styles.actionButton}
                            type="button"
                            onClick={() => void onSignOut()}
                            disabled={isSigningOut}
                        >
                            {isSigningOut ? "Выходим…" : "Выйти"}
                        </button>
                        <p className={styles.actionHint}>
                            Бонус доступен один раз в 24 часа.
                        </p>
                    </footer>
                )}
            </Card>

            <ProfileGiftsShowcase
                gifts={receivedGifts}
                giftsError={giftsError}
            />
        </div>
    );
}
