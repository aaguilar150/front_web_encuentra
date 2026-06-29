import { Check, Heart, Phone, RefreshCw } from 'lucide-react';

import { ResultadoRegistro } from '../../api';

interface ReportSuccessProps {
  result: ResultadoRegistro;
  onReset: () => void;
}

export default function ReportSuccess({ result, onReset }: ReportSuccessProps) {
  return (
    <div className="text-center py-10 px-4 max-w-md mx-auto" id="report-success-screen">
      <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
        <Check size={28} />
      </div>
      <h3 className="text-lg font-bold text-slate-900">¡Registro Exitoso!</h3>
      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
        La persona quedó indexada. Su rostro ya puede coincidir con las búsquedas de sus seres queridos.
      </p>
      <p className="text-xs text-slate-400 font-mono mt-2">Código de registro: {result.codigo}</p>

      {result.alerta && (
        <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left text-sm space-y-1.5">
          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
            <Heart size={15} className="fill-emerald-500 text-emerald-500" /> ¡Un familiar ya la buscaba!
          </p>
          {result.alerta.familiar_nombre && (
            <p className="text-slate-600"><strong>Familiar:</strong> {result.alerta.familiar_nombre}</p>
          )}
          {result.alerta.familiar_telefono && (
            <p className="text-slate-600 flex items-center gap-1.5">
              <Phone size={14} className="text-emerald-600" /> {result.alerta.familiar_telefono}
            </p>
          )}
          <p className="text-[11px] text-emerald-700">Coincidencia {result.alerta.coincidencia}% · confianza {result.alerta.confianza}.</p>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onReset}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          id="btn-add-more"
        >
          <RefreshCw size={16} />
          Reportar Otra Persona
        </button>
      </div>
    </div>
  );
}
