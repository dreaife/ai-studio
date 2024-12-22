import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

interface ChatCollection {
  id: number;
  collection_name: string;
}

export default function Sidebar({ onSelectChat }: { onSelectChat: (id: number) => void }) {
  const auth = useAuth();
  const [collections, setCollections] = useState<ChatCollection[]>([]);
  const router = useRouter();

  const fetchCollections = async () => {
    if (!auth.user?.profile.sub) return;
    const response = await fetch(`/api/chat/collections?userId=${auth.user?.profile.sub}`);
    const data = await response.json();
    setCollections(data);
  };

  useEffect(() => {
    if (auth.user?.profile.sub) {
      fetchCollections();
    }
  }, [auth.user]);

  useEffect(() => {
    const handleCollectionUpdate = () => {
      fetchCollections();
    };

    window.addEventListener('collectionUpdated', handleCollectionUpdate);

    return () => {
      window.removeEventListener('collectionUpdated', handleCollectionUpdate);
    };
  }, [auth.user]);

  const handleChatSelect = (id: number) => {
    router.push(`/chat?id=${id}`);
  };

  return (
    <div className="w-64 bg-gray-50 h-screen p-4">
      <h2 className="text-lg font-semibold mb-4">chat collections</h2>
      <div className="space-y-2">
        {collections.map((collection) => (
          <button
            key={collection.id}
            onClick={() => handleChatSelect(collection.id)}
            className="w-full text-left p-2 hover:bg-gray-100 rounded-lg"
          >
            {collection.collection_name}
          </button>
        ))}
      </div>
    </div>
  );
}