"use client";

import Link from "next/link";
import styles from "./dock.module.css";
import movies from "./icons/movies.svg";
import watched from "./icons/watched.svg";
import watchlist from "./icons/watchlist.svg";
import posts from "./icons/posts.svg";
import home from "./icons/home.svg";

import Image from "next/image";
import { classNames } from "@/shared/lib";
import { usePathname } from "next/navigation";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import { ThemeSwitcher } from "@/shared/ui/themeSwitcher";

export default function Dock() {
    const pathname = usePathname();

    const items = [
        {
            href: "/",
            icon: home,
            label: "Home",
            current: pathname === "/",
        },
        {
            href: "/movies",
            icon: movies,
            label: "All movies",
            current: pathname === "/movies",
        },
        {
            href: "/watched",
            icon: watched,
            label: "Watched",
            current: pathname === "/watched",
        },
        {
            href: "/watchlist",
            icon: watchlist,
            label: "Watch later",
            current: pathname === "/watchlist",
        },
        {
            href: "/feed",
            icon: posts,
            label: "Posts",
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
                            <Image
                                src={item.icon}
                                alt={item.label}
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
                        <span className={styles.searchIcon}>⌕</span>
                        <span className={styles.tooltip}>Search</span>
                    </button>
                    <ThemeSwitcher />
                </nav>
            </LiquidGlass>
        </div>
    );
}
