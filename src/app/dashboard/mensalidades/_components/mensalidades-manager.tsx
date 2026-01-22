"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MensalidadeFormModal } from "./mensalidade-form-modal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Mensalidade {
  id: string;
  dataPagamento: string;
  valorPago: number;
  proximoVencimento: string;
  aluno: {
    id: string;
    nome: string;
    telefone: string;
    statusMensalidade: string;
    modalidade: {
      nome: string;
    };
  };
}

export function MensalidadesManager() {
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [filteredMensalidades, setFilteredMensalidades] = useState<Mensalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMensalidade, setSelectedMensalidade] = useState<Mensalidade | null>(null);
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const { showAlert, showConfirm, AlertComponent } = useAlertModal();

  async function fetchMensalidades() {
    try {
      const response = await fetch("/api/mensalidades");
      if (response.ok) {
        const data = await response.json();
        setMensalidades(data);
        setFilteredMensalidades(data);
      }
    } catch (error) {
      console.error("Erro ao buscar mensalidades:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMensalidades();
  }, []);

  useEffect(() => {
    if (filterStatus === "TODOS") {
      setFilteredMensalidades(mensalidades);
    } else {
      setFilteredMensalidades(
        mensalidades.filter((m) => m.aluno.statusMensalidade === filterStatus)
      );
    }
  }, [filterStatus, mensalidades]);

  function handleNew() {
    setSelectedMensalidade(null);
    setModalOpen(true);
  }

  function handleEdit(mensalidade: Mensalidade) {
    setSelectedMensalidade(mensalidade);
    setModalOpen(true);
  }

  async function handleDelete(mensalidade: Mensalidade) {
    const confirmed = await showConfirm({
      title: "Confirmar exclusão",
      message: `Tem certeza que deseja excluir o pagamento de "${mensalidade.aluno.nome}"? O status do aluno ficará como ATRASADA.`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
      variant: "destructive"
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/mensalidades/${mensalidade.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMensalidades();
      } else {
        const error = await response.json();
        showAlert(error.error || "Erro ao excluir mensalidade");
      }
    } catch (error) {
      console.error("Erro ao excluir mensalidade:", error);
      showAlert("Erro ao excluir mensalidade");
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "EM_DIA":
        return <Badge variant="success">Em Dia</Badge>;
      case "ATRASADA":
        return <Badge variant="destructive">Atrasada</Badge>;
      case "ISENTO":
        return <Badge variant="info">Isento</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <AlertComponent />
      <div className="space-y-4">
        <div className="flex justify-between items-center">
        <div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os Status</SelectItem>
              <SelectItem value="EM_DIA">Em Dia</SelectItem>
              <SelectItem value="ATRASADA">Atrasada</SelectItem>
              <SelectItem value="ISENTO">Isento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Registrar Pagamento
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead>Data do Pagamento</TableHead>
              <TableHead>Valor Pago</TableHead>
              <TableHead>Próximo Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMensalidades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Nenhuma mensalidade encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredMensalidades.map((mensalidade) => (
                <TableRow key={mensalidade.id}>
                  <TableCell className="font-medium">
                    {mensalidade.aluno.nome}
                  </TableCell>
                  <TableCell>{mensalidade.aluno.modalidade.nome}</TableCell>
                  <TableCell>
                    {format(new Date(mensalidade.dataPagamento), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    R$ {mensalidade.valorPago.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(mensalidade.proximoVencimento), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(mensalidade.aluno.statusMensalidade)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(mensalidade)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(mensalidade)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <MensalidadeFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mensalidade={selectedMensalidade as any}
        onSuccess={() => {
          fetchMensalidades();
          setModalOpen(false);
        }}
      />
      </div>
    </>
  );
}
