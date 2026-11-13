"use client";

import Link from "next/link";
import styles from "./dock.module.css";
import { HugeiconsIcon } from "@hugeicons/react";

import { classNames } from "@/shared/lib";
import { usePathname } from "next/navigation";
import { Card } from "@/shared/ui/card";
import { ThemeSwitcher } from "@/shared/ui/themeSwitcher";
import { supabase } from "@/shared/api/supabaseClient";
import {
    FavouriteIcon,
    GiftIcon,
    LayoutGridIcon,
    Search01Icon,
    Settings01Icon,
    UserIcon,
} from "@hugeicons/core-free-icons";
import { Modal } from "@/shared";
import { useCallback, useEffect, useMemo, useState } from "react";

type AdminProfileRow = {
    is_admin: boolean | null;
};

const getCurrentUserIsAdmin = async () => {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return false;
    }

    if (user.app_metadata?.is_admin || user.user_metadata?.is_admin) {
        return true;
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return Boolean((data as AdminProfileRow | null)?.is_admin);
};

export default function Dock() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadIsAdmin = async () => {
            try {
                const nextIsAdmin = await getCurrentUserIsAdmin();

                if (isMounted) {
                    setIsAdmin(nextIsAdmin);
                }
            } catch (error) {
                console.error(error);

                if (isMounted) {
                    setIsAdmin(false);
                }
            }
        };

        void loadIsAdmin();

        const { data } = supabase.auth.onAuthStateChange(() => {
            void loadIsAdmin();
        });

        return () => {
            isMounted = false;
            data.subscription.unsubscribe();
        };
    }, []);

    const items = useMemo(() => {
        const nextItems = [
            {
                href: "/",
                icon: FavouriteIcon,
                label: "Home",
                current: pathname === "/",
            },
            {
                href: "/feed",
                icon: LayoutGridIcon,
                label: "Feed",
                current: pathname === "/feed",
            },
            {
                href: "/shop",
                icon: GiftIcon,
                label: "Shop",
                current: pathname === "/shop",
            },
            {
                href: "/profile",
                icon: UserIcon,
                label: "Profile",
                current: pathname === "/profile",
            },
            {
                href: "/settings",
                icon: Settings01Icon,
                label: "Настройки",
                current: pathname === "/settings",
            },
        ];

        // if (isAdmin) {
        //     nextItems.push({
        //         href: "/send-notifications",
        //         icon: Notification01Icon,
        //         label: "Отправка уведомлений",
        //         current: pathname === "/send-notifications",
        //     });
        // }

        return nextItems;
    }, [isAdmin, pathname]);

    const filteredItems = useMemo(() => {
        const normalizedSearch = searchValue.trim().toLowerCase();

        if (!normalizedSearch) return items;

        return items.filter((item) => {
            const searchableValue = `${item.label} ${item.href}`.toLowerCase();

            return searchableValue.includes(normalizedSearch);
        });
    }, [items, searchValue]);

    // const handleOpen = useCallback(() => {
    //     setIsOpen(true);
    // }, []);
    //
    // const handlePressStart = useCallback(
    //     (event: PointerEvent<HTMLButtonElement>) => {
    //         if (
    //             event.isPrimary &&
    //             (event.pointerType === "touch" || event.pointerType === "pen")
    //         ) {
    //             setIsOpen(true);
    //         }
    //     },
    //     [],
    // );

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setSearchValue("");
    }, []);

    return (
        <div className={styles.dockWrapper}>
            <Card className={classNames(styles.dock, {}, [])}>
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

                    {/*<button*/}
                    {/*    type="button"*/}
                    {/*    className={classNames(styles.item, {}, [styles.search])}*/}
                    {/*    aria-label="Search"*/}
                    {/*    onPointerDown={handlePressStart}*/}
                    {/*    onClick={handleOpen}*/}
                    {/*>*/}
                    {/*    <HugeiconsIcon*/}
                    {/*        icon={Search01Icon}*/}
                    {/*        width={22}*/}
                    {/*        height={22}*/}
                    {/*    />*/}
                    {/*    <span className={styles.tooltip}>Search</span>*/}
                    {/*</button>*/}
                    <ThemeSwitcher />
                </nav>
            </Card>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                keepMounted
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
