"use client";

import { useEffect } from "react";
import { supabase } from "@/shared/api/supabaseClient";

type Props = {
    children: React.ReactNode;
};

export const StreackProvider = ({ children }: Props) => {
    useEffect(() => {
        const handleAddStreack = async () => {
            const { data } = await supabase.auth.getUser();
            await supabase.rpc("update_streak", { user_id: data.user?.id });
        };
        handleAddStreack();
    }, []);

    return <>{children}</>;
};
