"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { type Session } from "@supabase/supabase-js";
import { supabase } from "@/shared/api/supabaseClient";

const PUBLIC_ROUTES = ["/sign-in"];

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isPublicRoute = useMemo(
        () =>
            PUBLIC_ROUTES.some(
                (route) =>
                    pathname === route || pathname.startsWith(`${route}/`),
            ),
        [pathname],
    );

    useEffect(() => {
        let isMounted = true;

        supabase.auth.getSession().then(({ data }) => {
            if (!isMounted) return;

            setSession(data.session);
            setIsLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
            setIsLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (isLoading || isPublicRoute || session) return;

        router.replace("/sign-in");
    }, [isLoading, isPublicRoute, router, session]);

    if (isLoading && !isPublicRoute) return null;

    if (!session && !isPublicRoute) return null;

    return children;
}
