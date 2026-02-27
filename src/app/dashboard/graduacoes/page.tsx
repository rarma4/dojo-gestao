import { GraduacoesManager } from "./_components/graduacoes-manager";

export default function GraduacoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Histórico de Graduações
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Registre e acompanhe a evolução dos alunos da sua conta
        </p>
      </div>

      <GraduacoesManager />
    </div>
  );
}
