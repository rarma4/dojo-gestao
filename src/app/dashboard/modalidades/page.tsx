import { ModalidadesManager } from "./_components/modalidades-manager";

export default function ModalidadesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Gerenciar Modalidades
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Adicione ou edite as artes marciais oferecidas
        </p>
      </div>

      <ModalidadesManager />
    </div>
  );
}
