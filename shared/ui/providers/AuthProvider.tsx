"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { type Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/api/supabaseClient";
import { PageLoader } from "@/shared/ui/pageLoader";

const PUBLIC_ROUTES = ["/sign-in"];

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();
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
        let userId: string | undefined;
        let hasAuthEvent = false;
        const updateSession = (nextSession: Session | null) => {
            if (!isMounted) return;

            const nextUserId = nextSession?.user.id;
            if (userId && userId !== nextUserId) {
                queryClient.clear();
            }
            userId = nextUserId;

            setSession(nextSession);
            setIsLoading(false);
        };

        supabase.auth.getSession().then(({ data }) => {
            if (!hasAuthEvent) updateSession(data.session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            hasAuthEvent = true;
            updateSession(nextSession);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [queryClient]);

    useEffect(() => {
        if (isLoading || isPublicRoute || session) return;

        router.replace("/sign-in");
    }, [isLoading, isPublicRoute, router, session]);

    if (isLoading && !isPublicRoute) {
        return <PageLoader mode="fullscreen" label="Проверяем сессию" />;
    }

    if (!session && !isPublicRoute) {
        return <PageLoader mode="fullscreen" label="Перенаправляем" />;
    }

    return children;
}
