"use client";

import { useId } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons/core-free-icons";
import styles from "./page.module.css";
import { useSettings } from "@/features/settings/useSettings";

export default function SettingsPage() {
    const switchId = useId();
    const { enabled, enableNotifications, disableNotifications } =
        useSettings();

    return (
        <div id="scrollable" className={`container ${styles.page}`}>
            <div className={styles.glowPrimary} />
            <div className={styles.glowSecondary} />

            <section className={styles.shell}>
                <div className={styles.header}>
                    <p className={styles.eyebrow}>Preferences</p>
                    <h1 className={styles.title}>Настройки</h1>
                </div>
                <div className={styles.surfaceInner}>
                    <label className={styles.settingRow} htmlFor={switchId}>
                        <span className={styles.settingIcon}>
                            <HugeiconsIcon
                                icon={Notification01Icon}
                                width={24}
                                height={24}
                            />
                        </span>

                        <span className={styles.settingContent}>
                            <span className={styles.settingTitle}>
                                Уведомления
                            </span>
                            <span className={styles.settingDescription}>
                                Получать напоминания и важные обновления.
                            </span>
                        </span>

                        <span className={styles.switchWrap}>
                            <input
                                id={switchId}
                                className={styles.switchInput}
                                type="checkbox"
                                role="switch"
                                checked={enabled}
                                onChange={(event) => {
                                    if (event.target.checked) {
                                        void enableNotifications();
                                    } else {
                                        void disableNotifications();
                                    }
                                }}
                            />
                            <span className={styles.switchTrack}>
                                <span className={styles.switchThumb} />
                            </span>
                            <span className={styles.switchText}>
                                {enabled ? "Включены" : "Выключены"}
                            </span>
                        </span>
                    </label>
                </div>
            </section>
        </div>
    );
}
