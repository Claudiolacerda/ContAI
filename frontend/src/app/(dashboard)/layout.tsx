import { Sidebar } from "@/components/shared/Sidebar";
import { Topbar } from "@/components/shared/Topbar";
import { QueryProvider } from "@/components/providers/QueryProvider";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <div className="flex h-screen overflow-hidden" style={{background: "linear-gradient(135deg, #1e3a5f 0%, #1a2f4e 40%, #162540 100%)"}}>
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-screen-2xl mx-auto animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}