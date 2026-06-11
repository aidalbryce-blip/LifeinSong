import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Producer Studio — Life in Song',
};

export default function ProducerLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen">{children}</main>;
}
