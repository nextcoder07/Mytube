// Server layout for profile route — provides metadata and renders children
export const metadata = {
  title: 'Profile — Mytube',
  description: 'Your public learning profile.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
