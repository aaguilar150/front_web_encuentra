import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PhoneField from './PhoneField';

describe('PhoneField', () => {
  it('filters the phone number input to digits and reports prefix changes', () => {
    const onPrefixChange = vi.fn();
    const onNumberChange = vi.fn();

    render(
      <PhoneField
        prefix="0424"
        number=""
        onPrefixChange={onPrefixChange}
        onNumberChange={onNumberChange}
        accent="blue"
      />,
    );

    fireEvent.change(screen.getByLabelText(/prefijo telefónico/i), {
      target: { value: '0412' },
    });
    fireEvent.change(screen.getByPlaceholderText('8135166'), {
      target: { value: '81a35-166' },
    });

    expect(onPrefixChange).toHaveBeenCalledWith('0412');
    expect(onNumberChange).toHaveBeenCalledWith('8135166');
  });
});
