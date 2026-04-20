"use client";

import Link from "next/link";
import styles from "./dock.module.css";
import { HugeiconsIcon } from "@hugeicons/react";

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
    PlaySquareIcon,
    Search01Icon,
    UserIcon,
} from "@hugeicons/core-free-icons";
import { Modal } from "@/shared";
import { useCallback, useMemo, useState } from "react";

export default function Dock() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const items = useMemo(
        () => [
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
            {
                href: "/movie-picker",
                icon: PlaySquareIcon,
                label: "movie picker",
                current: pathname === "/movie-picker",
            },
            {
                href: "/profile",
                icon: UserIcon,
                label: "Profile",
                current: pathname === "/profile",
            },
        ],
        [pathname],
    );

    const filteredItems = useMemo(() => {
        const normalizedSearch = searchValue.trim().toLowerCase();

        if (!normalizedSearch) return items;

        return items.filter((item) => {
            const searchableValue = `${item.label} ${item.href}`.toLowerCase();

            return searchableValue.includes(normalizedSearch);
        });
    }, [items, searchValue]);

    const handleOpen = useCallback(() => {
        setIsOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setSearchValue("");
    }, []);

    return (
        <div className={styles.dockWrapper}>
            <LiquidGlass
                className={classNames(styles.dock, {}, [])}
                radius="lg"
                padding="md"
            >
                <nav className={styles.nav} aria-label="Dock navigation">
                    {items.slice(0, 5).map((item) => (
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
                        onClick={handleOpen}
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
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title="Site links"
                description="Find the page you need and jump straight there."
                contentClassName={styles.searchModalContent}
            >
                <div className={styles.searchPanel}>
                    <label className={styles.searchField}>
                        <HugeiconsIcon
                            icon={Search01Icon}
                            width={20}
                            height={20}
                            className={styles.searchFieldIcon}
                        />
                        <input
                            className={styles.searchInput}
                            value={searchValue}
                            onChange={(event) =>
                                setSearchValue(event.target.value)
                            }
                            placeholder="Search pages or paths"
                        />
                    </label>

                    <div className={styles.searchResults}>
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={handleClose}
                                    className={classNames(
                                        styles.searchResult,
                                        {
                                            [styles.searchResultActive]:
                                                item.current,
                                        },
                                        [],
                                    )}
                                >
                                    <span className={styles.searchResultIcon}>
                                        <HugeiconsIcon
                                            icon={item.icon}
                                            width={22}
                                            height={22}
                                        />
                                    </span>
                                    <span className={styles.searchResultText}>
                                        <span
                                            className={styles.searchResultLabel}
                                        >
                                            {item.label}
                                        </span>
                                        <span
                                            className={styles.searchResultHref}
                                        >
                                            {item.href}
                                        </span>
                                    </span>
                                </Link>
                            ))
                        ) : (
                            <div className={styles.emptySearch}>
                                <span>No links found</span>
                                <small>Try another page name or path.</small>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
