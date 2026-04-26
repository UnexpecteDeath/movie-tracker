import { LiquidGlass } from "@/shared";
import styles from "./profileCardSkeleton.module.css";

type Props = {
    showPrivateFields: boolean;
};

export function ProfileCardSkeleton({ showPrivateFields }: Props) {
    return (
        <LiquidGlass className={styles.card} radius="xl" padding="none" shadow>
            <div className={`${styles.content} ${styles.cardPanel}`}>
                <div className={styles.profileMain}>
                    <div className={styles.identityBlock}>
                        <div
                            className={`${styles.avatarWrap} ${styles.avatarWrapLoading}`}
                        >
                            <span
                                className={`${styles.skeleton} ${styles.skeletonAvatar}`}
                                aria-hidden="true"
                            />
                        </div>

                        <div className={styles.profileInfo}>
                            <h2 className={styles.name}>
                                <span
                                    className={`${styles.skeleton} ${styles.skeletonName}`}
                                    aria-hidden="true"
                                />
                            </h2>
                            {showPrivateFields ? (
                                <p className={styles.email}>
                                    <span
                                        className={`${styles.skeleton} ${styles.skeletonEmail}`}
                                        aria-hidden="true"
                                    />
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className={styles.detailsStack}>
                        <div className={styles.meta}>
                            <span className={styles.metaLabel}>
                                <span
                                    className={`${styles.skeleton} ${styles.skeletonMetaLabel}`}
                                    aria-hidden="true"
                                />
                            </span>
                            <span className={styles.metaValue}>
                                <span
                                    className={`${styles.skeleton} ${styles.skeletonMetaValue}`}
                                    aria-hidden="true"
                                />
                            </span>
                        </div>

                        <div className={styles.statsGrid}>
                            <LiquidGlass
                                className={`${styles.statCard} ${styles.statCardSkeleton} ${styles.statCardStreak}`}
                                radius="lg"
                                padding="none"
                            >
                                <div className={styles.statCardBody}>
                                    <span
                                        className={styles.statIconSkeleton}
                                        aria-hidden="true"
                                    />
                                    <span
                                        className={`${styles.skeleton} ${styles.skeletonStatValueCompact}`}
                                        aria-hidden="true"
                                    />
                                </div>
                            </LiquidGlass>

                            <LiquidGlass
                                className={`${styles.statCard} ${styles.statCardSkeleton} ${styles.statCardBalance}`}
                                radius="lg"
                                padding="none"
                            >
                                <div className={styles.statCardBody}>
                                    <span
                                        className={styles.statIconSkeleton}
                                        aria-hidden="true"
                                    />
                                    <span
                                        className={`${styles.skeleton} ${styles.skeletonStatValueCompact}`}
                                        aria-hidden="true"
                                    />
                                </div>
                            </LiquidGlass>
                        </div>
                    </div>

                    {showPrivateFields ? (
                        <div className={styles.actions}>
                            <div
                                className={styles.dailyBonusButton}
                                aria-hidden="true"
                            >
                                <span
                                    className={`${styles.skeleton} ${styles.skeletonButtonLabel}`}
                                />
                            </div>
                            <div
                                className={styles.signOutButton}
                                aria-hidden="true"
                            >
                                <span
                                    className={`${styles.skeleton} ${styles.skeletonButtonLabel}`}
                                />
                            </div>
                        </div>
                    ) : null}
                </div>

                <aside className={styles.giftsColumn} aria-hidden="true">
                    <div className={styles.giftsPanel}>
                        <div className={styles.giftsHeader}>
                            <div className={styles.giftsHeading}>
                                <span
                                    className={`${styles.skeleton} ${styles.skeletonGiftEyebrow}`}
                                />
                                <span
                                    className={`${styles.skeleton} ${styles.skeletonGiftTitle}`}
                                />
                            </div>
                            <span
                                className={`${styles.skeleton} ${styles.skeletonGiftCount}`}
                            />
                        </div>

                        <div className={styles.giftsScroll}>
                            <div className={styles.giftsGrid}>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <LiquidGlass
                                        key={index}
                                        className={styles.giftTileSkeleton}
                                        radius="lg"
                                        padding="none"
                                    >
                                        <span
                                            className={`${styles.skeleton} ${styles.giftTileSkeletonInner}`}
                                        />
                                    </LiquidGlass>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </LiquidGlass>
    );
}
