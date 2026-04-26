"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { LiquidGlass } from "@/shared";
import styles from "./page.module.css";
import { useAuth } from "@/features/auth/useAuth";

type SignInFormValues = {
    email: string;
    password: string;
};

export default function SignInPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signIn } = useAuth();

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<SignInFormValues>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async ({ email, password }: SignInFormValues) => {
        clearErrors("root");
        setIsSubmitting(true);

        const error = await signIn({ email, password });

        setIsSubmitting(false);

        if (error) {
            setError("root", {
                message: error.message,
            });
            return;
        }

        router.replace("/");
        router.refresh();
    };

    return (
        <div className={styles.page}>
            <div className={styles.glow} />
            <div className={styles.glowSecondary} />

            <section className={styles.shell} aria-labelledby="sign-in-title">
                <div className={styles.copy}>
                    <p className={styles.eyebrow}>С возвращением</p>
                    <h1 id="sign-in-title" className={styles.title}>
                        Войдите в своё кинопространство
                    </h1>
                    <p className={styles.description}>
                        Храните просмотренные фильмы, список на потом и уютные
                        подборки рядом.
                    </p>
                </div>

                <LiquidGlass
                    className={styles.card}
                    radius="xl"
                    padding="none"
                    shadow
                >
                    <form
                        className={styles.form}
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className={styles.formHeader}>
                            <h2 className={styles.formTitle}>Вход</h2>
                            <p className={styles.formText}>
                                Введите почту и пароль, чтобы продолжить.
                            </p>
                        </div>

                        <label className={styles.field}>
                            <span className={styles.label}>Почта</span>
                            <input
                                className={styles.input}
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                {...register("email", {
                                    required: "Введите почту.",
                                    pattern: {
                                        value: /^\S+@\S+\.\S+$/,
                                        message: "Введите корректную почту.",
                                    },
                                })}
                            />
                            {errors.email ? (
                                <p className={styles.error}>
                                    {errors.email.message}
                                </p>
                            ) : null}
                        </label>

                        <label className={styles.field}>
                            <span className={styles.label}>Пароль</span>
                            <input
                                className={styles.input}
                                type="password"
                                placeholder="Ваш пароль"
                                autoComplete="current-password"
                                {...register("password", {
                                    required: "Введите пароль.",
                                })}
                            />
                            {errors.password ? (
                                <p className={styles.error}>
                                    {errors.password.message}
                                </p>
                            ) : null}
                        </label>

                        {errors.root?.message ? (
                            <p className={styles.error}>
                                {errors.root.message}
                            </p>
                        ) : null}

                        <button
                            className={styles.button}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Входим..." : "Продолжить"}
                        </button>
                    </form>
                </LiquidGlass>
            </section>
        </div>
    );
}
