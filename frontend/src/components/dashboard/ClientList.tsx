import type { Client } from '@/types/client';
import ClientCard from './ClientCard';

export default function ClientList({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <div className="card dash-empty">
        No clients match your search. Try adjusting filters or clearing them.
      </div>
    );
  }

  return (
    <div className="dash-client-grid">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}
