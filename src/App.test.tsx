import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

const reportarFalla = vi.fn();

vi.mock('./api', () => ({
  reportarFalla: (text: string) => reportarFalla(text),
}));

vi.mock('./components/SearchMissingForm', () => ({
  default: () => <div>Buscar content</div>,
}));

vi.mock('./components/ReportFoundForm', () => ({
  default: () => <div>Reportar content</div>,
}));

vi.mock('./components/OnboardingModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <button onClick={onClose}>Cerrar onboarding</button>
  ),
}));

describe('App shell', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('ven_onboarded', '1');
    localStorage.setItem('ven_disaster_found_persons', '[]');
    localStorage.setItem('ven_disaster_stats', JSON.stringify({
      totalFound: 1,
      totalMissingSearched: 2,
      reunitedCount: 3,
      activeShelters: 4,
    }));
    reportarFalla.mockReset();
    reportarFalla.mockResolvedValue({});
  });

  it('switches tabs and submits an error report from the modal', async () => {
    render(<App />);

    expect(screen.getByText('Reportar content')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /buscar familiar/i }));
    expect(screen.getByText('Buscar content')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /reportar error/i }));
    fireEvent.change(screen.getByPlaceholderText(/la imagen no carga/i), {
      target: { value: 'Hay un problema con el flujo' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar reporte/i }));

    await waitFor(() => {
      expect(reportarFalla).toHaveBeenCalledWith('Hay un problema con el flujo');
    });

    expect(await screen.findByText(/gracias por tu reporte/i)).toBeInTheDocument();
  });
});
