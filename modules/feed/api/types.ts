export type PostItem = {
    id: number | string;
    title: string;
    date_label: string;
    text: string;
    images?: string[];
    author_id: string | null;
};

export type CreatePostRequest = Omit<PostItem, "id">;

export type PostsQueryArgs = {
    page?: number;
    limit?: number;
};

export type PostsListResponse = {
    meta: {
        total_items: number;
        total_pages: number;
        current_page: number;
        per_page: number;
        remaining_count: number;
    };
    items: PostItem[];
};
