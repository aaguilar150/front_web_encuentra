import { Check, Heart, Phone, CheckCircle2 } from 'lucide-react';

import { ResultadoRegistro } from '../../api';

interface ReportSuccessProps {
  result: ResultadoRegistro;
  onReset: () => void;
  onBack?: () => void;
}

export default function ReportSuccess({ result, onReset, onBack }: ReportSuccessProps) {
  return (
    <div className="text-center py-8 px-4 max-w-md mx-auto animate-[fadeIn_0.3s_ease-out]" id="report-success-screen">
      
      {/* Glowing Checkmark */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30"></div>
        <div className="relative w-full h-full bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
          <Check size={48} strokeWidth={3} />
        </div>
      </div>
      
      <h3 className="text-2xl font-black text-[#1e293b]">¡Registro completado!</h3>
      
      <p className="text-[15px] font-medium text-slate-500 mt-4 leading-relaxed max-w-[280px] mx-auto">
        Gracias por ayudar a reunir familias. La información ya está disponible para quienes buscan a esta persona.
      </p>

      {/* Confirmation Badge */}
      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-100 text-emerald-600 rounded-xl font-bold text-sm shadow-sm">
        <CheckCircle2 size={18} className="text-emerald-500" />
        Persona agregada a la base de datos
      </div>

      {/* Immediate Match Alert (if any) */}
      {result.alerta && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left text-sm space-y-1.5 shadow-sm">
          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
            <Heart size={15} className="fill-emerald-500 text-emerald-500" /> ¡Un familiar ya la buscaba!
          </p>
          {result.alerta.familiar_nombre && (
            <p className="text-slate-600">
              <strong>Familiar:</strong> {result.alerta.familiar_nombre}
            </p>
          )}
          {result.alerta.familiar_telefono && (
            <p className="text-slate-600 flex items-center gap-1.5">
              <Phone size={14} className="text-emerald-600" /> {result.alerta.familiar_telefono}
            </p>
          )}
          <p className="text-[11px] text-emerald-700">
            Coincidencia {result.alerta.coincidencia}% · confianza {result.alerta.confianza}.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-10 flex flex-col gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl transition-all shadow-md"
          >
            Volver al inicio
          </button>
        )}
        <button
          onClick={onReset}
          className="w-full py-3.5 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-base rounded-2xl transition-all shadow-sm"
          id="btn-add-more"
        >
          Registrar otra persona
        </button>
      </div>
      
      <p className="text-[10px] text-slate-400 font-mono mt-6">Ref: {result.codigo}</p>
    </div>
  );
}
