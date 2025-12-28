import ProfileSidebar from "@/components/ProfileSidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      suppressHydrationWarning={true}
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <ProfileSidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
