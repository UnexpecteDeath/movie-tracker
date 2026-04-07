export type PostImage = {
    src: string;
    alt: string;
    caption: string;
    tint: string;
};

export type PostItem = {
    id: number | string;
    title: string;
    dateLabel: string;
    category: string;
    text: string;
    footer: string;
    images?: PostImage[];
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
