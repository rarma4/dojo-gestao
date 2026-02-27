"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle, Pencil, Trash2 } from "lucide-react";
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
import { GraduacaoFormModal } from "./graduacao-form-modal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Graduacao {
  id: string;
  dataGraduacao: string;
  valorPago: number | null;
  aluno: {
    id: string;
    nome: string;
    telefone: string;
    modalidade: {
      id: string;
      nome: string;
    };
  };
  graduacaoTipo: {
    id: string;
    nome: string;
  };
  professor: {
    id: string;
    nome: string;
  };
}

export function GraduacoesManager() {
  const { showAlert, showConfirm, AlertComponent } = useAlertModal();
  const [graduacoes, setGraduacoes] = useState<Graduacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGraduacao, setEditingGraduacao] = useState<Graduacao | null>(null);

  async function fetchGraduacoes() {
    try {
      const response = await fetch("/api/graduacoes");
      if (response.ok) {
        const data = await response.json();
        setGraduacoes(data);
      }
    } catch (error) {
      console.error("Erro ao buscar graduações:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGraduacoes();
  }, []);

  function handleNew() {
    setEditingGraduacao(null);
    setModalOpen(true);
  }

  function handleEdit(graduacao: Graduacao) {
    setEditingGraduacao(graduacao);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    const confirmed = await showConfirm({
      title: "Confirmar exclusão",
      message: "Tem certeza que deseja excluir esta graduação?",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      variant: "destructive"
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/graduacoes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchGraduacoes();
      } else {
        showAlert("Erro ao excluir graduação");
      }
    } catch (error) {
      console.error("Erro ao excluir graduação:", error);
      showAlert("Erro ao excluir graduação");
    }
  }

  function handleWhatsAppParabens(graduacao: Graduacao) {
    const telefone = graduacao.aluno.telefone.replace(/\D/g, "");
    const mensagem = `🥋 Parabéns ${graduacao.aluno.nome}! 🎉\n\nEstamos muito felizes pela sua conquista da ${graduacao.graduacaoTipo.nome} em ${graduacao.aluno.modalidade.nome}!\n\nContinue treinando forte! OSS! 💪`;
    window.open(
      `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`,
      "_blank"
    );
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <AlertComponent />
      <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Registrar Graduação
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Aluno</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead>Graduação</TableHead>
              <TableHead>Professor</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {graduacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Nenhuma graduação registrada para a sua conta
                </TableCell>
              </TableRow>
            ) : (
              graduacoes.map((graduacao) => (
                <TableRow key={graduacao.id}>
                  <TableCell>
                    {format(new Date(graduacao.dataGraduacao), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {graduacao.aluno.nome}
                  </TableCell>
                  <TableCell>{graduacao.aluno.modalidade.nome}</TableCell>
                  <TableCell>
                    <Badge variant="success">{graduacao.graduacaoTipo.nome}</Badge>
                  </TableCell>
                  <TableCell>{graduacao.professor.nome}</TableCell>
                  <TableCell>
                    {graduacao.valorPago
                      ? `R$ ${graduacao.valorPago.toFixed(2)}`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(graduacao)}
                        className="text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(graduacao.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWhatsAppParabens(graduacao)}
                        className="text-green-600"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <GraduacaoFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        graduacao={editingGraduacao}
        onSuccess={() => {
          fetchGraduacoes();
          setModalOpen(false);
          setEditingGraduacao(null);
        }}
      />
    </div>
    </>
  );
}
