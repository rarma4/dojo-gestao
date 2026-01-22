import { AlunosManager } from "./_components/alunos-manager";

export default function AlunosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gerenciar Alunos</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Cadastre e gerencie os alunos da academia
        </p>
      </div>

      <AlunosManager />
    </div>
  );
}
