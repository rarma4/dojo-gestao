"use client";

import { useState } from "react";
import { RelatoriosFilters } from "./_components/relatorios-filters";
import { RelatoriosTable } from "./_components/relatorios-table";

export default function RelatoriosPage() {
  const [filters, setFilters] = useState({
    tipo: "todos" as "mensalidade" | "graduacao" | "todos",
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    modalidadeId: "todos",
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground mt-2">
            Visualize relatórios mensais de mensalidades e graduações
          </p>
        </div>
      </div>

      <RelatoriosFilters filters={filters} onFiltersChange={setFilters} />
      <RelatoriosTable filters={filters} />
    </div>
  );
}
