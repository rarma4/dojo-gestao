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
  modalidade: {
    id: string;
    nome: string;
  };
}

interface GraduacaoTipo {
  id: string;
  nome: string;
}

interface Professor {
  id: string;
  nome: string;
}

interface Graduacao {
  id: string;
  dataGraduacao: string;
  valorPago: number | null;
  aluno: {
    id: string;
    nome: string;
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  graduacao?: Graduacao | null;
}

export function GraduacaoFormModal({ open, onOpenChange, onSuccess, graduacao }: Props) {
  const { showAlert, AlertComponent } = useAlertModal();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [graduacoes, setGraduacoes] = useState<GraduacaoTipo[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    alunoId: "",
    graduacaoTipoId: "",
    professorId: "",
    dataGraduacao: new Date().toISOString().split("T")[0],
    valorPago: "",
  });

  useEffect(() => {
    if (open && graduacao) {
      setFormData({
        alunoId: graduacao.aluno.id,
        graduacaoTipoId: graduacao.graduacaoTipo.id,
        professorId: graduacao.professor.id,
        dataGraduacao: graduacao.dataGraduacao.split("T")[0],
        valorPago: graduacao.valorPago?.toString() || "",
      });
    } else if (open && !graduacao) {
      setFormData({
        alunoId: "",
        graduacaoTipoId: "",
        professorId: "",
        dataGraduacao: new Date().toISOString().split("T")[0],
        valorPago: "",
      });
    }
  }, [open, graduacao]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [alunosRes, professoresRes] = await Promise.all([
          fetch("/api/alunos?ativo=true"),
          fetch("/api/professores?ativo=true"),
        ]);

        if (alunosRes.ok) {
          const alunosData = await alunosRes.json();
          setAlunos(alunosData);
        }

        if (professoresRes.ok) {
          const professoresData = await professoresRes.json();
          setProfessores(professoresData);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }

    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    async function fetchGraduacoes() {
      if (!formData.alunoId) {
        setGraduacoes([]);
        return;
      }

      const aluno = alunos.find((a) => a.id === formData.alunoId);
      if (!aluno) return;

      try {
        const response = await fetch(
          `/api/graduacoes-tipo?modalidadeId=${aluno.modalidade.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setGraduacoes(data);
        }
      } catch (error) {
        console.error("Erro ao buscar graduações:", error);
      }
    }

    fetchGraduacoes();
  }, [formData.alunoId, alunos]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = graduacao ? `/api/graduacoes/${graduacao.id}` : "/api/graduacoes";
      const method = graduacao ? "PUT" : "POST";
      
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
          graduacaoTipoId: "",
          professorId: "",
          dataGraduacao: new Date().toISOString().split("T")[0],
          valorPago: "",
        });
      } else {
        const error = await response.json();
        showAlert(error.error || `Erro ao ${graduacao ? 'atualizar' : 'registrar'} graduação`);
      }
    } catch (error) {
      console.error(`Erro ao ${graduacao ? 'atualizar' : 'registrar'} graduação:`, error);
      showAlert(`Erro ao ${graduacao ? 'atualizar' : 'registrar'} graduação`);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const selectedAluno = alunos.find((a) => a.id === formData.alunoId);

  return (
    <>
      <AlertComponent />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{graduacao ? 'Editar Graduação' : 'Registrar Graduação'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="aluno">Aluno *</Label>
            <Select
              value={formData.alunoId}
              onValueChange={(value) => {
                handleChange("alunoId", value);
                handleChange("graduacaoTipoId", "");
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o aluno" />
              </SelectTrigger>
              <SelectContent>
                {alunos.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome} - {a.modalidade.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAluno && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Modalidade: <strong>{selectedAluno.modalidade.nome}</strong>
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="graduacao">Nova Graduação *</Label>
            <Select
              value={formData.graduacaoTipoId}
              onValueChange={(value) => handleChange("graduacaoTipoId", value)}
              disabled={!formData.alunoId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a graduação" />
              </SelectTrigger>
              <SelectContent>
                {graduacoes.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="professor">Professor Responsável *</Label>
            <Select
              value={formData.professorId}
              onValueChange={(value) => handleChange("professorId", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o professor" />
              </SelectTrigger>
              <SelectContent>
                {professores.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dataGraduacao">Data da Graduação *</Label>
            <Input
              id="dataGraduacao"
              type="date"
              value={formData.dataGraduacao}
              onChange={(e) => handleChange("dataGraduacao", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="valorPago">Valor Pago (R$)</Label>
            <Input
              id="valorPago"
              type="number"
              step="0.01"
              value={formData.valorPago}
              onChange={(e) => handleChange("valorPago", e.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Opcional - valor cobrado pela graduação
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ A graduação atual do aluno será atualizada automaticamente
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
              {loading ? "Salvando..." : (graduacao ? "Atualizar Graduação" : "Registrar Graduação")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
