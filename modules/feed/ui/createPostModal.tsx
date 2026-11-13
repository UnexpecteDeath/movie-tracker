"use client";

import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { FileUpload, Modal, type UploadedImage } from "@/shared";
import { useAddPost } from "../api/queries";
import styles from "./createPostModal/createPostModal.module.css";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { supabase } from "@/shared/api/supabaseClient";
import { toast } from "sonner";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

type CreatePostFormValues = {
    title: string;
    text: string;
    images: UploadedImage[];
};

const buildDateLabel = () =>
    new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date());

const CONTENT_REQUIRED = "Добавь заголовок или текст.";

export function CreatePostModal({ isOpen, onClose }: Props) {
    const titleId = useId();
    const contentErrorId = useId();
    const { mutateAsync: createPost } = useAddPost();
    const { getPrivateInfo, getUser } = useAuth();

    const {
        control,
        register,
        handleSubmit,
        reset,
        clearErrors,
        setError,
        formState: { errors, isSubmitting },
        getValues,
        trigger,
    } = useForm<CreatePostFormValues>({
        defaultValues: {
            title: "",
            text: "",
            images: [],
        },
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const addBonusForPost = async () => {
        const user = await getUser();
        try {
            const { data, error } = await supabase.rpc("give_post_bonus", {
                user_id: user?.id,
            });
            if (error) {
                toast.error("Ошибка, бонусы не были начислены");
                return;
            }
            const message = `${data.status}: ${data.text}`;

            if (data.status === "success") {
                toast.success(message);
            } else {
                toast.error(message);
            }
        } catch (error) {
            const err = error as Error;
            const messageError =
                "message" in err ? err.message : "Бонусы не были начислены";
            toast.error("decline:" + messageError);
        }
    };

    const onSubmit = async ({ title, text, images }: CreatePostFormValues) => {
        const normalizedTitle = title.trim();
        const normalizedText = text.trim();
        const imageFiles = images.map((image) => image.file);

        clearErrors("root");

        try {
            const profile = await getPrivateInfo();

            await createPost({
                title: normalizedTitle,
                text: normalizedText,
                date_label: buildDateLabel(),
                images: imageFiles,
                author_id: profile?.id ?? null,
            });
            void addBonusForPost();
            handleClose();
        } catch {
            setError("root", {
                message:
                    "Не удалось создать пост. Попробуй отправить форму ещё раз.",
            });
        }
    };

    const contentError = errors.title?.message || errors.text?.message;

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                if (!isSubmitting) handleClose();
            }}
            className={styles.dialog}
            contentClassName={styles.content}
            aria-labelledby={titleId}
            hideCloseButton
        >
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <header className={styles.header}>
                    <h2 id={titleId}>Новый пост</h2>
                    <button
                        className={styles.closeButton}
                        type="button"
                        aria-label="Закрыть модальное окно"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        ×
                    </button>
                </header>

                <div className={styles.fields}>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Заголовок</span>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Например: Наш вечер с кино"
                            aria-invalid={Boolean(errors.title)}
                            aria-describedby={
                                contentError ? contentErrorId : undefined
                            }
                            {...register("title", {
                                validate: (value) =>
                                    Boolean(
                                        value.trim() ||
                                        getValues("text").trim(),
                                    ) || CONTENT_REQUIRED,
                                onChange: () => {
                                    void trigger(["title", "text"]);
                                },
                            })}
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Текст</span>
                        <textarea
                            className={styles.textarea}
                            placeholder="Расскажи, что хочется запомнить."
                            aria-invalid={Boolean(errors.text)}
                            aria-describedby={
                                contentError ? contentErrorId : undefined
                            }
                            {...register("text", {
                                validate: (value) =>
                                    Boolean(
                                        value.trim() ||
                                        getValues("title").trim(),
                                    ) || CONTENT_REQUIRED,
                                onChange: () => {
                                    void trigger(["title", "text"]);
                                },
                            })}
                        />
                    </label>

                    {contentError && (
                        <p
                            id={contentErrorId}
                            className={styles.error}
                            role="alert"
                        >
                            {contentError}
                        </p>
                    )}

                    <Controller
                        name="images"
                        control={control}
                        render={({ field }) => (
                            <FileUpload
                                value={field.value}
                                onChange={(files) => {
                                    clearErrors("images");
                                    field.onChange(files);
                                }}
                                label="Добавить фото"
                                error={errors.images?.message}
                            />
                        )}
                    />

                    {errors.root?.message && (
                        <p className={styles.error} role="alert">
                            {errors.root.message}
                        </p>
                    )}
                </div>

                <footer className={styles.actions}>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Сохраняем..." : "Создать пост"}
                    </button>
                </footer>
            </form>
        </Modal>
    );
}
