import { LiquidGlass } from "@/shared";
import giftStyles from "@/entities/gift/ui/gift.module.css";
import profileStyles from "./profileCard.module.css";
import showcaseStyles from "./profileGiftsShowcase.module.css";
import skeletonStyles from "./profileCardSkeleton.module.css";

type Props = {
    showPrivateFields: boolean;
};

type ProfileStatCardSkeletonProps = {
    toneClassName: string;
};

function ProfileStatCardSkeleton({
    toneClassName,
}: ProfileStatCardSkeletonProps) {
    return (
        <LiquidGlass
            className={`${profileStyles.statCard} ${toneClassName}`}
            radius="lg"
            padding="none"
        >
            <div className={profileStyles.statCardBody}>
                <span className={profileStyles.statIcon} aria-hidden="true">
                    <span
                        className={`${skeletonStyles.skeleton} ${skeletonStyles.skeletonStatIcon}`}
                    />
                </span>
                <span
                    className={`${skeletonStyles.skeleton} ${skeletonStyles.skeletonStatValue}`}
                    aria-hidden="true"
                />
            </div>
        </LiquidGlass>
    );
}

export function ProfileCardSkeleton({ showPrivateFields }: Props) {
    return (
        <LiquidGlass
            className={profileStyles.card}
            radius="xl"
            padding="none"
            aria-hidden="true"
        >
            <div
                className={`${profileStyles.content} ${profileStyles.cardPanel}`}
            >
                <div className={profileStyles.profileMain}>
                    <div className={profileStyles.identityBlock}>
                        {showPrivateFields ? (
                            <label
                                className={`${profileStyles.avatarWrap} ${skeletonStyles.avatarWrapLoading}`}
                                aria-label="Загрузка аватарки"
                            >
                                <input
                                    className={profileStyles.avatarInput}
                                    type="file"
                                    tabIndex={-1}
                                    disabled
                                />
                                <span
                                    className={`${skeletonStyles.skeleton} ${skeletonStyles.skeletonAvatar}`}
                                    aria-hidden="true"
                                />
                            </label>
                        ) : (
                            <div
                                className={`${profileStyles.avatarWrap} ${profileStyles.avatarWrapStatic} ${skeletonStyles.avatarWrapLoading}`}
                            >
                                <span
                                    className={`${skeletonStyles.skeleton} ${skeletonStyles.skeletonAvatar}`}
                                    aria-hidden="true"
                                />
                            </div>
                        )}

                        <div className={profileStyles.profileInfo}>
                            <h2 className={profileStyles.name}>
                                <span
                                    className={`${skeletonStyles.skeleton} ${skeletonStyles.inlineSkeleton} ${skeletonStyles.skeletonName}`}
                                    aria-hidden="true"
                                />
                            </h2>
                            {showPrivateFields ? (
                                <p className={profileStyles.email}>
                                    <span
                                        className={`${skeletonStyles.skeleton} ${skeletonStyles.inlineSkeleton} ${skeletonStyles.skeletonEmail}`}
                                        aria-hidden="true"
                                    />
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className={profileStyles.detailsStack}>
                        <div className={profileStyles.meta}>
                            <span className={profileStyles.metaLabel}>
                                <span
                                    className={`${skeletonStyles.skeleton} ${skeletonStyles.inlineSkeleton} ${skeletonStyles.skeletonMetaLabel}`}
                                    aria-hidden="true"
                                />
                            </span>
                            <span className={profileStyles.metaValue}>
                                <span
                                    className={`${skeletonStyles.skeleton} ${skeletonStyles.inlineSkeleton} ${skeletonStyles.skeletonMetaValue}`}
                                    aria-hidden="true"
                                />
                            </span>
                        </div>

                        <div className={profileStyles.statsGrid}>
                            <ProfileStatCardSkeleton
                                toneClassName={profileStyles.statCardStreak}
                            />
                            <ProfileStatCardSkeleton
                                toneClassName={profileStyles.statCardBalance}
                            />
                        </div>
                    </div>

                    {showPrivateFields ? (
                        <div className={profileStyles.actions}>
                            <div
                                className={profileStyles.dailyBonusButton}
                                aria-hidden="true"
                            >
                                <span className={profileStyles.dailyBonusLabel}>
                                    <span
                                        className={`${skeletonStyles.skeleton} ${skeletonStyles.inlineSkeleton} ${skeletonStyles.skeletonButtonLabel}`}
                                    />
                                </span>
                                <span className={profileStyles.dailyBonusHint}>
                                    <span
                                        className={`${skeletonStyles.skeleton} ${skeletonStyles.inlineSkeleton} ${skeletonStyles.skeletonButtonHint}`}
                                    />
                                </span>
                            </div>

                            <div
                                className={profileStyles.signOutButton}
                                aria-hidden="true"
                            >
                                <span
                                    className={`${skeletonStyles.skeleton} ${skeletonStyles.inlineSkeleton} ${skeletonStyles.skeletonSignOutLabel}`}
                                />
                            </div>
                        </div>
                    ) : null}
                </div>

                <aside
                    className={showcaseStyles.giftsColumn}
                    aria-label="Подарки профиля"
                    aria-hidden="true"
                >
                    <div className={showcaseStyles.giftsPanel}>
                        <div className={showcaseStyles.giftsHeader}>
                            <div className={showcaseStyles.giftsHeading}>
                                <p className={showcaseStyles.giftsEyebrow}>
                                    <span
                                        className={`${skeletonStyles.skeleton} ${skeletonStyles.inlineSkeleton} ${skeletonStyles.skeletonGiftEyebrow}`}
                                    />
                                </p>
                                <h3 className={showcaseStyles.giftsTitle}>
                                    <span
                                        className={`${skeletonStyles.skeleton} ${skeletonStyles.inlineSkeleton} ${skeletonStyles.skeletonGiftTitle}`}
                                    />
                                </h3>
                            </div>
                        </div>

                        <div className={showcaseStyles.giftsScroll}>
                            <div className={showcaseStyles.giftsGrid}>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`${giftStyles.tileButton} ${giftStyles.tileButtonDisabled} ${showcaseStyles.giftTile} ${skeletonStyles.giftTileButton}`}
                                        tabIndex={-1}
                                    >
                                        <LiquidGlass
                                            className={giftStyles.tile}
                                            radius="lg"
                                            padding="none"
                                        >
                                            <div
                                                className={giftStyles.tileInner}
                                            >
                                                <span
                                                    className={`${skeletonStyles.skeleton} ${skeletonStyles.skeletonGiftAsset}`}
                                                    aria-hidden="true"
                                                />
                                            </div>
                                        </LiquidGlass>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </LiquidGlass>
    );
}
