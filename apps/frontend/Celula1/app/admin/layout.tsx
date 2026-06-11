import { AdminHeader } from './components/AdminHeader';
import { Footer } from '../components/Footer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1EA]">
      <AdminHeader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
