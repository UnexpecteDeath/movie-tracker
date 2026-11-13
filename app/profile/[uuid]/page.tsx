import { ProfilePage } from "@/modules/profile";

type Props = {
    params: Promise<{
        uuid: string;
    }>;
};

export default async function Page({ params }: Props) {
    const { uuid } = await params;

    return <ProfilePage profileId={uuid} />;
}
