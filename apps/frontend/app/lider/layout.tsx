/**
 * Layout del líder
 * @celula - Celula1
 */

import { AppHeader } from '@/components/shared/AppHeader';

export default function LiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader role="lider" />
      {children}
    </>
  );
}
