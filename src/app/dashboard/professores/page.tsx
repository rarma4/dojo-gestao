import { ProfessoresManager } from "./_components/professores-manager";

export default function ProfessoresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Gerenciar Professores
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Cadastre e gerencie apenas os professores da sua conta
        </p>
      </div>

      <ProfessoresManager />
    </div>
  );
}
