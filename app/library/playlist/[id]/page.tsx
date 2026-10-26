import { UserPlaylistView } from '@/components/library/user-playlist-view';

export default async function UserPlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  return <UserPlaylistView id={(await params).id} />;
}
