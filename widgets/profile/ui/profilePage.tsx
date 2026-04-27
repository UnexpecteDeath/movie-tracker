"use client";

import { LiquidGlass } from "@/shared";
import { useProfilePage } from "../model/useProfilePage";
import { ProfileCard } from "./profileCard";
import { ProfileCardSkeleton } from "./profileCardSkeleton";
import styles from "./profilePage.module.css";

type Props = {
    profileId?: string;
};

export function ProfilePage({ profileId }: Props) {
    const {
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
    } = useProfilePage({ profileId });

    return (
        <main className={styles.page}>
            <div className={styles.glow} />
            <div className={styles.glowSecondary} />

            <section
                className={styles.shell}
                aria-labelledby="profile-title"
                aria-busy={isLoading}
            >
                {isLoading ? (
                    <ProfileCardSkeleton showPrivateFields={!profileId} />
                ) : profile ? (
                    <ProfileCard
                        profile={profile}
                        receivedGifts={receivedGifts}
                        giftsError={giftsError}
                        isSigningOut={isSigningOut}
                        isAvatarUploading={isAvatarUploading}
                        isClaimingDailyBonus={isClaimingDailyBonus}
                        onSignOut={handleSignOut}
                        onAvatarChange={handleAvatarChange}
                        onClaimDailyBonus={handleClaimDailyBonus}
                    />
                ) : (
                    <LiquidGlass
                        className={styles.statusCard}
                        radius="xl"
                        padding="none"
                    >
                        <div className={styles.statusContent}>
                            <p className={styles.statusEyebrow}>
                                Profile error
                            </p>
                            <h2 className={styles.statusTitle}>
                                Профиль недоступен
                            </h2>
                            <p className={styles.statusText}>
                                {error || "Не удалось получить данные профиля."}
                            </p>
                        </div>
                    </LiquidGlass>
                )}
            </section>
        </main>
    );
}
