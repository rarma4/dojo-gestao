"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RelatoriosFiltersProps {
  filters: {
    tipo: "mensalidade" | "graduacao" | "todos";
    mes: number;
    ano: number;
    modalidadeId: string;
  };
  onFiltersChange: (filters: any) => void;
}

interface Modalidade {
  id: string;
  nome: string;
}

export function RelatoriosFilters({
  filters,
  onFiltersChange,
}: RelatoriosFiltersProps) {
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchModalidades();
  }, []);

  async function fetchModalidades() {
    try {
      const response = await fetch("/api/modalidades");
      if (response.ok) {
        const data = await response.json();
        setModalidades(data);
      }
    } catch (error) {
      console.error("Erro ao carregar modalidades:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const meses = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const currentYear = new Date().getFullYear();
  const anos = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tipo de Relatório */}
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Relatório</Label>
          <Select
            value={filters.tipo}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, tipo: value })
            }
          >
            <SelectTrigger id="tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="mensalidade">Mensalidades</SelectItem>
              <SelectItem value="graduacao">Graduações</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mês */}
        <div className="space-y-2">
          <Label htmlFor="mes">Mês</Label>
          <Select
            value={filters.mes.toString()}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, mes: parseInt(value) })
            }
          >
            <SelectTrigger id="mes">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes) => (
                <SelectItem key={mes.value} value={mes.value.toString()}>
                  {mes.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ano */}
        <div className="space-y-2">
          <Label htmlFor="ano">Ano</Label>
          <Select
            value={filters.ano.toString()}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, ano: parseInt(value) })
            }
          >
            <SelectTrigger id="ano">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anos.map((ano) => (
                <SelectItem key={ano} value={ano.toString()}>
                  {ano}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Modalidade */}
        <div className="space-y-2">
          <Label htmlFor="modalidade">Modalidade</Label>
          <Select
            value={filters.modalidadeId}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, modalidadeId: value })
            }
            disabled={isLoading}
          >
            <SelectTrigger id="modalidade">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              {modalidades.map((modalidade) => (
                <SelectItem key={modalidade.id} value={modalidade.id}>
                  {modalidade.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
