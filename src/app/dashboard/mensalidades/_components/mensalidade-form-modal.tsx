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

interface Aluno {
  id: string;
  nome: string;
  valorPlano: number;
}

interface Mensalidade {
  id: string;
  dataPagamento: string;
  valorPago: number;
  aluno: {
    id: string;
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mensalidade?: Mensalidade | null;
  onSuccess: () => void;
}

export function MensalidadeFormModal({ open, onOpenChange, mensalidade, onSuccess }: Props) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);
  const { showAlert, AlertComponent } = useAlertModal();

  const [formData, setFormData] = useState({
    alunoId: "",
    dataPagamento: new Date().toISOString().split("T")[0],
    valorPago: "",
  });

  useEffect(() => {
    if (mensalidade) {
      setFormData({
        alunoId: mensalidade.aluno.id,
        dataPagamento: new Date(mensalidade.dataPagamento).toISOString().split("T")[0],
        valorPago: mensalidade.valorPago.toString(),
      });
    } else {
      setFormData({
        alunoId: "",
        dataPagamento: new Date().toISOString().split("T")[0],
        valorPago: "",
      });
    }
  }, [mensalidade, open]);

  useEffect(() => {
    async function fetchAlunos() {
      try {
        const response = await fetch("/api/alunos?ativo=true");
        if (response.ok) {
          const data = await response.json();
          setAlunos(data);
        }
      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
      }
    }

    if (open) {
      fetchAlunos();
    }
  }, [open]);

  useEffect(() => {
    if (formData.alunoId) {
      const aluno = alunos.find((a) => a.id === formData.alunoId);
      if (aluno) {
        setFormData((prev) => ({
          ...prev,
          valorPago: aluno.valorPlano.toString(),
        }));
      }
    }
  }, [formData.alunoId, alunos]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = mensalidade 
        ? `/api/mensalidades/${mensalidade.id}` 
        : "/api/mensalidades";
      const method = mensalidade ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        setFormData({
          alunoId: "",
          dataPagamento: new Date().toISOString().split("T")[0],
          valorPago: "",
        });
      } else {
        const error = await response.json();
        showAlert(error.error || "Erro ao salvar mensalidade");
      }
    } catch (error) {
      console.error("Erro ao salvar mensalidade:", error);
      showAlert("Erro ao salvar mensalidade");
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
          <DialogTitle>{mensalidade ? "Editar Pagamento" : "Registrar Pagamento"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="aluno">Aluno *</Label>
            <Select
              value={formData.alunoId}
              onValueChange={(value) => handleChange("alunoId", value)}
              disabled={!!mensalidade}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o aluno" />
              </SelectTrigger>
              <SelectContent>
                {alunos.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dataPagamento">Data do Pagamento *</Label>
            <Input
              id="dataPagamento"
              type="date"
              value={formData.dataPagamento}
              onChange={(e) => handleChange("dataPagamento", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="valorPago">Valor Pago (R$) *</Label>
            <Input
              id="valorPago"
              type="number"
              step="0.01"
              value={formData.valorPago}
              onChange={(e) => handleChange("valorPago", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ O próximo vencimento será calculado automaticamente baseado no plano do aluno.
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
              {loading ? "Salvando..." : mensalidade ? "Atualizar Pagamento" : "Registrar Pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
