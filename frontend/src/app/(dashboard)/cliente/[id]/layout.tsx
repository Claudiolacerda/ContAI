import { ClienteHeader } from "@/components/cliente/ClienteHeader";
import { ClienteTabs } from "@/components/cliente/ClienteTabs";

interface ClienteLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export default function ClienteLayout({ children, params }: ClienteLayoutProps) {
  return (
    <div className="space-y-0 -mt-2">
      <ClienteHeader clienteId={params.id} />
      <ClienteTabs clienteId={params.id} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
