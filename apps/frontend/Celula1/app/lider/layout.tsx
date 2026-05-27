import { LiderHeader } from '../components/LiderHeader';

export default function LiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LiderHeader />
      {children}
    </>
  );
}