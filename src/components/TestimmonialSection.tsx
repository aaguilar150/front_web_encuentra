import { useEffect, useState } from 'react';
import { Testimonial } from '../types';

export const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://symtechven.com/api/docs#/rescatista') 
      .then((res) => {
        if (!res.ok) throw new Error('Error al conectar con el servidor de históricos');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setTestimonials(data);
        } else if (data && typeof data === 'object' && Array.isArray((data as any).results)) {
          setTestimonials((data as any).results);
        } else {
          // Si la API responde un objeto vacío o algo inesperado, evitamos que rompa
          setTestimonials([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudieron cargar los casos históricos en este momento.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-10 text-slate-400">Cargando históricos de la plataforma...</div>;
  if (error) return <div className="text-center p-10 text-red-400">{error}</div>;

  return (
    <section className="py-16 bg-slate-950 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-emerald-400 text-xs font-semibold tracking-wider uppercase bg-emerald-500/10 px-3 py-1 rounded-full">
            Casos de Éxito
          </span>
          <h2 className="text-3xl font-bold text-white mt-3 mb-2">Historias de Reencuentro</h2>
          <p className="text-slate-400">Históricos gestionados de manera exitosa mediante reconocimiento facial.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials && testimonials.map((item) => (
            <div key={item.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-emerald-500/30 transition-all duration-300">
              <p className="text-slate-300 italic mb-6">"{item.content}"</p>
              <div className="flex items-center gap-3">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                )}
                <div>
                  <h4 className="text-white font-medium text-sm">{item.name}</h4>
                  {item.role && <p className="text-slate-500 text-xs">{item.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};