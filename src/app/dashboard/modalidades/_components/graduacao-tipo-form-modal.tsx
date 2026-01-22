"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlertModal } from "@/hooks/use-alert-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Modalidade {
  id: string;
  nome: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modalidadeId: string | null;
  graduacao?: any;
  onSuccess: () => void;
}

export function GraduacaoTipoFormModal({
  open,
  onOpenChange,
  modalidadeId,
  graduacao,
  onSuccess,
}: Props) {
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [selectedModalidadeId, setSelectedModalidadeId] = useState("");
  const [nome, setNome] = useState("");
  const [ordem, setOrdem] = useState("");
  const [loading, setLoading] = useState(false);
  const { showAlert, AlertComponent } = useAlertModal();

  useEffect(() => {
    async function fetchModalidades() {
      try {
        const response = await fetch("/api/modalidades");
        if (response.ok) {
          const data = await response.json();
          setModalidades(data);
        }
      } catch (error) {
        console.error("Erro ao buscar modalidades:", error);
      }
    }

    fetchModalidades();
  }, []);

  useEffect(() => {
    if (modalidadeId) {
      setSelectedModalidadeId(modalidadeId);
    } else {
      setSelectedModalidadeId("");
    }
  }, [modalidadeId]);

  useEffect(() => {
    if (graduacao) {
      setNome(graduacao.nome || "");
      setOrdem(graduacao.ordem?.toString() || "");
      if (graduacao.modalidadeId) {
        setSelectedModalidadeId(graduacao.modalidadeId);
      }
    } else {
      setNome("");
      setOrdem("");
      if (modalidadeId) {
        setSelectedModalidadeId(modalidadeId);
      }
    }
  }, [graduacao, modalidadeId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = graduacao
        ? `/api/graduacoes-tipo/${graduacao.id}`
        : "/api/graduacoes-tipo";
      const method = graduacao ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          ordem: parseInt(ordem),
          modalidadeId: selectedModalidadeId,
        }),
      });

      if (response.ok) {
        onSuccess();
        setNome("");
        setOrdem("");
        setSelectedModalidadeId("");
      } else {
        const error = await response.json();
        showAlert(error.error || "Erro ao salvar graduação");
      }
    } catch (error) {
      console.error("Erro ao salvar graduação:", error);
      showAlert("Erro ao salvar graduação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AlertComponent />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {graduacao ? "Editar Graduação" : "Adicionar Graduação"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="modalidade">Modalidade *</Label>
            <Select
              value={selectedModalidadeId}
              onValueChange={setSelectedModalidadeId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a modalidade" />
              </SelectTrigger>
              <SelectContent>
                {modalidades.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="nome">Nome da Graduação *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Faixa Branca, Faixa Azul"
              required
            />
          </div>

          <div>
            <Label htmlFor="ordem">Ordem *</Label>
            <Input
              id="ordem"
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              placeholder="Ex: 1, 2, 3..."
              required
              min="1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Define a ordem das graduações (menor = inicial)
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : graduacao ? "Atualizar" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
