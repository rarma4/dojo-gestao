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
  telefone: string;
  email?: string;
  dataNascimento: string;
  dataMatricula: string;
  modalidadeId: string;
  graduacaoAtualId?: string;
  statusMensalidade: string;
  planoPagamento: string;
  valorPlano: number;
  ativo: boolean;
}

interface Modalidade {
  id: string;
  nome: string;
}

interface GraduacaoTipo {
  id: string;
  nome: string;
  modalidadeId: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aluno: Aluno | null;
  onSuccess: () => void;
}

export function AlunoFormModal({ open, onOpenChange, aluno, onSuccess }: Props) {  const { showAlert, AlertComponent } = useAlertModal();  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [graduacoes, setGraduacoes] = useState<GraduacaoTipo[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    dataNascimento: "",
    dataMatricula: "",
    modalidadeId: "",
    graduacaoAtualId: "",
    statusMensalidade: "EM_DIA",
    planoPagamento: "MENSAL",
    valorPlano: "",
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
    async function fetchGraduacoes() {
      if (!formData.modalidadeId) {
        setGraduacoes([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/graduacoes-tipo?modalidadeId=${formData.modalidadeId}`
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
  }, [formData.modalidadeId]);

  useEffect(() => {
    if (aluno) {
      setFormData({
        nome: aluno.nome,
        telefone: aluno.telefone,
        email: aluno.email || "",
        dataNascimento: aluno.dataNascimento.split("T")[0],
        dataMatricula: aluno.dataMatricula.split("T")[0],
        modalidadeId: aluno.modalidadeId,
        graduacaoAtualId: aluno.graduacaoAtualId || "",
        statusMensalidade: aluno.statusMensalidade,
        planoPagamento: aluno.planoPagamento,
        valorPlano: aluno.valorPlano.toString(),
        ativo: aluno.ativo,
      });
    } else {
      setFormData({
        nome: "",
        telefone: "",
        email: "",
        dataNascimento: "",
        dataMatricula: new Date().toISOString().split("T")[0],
        modalidadeId: "",
        graduacaoAtualId: "",
        statusMensalidade: "EM_DIA",
        planoPagamento: "MENSAL",
        valorPlano: "",
        ativo: true,
      });
    }
  }, [aluno]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = aluno ? `/api/alunos/${aluno.id}` : "/api/alunos";
      const method = aluno ? "PUT" : "POST";

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
        showAlert(error.error || "Erro ao salvar aluno");
      }
    } catch (error) {
      console.error("Erro ao salvar aluno:", error);
      showAlert("Erro ao salvar aluno");
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{aluno ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
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
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
              <Input
                id="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => handleChange("dataNascimento", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="dataMatricula">Data de Matrícula *</Label>
              <Input
                id="dataMatricula"
                type="date"
                value={formData.dataMatricula}
                onChange={(e) => handleChange("dataMatricula", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="modalidade">Modalidade *</Label>
              <Select
                value={formData.modalidadeId}
                onValueChange={(value) => {
                  handleChange("modalidadeId", value);
                  handleChange("graduacaoAtualId", "");
                }}
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
              <Label htmlFor="graduacao">Graduação Atual</Label>
              <Select
                value={formData.graduacaoAtualId}
                onValueChange={(value) => handleChange("graduacaoAtualId", value)}
                disabled={!formData.modalidadeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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
              <Label htmlFor="statusMensalidade">Status da Mensalidade *</Label>
              <Select
                value={formData.statusMensalidade}
                onValueChange={(value) => handleChange("statusMensalidade", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EM_DIA">Em Dia</SelectItem>
                  <SelectItem value="ATRASADA">Atrasada</SelectItem>
                  <SelectItem value="ISENTO">Isento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="planoPagamento">Plano de Pagamento *</Label>
              <Select
                value={formData.planoPagamento}
                onValueChange={(value) => handleChange("planoPagamento", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MENSAL">Mensal</SelectItem>
                  <SelectItem value="BIMESTRAL">Bimestral</SelectItem>
                  <SelectItem value="TRIMESTRAL">Trimestral</SelectItem>
                  <SelectItem value="SEMESTRAL">Semestral</SelectItem>
                  <SelectItem value="ANUAL">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="valorPlano">Valor do Plano (R$) *</Label>
              <Input
                id="valorPlano"
                type="number"
                step="0.01"
                value={formData.valorPlano}
                onChange={(e) => handleChange("valorPlano", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="ativo" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="ativo"
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => handleChange("ativo", e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Aluno Ativo</span>
              </Label>
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
