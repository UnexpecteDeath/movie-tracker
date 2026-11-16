"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Card } from "@/shared/ui/card";
import styles from "./page.module.css";
import { useAuth } from "@/modules/auth/hooks/useAuth";

type SignInFormValues = {
    email: string;
    password: string;
};

export default function SignInPage() {
    const router = useRouter();
    const { signIn } = useAuth();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormValues>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async ({ email, password }: SignInFormValues) => {
        try {
            const error = await signIn({ email, password });
            if (error) {
                setError("root", {
                    message: error.message,
                });
                return;
            }
        } catch {
            setError("root", {
                message: "Не удалось войти. Попробуйте ещё раз.",
            });
            return;
        }

        router.replace("/");
        router.refresh();
    };

    return (
        <div className={styles.page}>
            <section className={styles.shell} aria-labelledby="sign-in-title">
                <header className={styles.header}>
                    <h1 id="sign-in-title" className={styles.title}>
                        Вход
                    </h1>
                    <span className={styles.brand}>Our History</span>
                </header>

                <Card>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <div className={styles.fields}>
                            <div className={styles.field}>
                                <label
                                    className={styles.label}
                                    htmlFor="sign-in-email"
                                >
                                    Почта
                                </label>
                                <input
                                    id="sign-in-email"
                                    className={styles.input}
                                    type="email"
                                    placeholder="name@example.com"
                                    autoComplete="username"
                                    required
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={
                                        errors.email
                                            ? "sign-in-email-error"
                                            : undefined
                                    }
                                    {...register("email", {
                                        required: "Введите почту.",
                                        pattern: {
                                            value: /^\S+@\S+\.\S+$/,
                                            message:
                                                "Введите корректную почту.",
                                        },
                                    })}
                                />
                                {errors.email ? (
                                    <p
                                        id="sign-in-email-error"
                                        className={styles.error}
                                        role="alert"
                                    >
                                        {errors.email.message}
                                    </p>
                                ) : null}
                            </div>

                            <div className={styles.field}>
                                <label
                                    className={styles.label}
                                    htmlFor="sign-in-password"
                                >
                                    Пароль
                                </label>
                                <input
                                    id="sign-in-password"
                                    className={styles.input}
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={
                                        errors.password
                                            ? "sign-in-password-error"
                                            : undefined
                                    }
                                    {...register("password", {
                                        required: "Введите пароль.",
                                    })}
                                />
                                {errors.password ? (
                                    <p
                                        id="sign-in-password-error"
                                        className={styles.error}
                                        role="alert"
                                    >
                                        {errors.password.message}
                                    </p>
                                ) : null}
                            </div>

                            {errors.root?.message ? (
                                <p className={styles.formError} role="alert">
                                    {errors.root.message}
                                </p>
                            ) : null}
                        </div>

                        <footer className={styles.actions}>
                            <button
                                className={styles.button}
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Входим…" : "Войти"}
                            </button>
                        </footer>
                    </form>
                </Card>
            </section>
        </div>
    );
}
