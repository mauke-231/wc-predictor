import type { Formation, Player } from '../types';

interface LineupPickerProps {
  squad: Player[];
  formation: Formation;
  lineupIds: string[];
  onLineupChange: (ids: string[]) => void;
  onAutoPick: () => void;
  teamLabel: string;
}

export function LineupPicker({ squad, formation, lineupIds, onLineupChange, onAutoPick, teamLabel }: LineupPickerProps) {
  // Map each concrete formation to an ordered list of role labels that matches
  // the exact order of `formation.slots`.
  const roleByFormationId: Record<string, string[]> = {
    // slots: GK, DEFx4, MIDx3, FWDx3
    '4-3-3': ['GK', 'LB', 'CB', 'CB', 'RB', 'AMF', 'CMF', 'AMF', 'LWF', 'ST', 'RWF'],

    // slots: GK, DEFx4, MIDx4, FWDx2
    '4-4-2': ['GK', 'LB', 'CB', 'CB', 'RB', 'LMF', 'CMF', 'AMF', 'RMF', 'ST', 'ST'],

    // slots: GK, DEFx4, MIDx5, FWDx1
    '4-2-3-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'DMF', 'DMF', 'LMF', 'AMF', 'RMF', 'ST'],

    // slots: GK, DEFx3, MIDx5, FWDx2
    '3-5-2': ['GK', 'CB', 'CB', 'CB', 'LWB', 'DMF', 'CMF', 'AMF', 'RWB', 'ST', 'ST'],

    // slots: GK, DEFx3, MIDx4, FWDx3
    '3-4-3': ['GK', 'CB', 'CB', 'CB', 'LMF', 'DMF', 'CMF', 'RMF', 'LWF', 'ST', 'RWF'],

    // slots: GK, DEFx5, MIDx3, FWDx2
    '5-3-2': ['GK', 'LWB', 'CB', 'CB', 'CB', 'RWB', 'CMF', 'CMF', 'CMF', 'ST', 'ST'],

    // slots: GK, DEFx4, MIDx5, FWDx1
    '4-1-4-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'DMF', 'LMF', 'CMF', 'AMF', 'RMF', 'ST'],
  };

  const formationRoles = roleByFormationId[formation.id] ?? formation.slots.map(() => '');

  const slots = formation.slots.map((position, index) => {
    const label = formationRoles[index] ?? position;
    return { position, label };
  });


  return (

    <div className="lineup-picker">
      <div className="lineup-picker-header">
        <span>{teamLabel} lineup</span>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onAutoPick}>
          Auto-pick lineup
        </button>
      </div>
      <div className="lineup-slots">
        {slots.map((slot, index) => {
          const selectedId = lineupIds[index] ?? '';
          const otherSelectedIds = new Set(lineupIds.filter((_, idx) => idx !== index));

          const players = squad
            .filter((player) => player.position === slot.position)
            .sort((a, b) => b.rating - a.rating || a.number - b.number);

          return (
            <label key={`${slot.position}-${index}`} className="lineup-slot">
              <span className="slot-label">{slot.label}</span>
              <select
                value={selectedId}
                onChange={(event) => {
                  const nextIds = [...lineupIds];
                  nextIds[index] = event.target.value;
                  onLineupChange(nextIds);
                }}
              >
                <option value="">Select {slot.position}</option>
                {players.map((player) => (
                  <option
                    key={player.id}
                    value={player.id}
                    disabled={otherSelectedIds.has(player.id)}
                  >
                    {`#${player.number} ${player.name} (${player.rating})`}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
    </div>
  );
}
