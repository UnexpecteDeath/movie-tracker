"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FileUpload, Modal, type UploadedImage } from "@/shared";
import type { PostItem } from "@/entities/post";
import { addPost } from "@/entities/post/api/supabase";
import styles from "./createPostModal.module.css";
import { useAuth } from "@/features/auth/useAuth";
import { supabase } from "@/shared/api/supabaseClient";
import { toast } from "sonner";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: (post: PostItem) => void;
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

export function CreatePostModal({ isOpen, onClose, onCreated }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { getPrivateInfo, getUser } = useAuth();

    const {
        control,
        register,
        handleSubmit,
        reset,
        clearErrors,
        setError,
        formState: { errors },
        getValues,
        trigger,
    } = useForm<CreatePostFormValues>({
        defaultValues: {
            title: "",
            text: "",
            images: [],
        },
    });

    const resetForm = () => {
        reset();
    };

    const handleClose = () => {
        resetForm();
        setIsSubmitting(false);
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
        setIsSubmitting(true);

        try {
            const profile = await getPrivateInfo();

            const createdPost = await addPost({
                title: normalizedTitle,
                text: normalizedText,
                date_label: buildDateLabel(),
                images: imageFiles,
                author_id: profile?.id ?? null,
            });
            void addBonusForPost();
            onCreated?.(createdPost);
            handleClose();
        } catch {
            setError("root", {
                message:
                    "Не удалось создать пост. Попробуй отправить форму ещё раз.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            eyebrow="Create post"
            title="Новый пост"
            description="Укажи только заголовок, текст и изображения. Остальные поля заполним автоматически."
        >
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <label className={styles.field}>
                    <span className={styles.fieldLabel}>Title</span>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Например: Наш вечер с кино"
                        {...register("title", {
                            validate: (value) => {
                                const text = getValues("text");

                                if (value.trim() || text.trim()) return true;

                                return "Заполни title или text.";
                            },
                            onChange: () => {
                                void trigger(["title", "text"]);
                            },
                        })}
                    />
                    {errors.title ? (
                        <p className={styles.error}>{errors.title.message}</p>
                    ) : null}
                </label>

                <label className={styles.field}>
                    <span className={styles.fieldLabel}>Text</span>
                    <textarea
                        className={styles.textarea}
                        placeholder="Опиши момент, который хочешь сохранить в ленте."
                        {...register("text", {
                            validate: (value) => {
                                const title = getValues("title");

                                if (value.trim() || title.trim()) return true;

                                return "Заполни title или text.";
                            },
                            onChange: () => {
                                void trigger(["title", "text"]);
                            },
                        })}
                    />
                    {errors.text ? (
                        <p className={styles.error}>{errors.text.message}</p>
                    ) : null}
                </label>

                <div className={styles.field}>
                    <div>
                        <p className={styles.fieldLabel}>Images</p>
                        <p className={styles.fieldHint}>
                            Загрузи фотографии файлами. Мы добавим их в пост и
                            сразу покажем превью.
                        </p>
                    </div>
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
                                label="Добавить изображения"
                                hint="Поддерживается drag and drop и выбор нескольких файлов."
                                error={errors.images?.message}
                            />
                        )}
                    />
                </div>

                {errors.root?.message ? (
                    <p className={styles.error}>{errors.root.message}</p>
                ) : null}

                <div className={styles.actions}>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Сохраняем..." : "Создать пост"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
