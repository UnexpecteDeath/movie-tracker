import { Card } from "@/shared/ui/card";
import profileStyles from "./profileCard.module.css";
import showcaseStyles from "./profileGiftsShowcase.module.css";
import styles from "./profileCardSkeleton.module.css";

type Props = {
    showPrivateFields: boolean;
};

export function ProfileCardSkeleton({ showPrivateFields }: Props) {
    return (
        <div className={profileStyles.layout} aria-hidden="true">
            <Card>
                <div className={profileStyles.identity}>
                    <span
                        className={`${styles.placeholder} ${styles.avatar}`}
                    />
                    <div className={profileStyles.profileInfo}>
                        <span
                            className={`${styles.placeholder} ${styles.name}`}
                        />
                        {showPrivateFields && (
                            <span className={styles.placeholder} />
                        )}
                        <span className={styles.placeholder} />
                    </div>
                </div>
                <div className={profileStyles.stats}>
                    <span className={`${styles.placeholder} ${styles.stat}`} />
                    <span className={`${styles.placeholder} ${styles.stat}`} />
                </div>
                {showPrivateFields && (
                    <div className={profileStyles.actions}>
                        <span
                            className={`${styles.placeholder} ${styles.action}`}
                        />
                    </div>
                )}
            </Card>
            <Card>
                <div className={showcaseStyles.giftsHeader}>
                    <span className={`${styles.placeholder} ${styles.name}`} />
                </div>
                <div className={showcaseStyles.giftsGrid}>
                    {Array.from({ length: 6 }, (_, index) => (
                        <span
                            key={index}
                            className={`${styles.placeholder} ${styles.gift}`}
                        />
                    ))}
                </div>
            </Card>
        </div>
    );
}
