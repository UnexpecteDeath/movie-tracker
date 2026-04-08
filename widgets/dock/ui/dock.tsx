"use client";

import Link from "next/link";
import styles from "./dock.module.css";
import { HugeiconsIcon } from "@hugeicons/react";

import Image from "next/image";
import { classNames } from "@/shared/lib";
import { usePathname } from "next/navigation";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import { ThemeSwitcher } from "@/shared/ui/themeSwitcher";
import {
    Bookmark03Icon,
    CheckmarkBadge03Icon,
    ComputerVideoIcon,
    FavouriteIcon,
    LayoutGridIcon,
    Search01Icon,
    SearchIcon,
} from "@hugeicons/core-free-icons";

export default function Dock() {
    const pathname = usePathname();

    const items = [
        {
            href: "/",
            icon: FavouriteIcon,
            label: "Home",
            current: pathname === "/",
        },
        {
            href: "/movies",
            icon: ComputerVideoIcon,
            label: "All movies",
            current: pathname === "/movies",
        },
        {
            href: "/watched",
            icon: CheckmarkBadge03Icon,
            label: "Watched",
            current: pathname === "/watched",
        },
        {
            href: "/watchlist",
            icon: Bookmark03Icon,
            label: "Watch later",
            current: pathname === "/watchlist",
        },
        {
            href: "/feed",
            icon: LayoutGridIcon,
            label: "Feed",
            current: pathname === "/feed",
        },
    ];

    return (
        <div className={styles.dockWrapper}>
            <LiquidGlass
                className={classNames(styles.dock, {}, [])}
                radius="lg"
                padding="md"
            >
                <nav className={styles.nav} aria-label="Dock navigation">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={classNames(
                                styles.item,
                                {
                                    [styles.active]: item.current,
                                },
                                [],
                            )}
                        >
                            <HugeiconsIcon
                                icon={item.icon}
                                width={22}
                                height={22}
                                className={styles.icon}
                            />
                            <span className={styles.tooltip}>{item.label}</span>
                        </Link>
                    ))}

                    <button
                        type="button"
                        className={classNames(styles.item, {}, [styles.search])}
                        aria-label="Search"
                    >
                        <HugeiconsIcon
                            icon={Search01Icon}
                            width={22}
                            height={22}
                        />
                        <span className={styles.tooltip}>Search</span>
                    </button>
                    <ThemeSwitcher />
                </nav>
            </LiquidGlass>
        </div>
    );
}
