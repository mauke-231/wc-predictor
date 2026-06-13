import { FORMATIONS } from '../data/formations';

interface FormationPickerProps {
  selected: string;
  onChange: (formationId: string) => void;
  label?: string;
}

export function FormationPicker({ selected, onChange, label = 'Formation' }: FormationPickerProps) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {label}
      </label>
      <div className="formation-grid">
        {FORMATIONS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`formation-btn ${selected === f.id ? 'selected' : ''}`}
            onClick={() => onChange(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
