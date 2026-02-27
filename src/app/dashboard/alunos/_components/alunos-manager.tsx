"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, MessageCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlunoFormModal } from "./aluno-form-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AlunoListItem {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  statusMensalidade: string;
  ativo: boolean;
  modalidade: {
    id: string;
    nome: string;
  };
  graduacaoAtual?: {
    nome: string;
  };
  proximoVencimento?: string;
}

export function AlunosManager() {
  const [alunos, setAlunos] = useState<AlunoListItem[]>([]);
  const [filteredAlunos, setFilteredAlunos] = useState<AlunoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<AlunoListItem | null>(null);
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [filterModalidade, setFilterModalidade] = useState("TODOS");
  const { showAlert, showConfirm, AlertComponent } = useAlertModal();

  async function fetchAlunos() {
    try {
      const response = await fetch("/api/alunos");
      if (response.ok) {
        const data = await response.json();
        setAlunos(data);
        setFilteredAlunos(data);
      }
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlunos();
  }, []);

  useEffect(() => {
    let filtered = [...alunos];

    if (filterStatus !== "TODOS") {
      filtered = filtered.filter((a) => a.statusMensalidade === filterStatus);
    }

    if (filterModalidade !== "TODOS") {
      filtered = filtered.filter((a) => a.modalidade.id === filterModalidade);
    }

    setFilteredAlunos(filtered);
  }, [filterStatus, filterModalidade, alunos]);

  function handleNew() {
    setSelectedAluno(null);
    setModalOpen(true);
  }

  function handleEdit(aluno: AlunoListItem) {
    setSelectedAluno(aluno);
    setModalOpen(true);
  }

  async function handleDelete(aluno: AlunoListItem) {
    const confirmed = await showConfirm({
      title: "Confirmar exclusão",
      message: `Tem certeza que deseja excluir o aluno "${aluno.nome}"?`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
      variant: "destructive"
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/alunos/${aluno.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchAlunos();
      } else {
        const error = await response.json();
        showAlert(error.error || "Erro ao excluir aluno");
      }
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
      showAlert("Erro ao excluir aluno");
    }
  }

  function handleWhatsApp(aluno: AlunoListItem) {
    const telefone = aluno.telefone.replace(/\D/g, "");
    const mensagem = `Olá ${aluno.nome}, tudo bem? Verificamos que sua mensalidade está em atraso. Por favor, regularize sua situação.`;
    window.open(
      `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`,
      "_blank"
    );
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

  const modalidades = Array.from(
    new Set(alunos.map((a) => JSON.stringify(a.modalidade)))
  ).map((m) => JSON.parse(m));

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <AlertComponent />
      <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-4">
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

          <div>
            <Select value={filterModalidade} onValueChange={setFilterModalidade}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Modalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todas as Modalidades</SelectItem>
                {modalidades.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Aluno
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead>Graduação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Próximo Vencimento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlunos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Nenhum aluno encontrado para a sua conta
                </TableCell>
              </TableRow>
            ) : (
              filteredAlunos.map((aluno) => (
                <TableRow key={aluno.id}>
                  <TableCell className="font-medium">{aluno.nome}</TableCell>
                  <TableCell>{aluno.telefone}</TableCell>
                  <TableCell>{aluno.modalidade.nome}</TableCell>
                  <TableCell>{aluno.graduacaoAtual?.nome || "-"}</TableCell>
                  <TableCell>{getStatusBadge(aluno.statusMensalidade)}</TableCell>
                  <TableCell>
                    {aluno.proximoVencimento
                      ? format(new Date(aluno.proximoVencimento), "dd/MM/yyyy", {
                          locale: ptBR,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {aluno.statusMensalidade === "ATRASADA" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWhatsApp(aluno)}
                          className="text-green-600"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(aluno)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(aluno)}
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

      <AlunoFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        aluno={selectedAluno as any}
        onSuccess={() => {
          fetchAlunos();
          setModalOpen(false);
        }}
      />
    </div>
    </>
  );
}
