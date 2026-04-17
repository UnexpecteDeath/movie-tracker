import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import { classNames } from "@/shared/lib";
import styles from "./movieCard.module.css";

type Props = {
    className?: string;
};

export function MovieSkeleton({ className }: Props) {
    return (
        <LiquidGlass
            className={classNames(styles.card, { [styles.skeleton]: true }, [
                className || "",
            ])}
            radius="xl"
            padding="none"
            aria-hidden="true"
        >
            <div className={styles.media}>
                <div className={styles.skeletonPoster} />

                <div className={styles.topBadges}>
                    <span className={styles.skeletonBadge} />
                    <span className={styles.skeletonBadge} />
                </div>

                <div className={styles.bottomInfo}>
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonSubtitle} />
                </div>
            </div>

            <div className={styles.content}>
                <div>
                    <div className={styles.genres}>
                        <span className={styles.skeletonGenre} />
                        <span className={styles.skeletonGenre} />
                        <span className={styles.skeletonGenre} />
                    </div>

                    <div className={styles.skeletonTextBlock}>
                        <span className={styles.skeletonText} />
                        <span className={styles.skeletonText} />
                        <span className={styles.skeletonText} />
                        <span className={styles.skeletonTextShort} />
                    </div>
                </div>

                <div className={styles.actions}>
                    <span className={styles.skeletonAction} />
                    <span className={styles.skeletonAction} />
                </div>
            </div>
        </LiquidGlass>
    );
}
