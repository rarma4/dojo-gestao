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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlertModal } from "@/hooks/use-alert-modal";

interface Professor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  modalidadeId: string;
  isAdmin: boolean;
  ativo: boolean;
}

interface Modalidade {
  id: string;
  nome: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professor: Professor | null;
  onSuccess: () => void;
}

export function ProfessorFormModal({ open, onOpenChange, professor, onSuccess }: Props) {
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [loading, setLoading] = useState(false);
  const { showAlert, AlertComponent } = useAlertModal();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    modalidadeId: "",
    isAdmin: false,
    ativo: true,
  });

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
    if (professor) {
      setFormData({
        nome: professor.nome,
        email: professor.email,
        telefone: professor.telefone,
        modalidadeId: professor.modalidadeId,
        isAdmin: professor.isAdmin,
        ativo: professor.ativo,
      });
    } else {
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        modalidadeId: "",
        isAdmin: false,
        ativo: true,
      });
    }
  }, [professor]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = professor ? `/api/professores/${professor.id}` : "/api/professores";
      const method = professor ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        showAlert(error.error || "Erro ao salvar professor");
      }
    } catch (error) {
      console.error("Erro ao salvar professor:", error);
      showAlert("Erro ao salvar professor");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <>
      <AlertComponent />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{professor ? "Editar Professor" : "Novo Professor"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
              placeholder="(11) 98765-4321"
              required
            />
          </div>

          <div>
            <Label htmlFor="modalidade">Modalidade *</Label>
            <Select
              value={formData.modalidadeId}
              onValueChange={(value) => handleChange("modalidadeId", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
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
            <Label htmlFor="isAdmin" className="flex items-center gap-2 cursor-pointer">
              <input
                id="isAdmin"
                type="checkbox"
                checked={formData.isAdmin}
                onChange={(e) => handleChange("isAdmin", e.target.checked)}
                className="w-4 h-4"
              />
              <span>É Administrador</span>
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Administradores têm acesso completo ao sistema
            </p>
          </div>

          <div>
            <Label htmlFor="ativo" className="flex items-center gap-2 cursor-pointer">
              <input
                id="ativo"
                type="checkbox"
                checked={formData.ativo}
                onChange={(e) => handleChange("ativo", e.target.checked)}
                className="w-4 h-4"
              />
              <span>Professor Ativo</span>
            </Label>
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
