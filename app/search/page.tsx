import { DashboardLayout } from "@/components/dashboard-layout";
import { getSession } from "@/lib/auth-config";
import { IntelligentSearch } from "@/components/intelligent-search";

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  const authSession = await getSession();

  return (
    <DashboardLayout session={authSession}>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-dorado via-azul to-vino bg-clip-text text-transparent">
            Búsqueda Inteligente
          </h1>
          <p className="text-muted-foreground text-lg">
            Busca en la web, extrae información y navega de forma inteligente
          </p>
        </div>

        <IntelligentSearch />
      </div>
    </DashboardLayout>
  );
}

