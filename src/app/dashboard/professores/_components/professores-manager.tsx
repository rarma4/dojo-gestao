"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProfessorFormModal } from "./professor-form-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { Spinner } from "@/components/ui/spinner";

interface Professor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  isAdmin: boolean;
  ativo: boolean;
  modalidade: {
    nome: string;
  };
}

export function ProfessoresManager() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const { showAlert, showConfirm, AlertComponent } = useAlertModal();

  async function fetchProfessores() {
    try {
      const response = await fetch("/api/professores");
      if (response.ok) {
        const data = await response.json();
        setProfessores(data);
      }
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfessores();
  }, []);

  function handleNew() {
    setSelectedProfessor(null);
    setModalOpen(true);
  }

  function handleEdit(professor: Professor) {
    setSelectedProfessor(professor);
    setModalOpen(true);
  }

  async function handleDelete(professor: Professor) {
    const confirmed = await showConfirm({
      title: "Confirmar exclusão",
      message: `Tem certeza que deseja excluir o professor "${professor.nome}"?`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
      variant: "destructive"
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/professores/${professor.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProfessores();
      } else {
        const error = await response.json();
        showAlert(error.error || "Erro ao excluir professor");
      }
    } catch (error) {
      console.error("Erro ao excluir professor:", error);
      showAlert("Erro ao excluir professor");
    }
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
          Novo Professor
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Nenhum professor encontrado
                </TableCell>
              </TableRow>
            ) : (
              professores.map((professor) => (
                <TableRow key={professor.id}>
                  <TableCell className="font-medium">{professor.nome}</TableCell>
                  <TableCell>{professor.email}</TableCell>
                  <TableCell>{professor.telefone}</TableCell>
                  <TableCell>{professor.modalidade.nome}</TableCell>
                  <TableCell>
                    {professor.isAdmin ? (
                      <Badge variant="default">Administrador</Badge>
                    ) : (
                      <Badge variant="secondary">Professor</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {professor.ativo ? (
                      <Badge variant="success">Ativo</Badge>
                    ) : (
                      <Badge variant="destructive">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(professor)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(professor)}
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

      <ProfessorFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        professor={selectedProfessor as any}
        onSuccess={() => {
          fetchProfessores();
          setModalOpen(false);
        }}
      />
      </div>
    </>
  );
}
