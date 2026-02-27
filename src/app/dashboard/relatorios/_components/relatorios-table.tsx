"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface RelatoriosTableProps {
  filters: {
    tipo: "mensalidade" | "graduacao" | "todos";
    mes: number;
    ano: number;
    modalidadeId: string;
  };
}

interface RelatorioItem {
  id: string;
  tipo: "mensalidade" | "graduacao";
  aluno: string;
  modalidade: string;
  data: string;
  valor?: number;
  status?: string;
  graduacaoNome?: string;
  graduacaoAnterior?: string;
}

export function RelatoriosTable({ filters }: RelatoriosTableProps) {
  const [data, setData] = useState<RelatorioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalMensalidades: 0,
    mensalidadesPagas: 0,
    mensalidadesPendentes: 0,
    totalGraduacoes: 0,
    valorTotal: 0,
  });

  useEffect(() => {
    fetchRelatorios();
  }, [filters]);

  async function fetchRelatorios() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        tipo: filters.tipo,
        mes: filters.mes.toString(),
        ano: filters.ano.toString(),
        modalidadeId: filters.modalidadeId,
      });

      const response = await fetch(`/api/relatorios?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        setSummary(result.summary);
      }
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {(filters.tipo === "todos" || filters.tipo === "mensalidade") && (
          <>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">
                Total Mensalidades
              </div>
              <div className="text-2xl font-bold">{summary.totalMensalidades}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Pagas</div>
              <div className="text-2xl font-bold text-green-600">
                {summary.mensalidadesPagas}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Pendentes</div>
              <div className="text-2xl font-bold text-red-600">
                {summary.mensalidadesPendentes}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Valor Total</div>
              <div className="text-2xl font-bold">
                R$ {summary.valorTotal.toFixed(2)}
              </div>
            </Card>
          </>
        )}
        {(filters.tipo === "todos" || filters.tipo === "graduacao") && (
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">
              Total Graduações
            </div>
            <div className="text-2xl font-bold">{summary.totalGraduacoes}</div>
          </Card>
        )}
      </div>

      {/* Tabela de dados */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Aluno</TableHead>
                <TableHead>Modalidade</TableHead>
                <TableHead>Data</TableHead>
                {(filters.tipo === "todos" || filters.tipo === "mensalidade") && (
                  <>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </>
                )}
                {(filters.tipo === "todos" || filters.tipo === "graduacao") && (
                  <>
                    <TableHead>Graduação</TableHead>
                    <TableHead>De</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={filters.tipo === "todos" ? 8 : 6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum registro da sua conta encontrado para os filtros selecionados
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge
                        variant={
                          item.tipo === "mensalidade" ? "default" : "secondary"
                        }
                      >
                        {item.tipo === "mensalidade"
                          ? "Mensalidade"
                          : "Graduação"}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.aluno}</TableCell>
                    <TableCell>{item.modalidade}</TableCell>
                    <TableCell>
                      {new Date(item.data).toLocaleDateString("pt-BR")}
                    </TableCell>
                    {(filters.tipo === "todos" ||
                      filters.tipo === "mensalidade") && (
                      <>
                        <TableCell>
                          {item.valor ? `R$ ${item.valor.toFixed(2)}` : "-"}
                        </TableCell>
                        <TableCell>
                          {item.status ? (
                            <Badge
                              variant={
                                item.status === "PAGO" ? "success" : "destructive"
                              }
                            >
                              {item.status}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </>
                    )}
                    {(filters.tipo === "todos" ||
                      filters.tipo === "graduacao") && (
                      <>
                        <TableCell>{item.graduacaoNome || "-"}</TableCell>
                        <TableCell>{item.graduacaoAnterior || "-"}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
