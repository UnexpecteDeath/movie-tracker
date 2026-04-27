"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { GiftIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import { classNames } from "@/shared/lib";
import type { GiftItem } from "../api/types";
import styles from "./gift.module.css";
import { getGiftRarityClassName } from "./giftRarity";

type Props = {
    gift: GiftItem;
    className?: string;
    onClick?: (gift: GiftItem) => void;
};

const getFallbackIcon = (type: GiftItem["type"]) =>
    type === "wish" ? SparklesIcon : GiftIcon;

const getGiftLabel = (type: GiftItem["type"]) =>
    type === "wish" ? "Желание" : "Подарок";

export function Gift({ gift, className, onClick }: Props) {
    const rarityClassName = styles[getGiftRarityClassName(gift.rarity)];

    const handleClick = () => {
        onClick?.(gift);
    };

    const asset = gift.asset_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            className={styles.assetImage}
            src={gift.asset_url}
            alt=""
            aria-hidden="true"
        />
    ) : (
        <HugeiconsIcon
            icon={getFallbackIcon(gift.type)}
            width={36}
            height={36}
            className={styles.assetFallback}
        />
    );

    return (
        <button
            type="button"
            className={classNames(styles.tileButton, {}, [className || ""])}
            onClick={handleClick}
            aria-label={`${getGiftLabel(gift.type).toLowerCase()}: ${gift.name}`}
        >
            <LiquidGlass
                className={classNames(styles.tile, {}, [rarityClassName])}
                radius="lg"
                padding="none"
                interactive
            >
                <div className={styles.tileInner}>{asset}</div>
            </LiquidGlass>
        </button>
    );
}
