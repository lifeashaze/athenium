import { Header } from "@/components/Header";
import { DocsSidebar } from "./_components/DocsSidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container px-4 pt-28 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[14rem_minmax(0,1fr)] gap-10 lg:gap-16">
          <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <DocsSidebar />
          </aside>
          <main className="min-w-0 max-w-3xl">{children}</main>
        </div>
      </div>
    </div>
  );
}
