"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ModalidadeFormModal } from "./modalidade-form-modal";
import { Badge } from "@/components/ui/badge";
import { useAlertModal } from "@/hooks/use-alert-modal";

interface Modalidade {
  id: string;
  nome: string;
  graduacoes?: Array<{
    id: string;
    nome: string;
    ordem: number;
  }>;
  _count?: {
    alunos: number;
    professores: number;
    graduacoes: number;
  };
}

export function ModalidadesManager() {
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModalidade, setSelectedModalidade] = useState<Modalidade | null>(null);
  const { showAlert, showConfirm, AlertComponent } = useAlertModal();

  async function fetchModalidades() {
    try {
      const response = await fetch(`/api/modalidades?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Modalidades atualizadas:', data);
        setModalidades(data);
      }
    } catch (error) {
      console.error("Erro ao buscar modalidades:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchModalidades();
  }, []);

  function handleNew() {
    setSelectedModalidade(null);
    setModalOpen(true);
  }

  function handleEdit(modalidade: Modalidade) {
    console.log('Editando modalidade:', modalidade);
    setSelectedModalidade(modalidade);
    setModalOpen(true);
  }

  async function handleDelete(modalidade: Modalidade) {
    const confirmed = await showConfirm({
      title: "Confirmar exclusão",
      message: `Tem certeza que deseja excluir a modalidade "${modalidade.nome}"? Esta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
      variant: "destructive"
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/modalidades/${modalidade.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchModalidades();
      } else {
        const error = await response.json();
        showAlert(error.error || "Erro ao excluir modalidade");
      }
    } catch (error) {
      console.error("Erro ao excluir modalidade:", error);
      showAlert("Erro ao excluir modalidade");
    }
  }

  async function handleSuccess() {
    setModalOpen(false);
    setSelectedModalidade(null);
    await fetchModalidades();
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <AlertComponent />
      <div className="space-y-4">
        <div className="flex justify-end">
        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Modalidade
        </Button>
      </div>

      {modalidades.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma modalidade cadastrada. Clique em "Nova Modalidade" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modalidades.map((modalidade) => (
            <Card key={modalidade.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {modalidade.nome}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(modalidade)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(modalidade)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alunos:</span>
                    <Badge variant="secondary">
                      {modalidade._count?.alunos || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Professores:</span>
                    <Badge variant="secondary">
                      {modalidade._count?.professores || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Graduações:</span>
                    <Badge variant="secondary">
                      {modalidade._count?.graduacoes || 0}
                    </Badge>
                  </div>
                </div>

                {modalidade.graduacoes && modalidade.graduacoes.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Graduações:</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {modalidade.graduacoes
                        .sort((a, b) => a.ordem - b.ordem)
                        .map((grad) => (
                          <div
                            key={grad.id}
                            className="flex items-center text-sm py-1 px-2 bg-gray-50 rounded"
                          >
                            <span className="text-gray-700">
                              {grad.ordem}. {grad.nome}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ModalidadeFormModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setSelectedModalidade(null);
        }}
        modalidade={selectedModalidade}
        onSuccess={handleSuccess}
      />
      </div>
    </>
  );
}
