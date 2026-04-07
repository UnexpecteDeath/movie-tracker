"use client";

import { Controller, useForm } from "react-hook-form";
import { FileUpload, Modal, type UploadedImage } from "@/shared";
import { useAddPostMutation, type PostItem } from "@/entities/post";
import styles from "./createPostModal.module.css";

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

const STATIC_CATEGORY = "Private memory";
const STATIC_FOOTER = "вкусные блинчики";

const buildDateLabel = () =>
    new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date());

const buildImageTint = (index: number) => {
    const tints = [
        "linear-gradient(180deg, rgba(13, 16, 25, 0.04), rgba(13, 16, 25, 0.32))",
        "linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(18, 20, 28, 0.24))",
        "linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(18, 20, 28, 0.28))",
        "linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(20, 18, 26, 0.24))",
    ];

    return tints[index % tints.length];
};

export function CreatePostModal({ isOpen, onClose, onCreated }: Props) {
    const [addPost, { isLoading }] = useAddPostMutation();
    const {
        control,
        register,
        handleSubmit,
        reset,
        clearErrors,
        setError,
        formState: { errors },
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
        onClose();
    };

    const onSubmit = async ({ title, text, images }: CreatePostFormValues) => {
        const normalizedTitle = title.trim();
        const normalizedText = text.trim();
        const normalizedImages = images.filter((image) => image.src);

        clearErrors("root");

        try {
            const createdPost = await addPost({
                title: normalizedTitle,
                text: normalizedText,
                category: STATIC_CATEGORY,
                footer: STATIC_FOOTER,
                dateLabel: buildDateLabel(),
                images: normalizedImages.map((image, index) => ({
                    src: image.src,
                    alt: `Изображение поста ${index + 1}`,
                    caption:
                        image.name.replace(/\.[^.]+$/, "") ||
                        `Frame ${index + 1}`,
                    tint: buildImageTint(index),
                })),
            }).unwrap();

            onCreated?.(createdPost);
            handleClose();
        } catch {
            setError("root", {
                message:
                    "Не удалось создать пост. Попробуй отправить форму ещё раз.",
            });
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
                            validate: (value) =>
                                value.trim().length > 0 || "Заполни title.",
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
                            validate: (value) =>
                                value.trim().length > 0 || "Заполни text.",
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
                        rules={{
                            validate: (value) =>
                                value.length > 0 ||
                                "Добавь хотя бы одно изображение.",
                        }}
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
                        disabled={isLoading}
                    >
                        {isLoading ? "Сохраняем..." : "Создать пост"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
