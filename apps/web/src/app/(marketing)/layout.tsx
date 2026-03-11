import MarketingNav from './MarketingNav';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <main className="pt-14">{children}</main>
    </div>
  );
}
