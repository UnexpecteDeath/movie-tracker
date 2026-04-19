"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { classNames } from "@/shared/lib";
import styles from "./fileUpload.module.css";

export type UploadedImage = {
    id: string;
    name: string;
    size: number;
    type: string;
    src: string;
    file: File;
};

type Props = {
    value: UploadedImage[];
    onChange: (files: UploadedImage[]) => void;
    accept?: string;
    multiple?: boolean;
    label?: string;
    hint?: string;
    error?: string;
};

const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) {
        return `${Math.round(size / 1024)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result !== "string") {
                reject(new Error("File read error"));
                return;
            }

            resolve(reader.result);
        };

        reader.onerror = () => reject(new Error("File read error"));
        reader.readAsDataURL(file);
    });

const readImageFile = async (file: File): Promise<UploadedImage> => {
    const src = await readFileAsDataUrl(file);

    return {
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        src,
        file,
    };
};

export function FileUpload({
    value,
    onChange,
    accept = "image/*",
    multiple = true,
    label = "Загрузить изображения",
    hint = "Перетащи файлы сюда или нажми, чтобы выбрать изображения.",
    error,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [localError, setLocalError] = useState("");

    const handleFiles = async (filesList: FileList | null) => {
        if (!filesList || filesList.length === 0) return;

        const files = Array.from(filesList).filter((file) =>
            file.type.startsWith("image/"),
        );

        if (files.length === 0) {
            setLocalError("Можно загружать только изображения.");
            return;
        }

        try {
            setLocalError("");
            const uploadedFiles = await Promise.all(files.map(readImageFile));
            onChange(
                multiple
                    ? [...value, ...uploadedFiles]
                    : uploadedFiles.slice(0, 1),
            );
        } catch {
            setLocalError(
                "Не удалось прочитать файлы. Попробуй выбрать их снова.",
            );
        }
    };

    const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
        await handleFiles(event.target.files);
        event.target.value = "";
    };

    const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(false);
        await handleFiles(event.dataTransfer.files);
    };

    const handleRemove = (id: string) => {
        onChange(value.filter((file) => file.id !== id));
    };

    return (
        <div className={styles.root}>
            <label
                className={classNames(styles.dropzone, {
                    [styles.dropzoneActive]: isDragging,
                })}
                onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <div className={styles.icon}>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                            d="M12 16V5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <path
                            d="m7.5 9.5 4.5-4.5 4.5 4.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M5 19h14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <p className={styles.title}>{label}</p>
                <p className={styles.hint}>{hint}</p>

                <input
                    ref={inputRef}
                    className={styles.input}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleInputChange}
                />
            </label>

            {value.length > 0 ? (
                <div className={styles.list}>
                    {value.map((file) => (
                        <div key={file.id} className={styles.item}>
                            <div className={styles.preview}>
                                <Image
                                    src={file.src}
                                    alt={file.name}
                                    fill
                                    unoptimized
                                    sizes="(max-width: 560px) 180px, 88px"
                                />
                            </div>

                            <div className={styles.meta}>
                                <p className={styles.name}>{file.name}</p>
                                <p className={styles.size}>
                                    {formatFileSize(file.size)}
                                </p>
                            </div>

                            <button
                                type="button"
                                className={styles.removeButton}
                                onClick={() => handleRemove(file.id)}
                            >
                                Удалить
                            </button>
                        </div>
                    ))}
                </div>
            ) : null}

            {error || localError ? (
                <p className={styles.error}>{error || localError}</p>
            ) : null}
        </div>
    );
}
