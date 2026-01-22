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

interface Modalidade {
  id: string;
  nome: string;
  descricao?: string;
  corTema?: string;
  graduacoes?: Array<{
    id: string;
    nome: string;
    ordem: number;
  }>;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modalidade: Modalidade | null;
  onSuccess: () => void;
}

export function ModalidadeFormModal({
  open,
  onOpenChange,
  modalidade,
  onSuccess,
}: Props) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [graduacoesTexto, setGraduacoesTexto] = useState("");
  const [corTema, setCorTema] = useState("#1e40af");
  const [loading, setLoading] = useState(false);
  const { showAlert, AlertComponent } = useAlertModal();

  useEffect(() => {
    if (open) {
      if (modalidade) {
        setNome(modalidade.nome);
        setDescricao(modalidade.descricao || "");
        setCorTema(modalidade.corTema || "#1e40af");
        if (modalidade.graduacoes && modalidade.graduacoes.length > 0) {
          const graduacoesNomes = modalidade.graduacoes
            .sort((a, b) => a.ordem - b.ordem)
            .map(g => g.nome)
            .join(", ");
          setGraduacoesTexto(graduacoesNomes);
        } else {
          setGraduacoesTexto("");
        }
      } else {
        setNome("");
        setDescricao("");
        setGraduacoesTexto("");
        setCorTema("#1e40af");
      }
    }
  }, [modalidade, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = modalidade
        ? `/api/modalidades/${modalidade.id}`
        : "/api/modalidades";
      const method = modalidade ? "PUT" : "POST";

      // Processar graduações separadas por vírgula
      const graduacoesArray = graduacoesTexto
        .split(",")
        .map(g => g.trim())
        .filter(g => g.length > 0);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          nome,
          descricao: descricao || null,
          corTema: corTema || "#1e40af",
          graduacoes: graduacoesArray,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        showAlert(error.error || "Erro ao salvar modalidade");
      }
    } catch (error) {
      console.error("Erro ao salvar modalidade:", error);
      showAlert("Erro ao salvar modalidade");
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
            {modalidade ? "Editar Modalidade" : "Nova Modalidade"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Modalidade *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Jiu-Jitsu, Karatê, Muay Thai"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição da modalidade (opcional)"
              className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="graduacoes">Graduações (separadas por vírgula)</Label>
            <Input
              id="graduacoes"
              value={graduacoesTexto}
              onChange={(e) => setGraduacoesTexto(e.target.value)}
              placeholder="Ex: Branca, Azul, Roxa, Marrom, Preta"
            />
            <p className="text-xs text-muted-foreground mt-1">
              As graduações serão criadas automaticamente na ordem informada
            </p>
          </div>

          <div>
            <Label htmlFor="corTema">Cor Tema</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                id="corTema"
                value={corTema}
                onChange={(e) => setCorTema(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={corTema}
                onChange={(e) => setCorTema(e.target.value)}
                placeholder="#1e40af"
                className="flex-1"
              />
            </div>
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
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
