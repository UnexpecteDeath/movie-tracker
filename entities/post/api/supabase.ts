import type { PostItem, PostsListResponse, PostsQueryArgs } from "./types";
import { supabase } from "@/shared/api/supabaseClient";

const POSTS_LIMIT = 20;
const TABLE_NAME = "posts";
const BUCKET_NAME = "post-images";

type CreatePostWithImages = Omit<PostItem, "id" | "images"> & {
    images?: File[];
};

export async function getPosts(
    args: PostsQueryArgs = {},
): Promise<PostsListResponse> {
    const page = args.page ?? 1;
    const limit = args.limit ?? POSTS_LIMIT;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
        .from(TABLE_NAME)
        .select("*", { count: "exact" })
        .range(from, to)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    const total_items = count ?? 0;
    const total_pages = Math.ceil(total_items / limit);
    const remaining_count = Math.max(total_items - page * limit, 0);

    return {
        items: (data ?? []) as PostItem[],
        meta: {
            current_page: page,
            per_page: limit,
            total_items,
            total_pages,
            remaining_count,
        },
    };
}

export async function addPost(body: CreatePostWithImages): Promise<PostItem> {
    const uploadedImages: string[] = [];
    const uploadedPaths: string[] = [];

    try {
        if (body.images?.length) {
            for (const file of body.images) {
                const fileName = `${Date.now()}-${file.name}`;

                const { error: uploadError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .upload(fileName, file);

                if (uploadError) {
                    throw new Error(uploadError.message);
                }

                uploadedPaths.push(fileName);

                const { data: publicUrlData } = supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(fileName);

                uploadedImages.push(publicUrlData.publicUrl);
            }
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
                title: body.title,
                date_label: body.date_label,
                category: body.category,
                text: body.text,
                footer: body.footer,
                images: uploadedImages,
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as PostItem;
    } catch (error) {
        if (uploadedPaths.length > 0) {
            await supabase.storage.from(BUCKET_NAME).remove(uploadedPaths);
        }

        throw error;
    }
}
