import { MensalidadesManager } from "./_components/mensalidades-manager";

export default function MensalidadesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Controle de Mensalidades
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Visualize e gerencie o status de pagamento dos alunos
        </p>
      </div>

      <MensalidadesManager />
    </div>
  );
}
