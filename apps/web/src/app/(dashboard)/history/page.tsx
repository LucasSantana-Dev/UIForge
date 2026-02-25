import { HistoryClient } from './history-client';

export const metadata = {
  title: 'Generation History — Siza',
  description: 'Browse and reuse your past component generations',
};

export default function HistoryPage() {
  return <HistoryClient />;
}
