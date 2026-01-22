"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Graduacao {
  id: string;
  dataGraduacao: string;
  aluno: {
    nome: string;
  };
  graduacaoTipo: {
    nome: string;
  };
  professor: {
    nome: string;
  };
}

interface ProximoVencimento {
  id: string;
  nome: string;
  proximoVencimento: string;
  modalidade: {
    nome: string;
  };
}

export function RecentActivities() {
  const [graduacoes, setGraduacoes] = useState<Graduacao[]>([]);
  const [vencimentos, setVencimentos] = useState<ProximoVencimento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard");
        if (response.ok) {
          const data = await response.json();
          setGraduacoes(data.graduacoesRecentes || []);
          setVencimentos(data.proximosVencimentos || []);
        }
      } catch (error) {
        console.error("Erro ao buscar atividades:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-5 bg-gray-200 rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-5 bg-gray-200 rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Graduações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {graduacoes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma graduação recente
            </p>
          ) : (
            <div className="space-y-4">
              {graduacoes.slice(0, 5).map((graduacao) => (
                <div
                  key={graduacao.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {graduacao.aluno.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {graduacao.graduacaoTipo.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Prof. {graduacao.professor.nome}
                    </p>
                  </div>
                  <Badge variant="success" className="text-xs">
                    {format(
                      new Date(graduacao.dataGraduacao),
                      "dd/MM/yyyy",
                      { locale: ptBR }
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Próximos Vencimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vencimentos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum vencimento próximo
            </p>
          ) : (
            <div className="space-y-4">
              {vencimentos.slice(0, 5).map((aluno) => (
                <div
                  key={aluno.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-sm">{aluno.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {aluno.modalidade.nome}
                    </p>
                  </div>
                  <Badge variant="warning" className="text-xs">
                    {format(
                      new Date(aluno.proximoVencimento),
                      "dd/MM/yyyy",
                      { locale: ptBR }
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
