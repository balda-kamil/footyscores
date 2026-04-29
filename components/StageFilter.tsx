const STAGES = [
  { value: 'all',          labelShort: 'All Stages',  labelFull: 'All Stages'    },
  { value: 'group',        labelShort: 'Group',       labelFull: 'Group Stage'   },
  { value: 'quarter-final',labelShort: 'QF',          labelFull: 'Quarter-Final' },
  { value: 'semi-final',   labelShort: 'SF',          labelFull: 'Semi-Final'    },
  { value: 'bronze-medal', labelShort: 'Bronze',      labelFull: 'Bronze Medal'  },
  { value: 'gold-medal',   labelShort: 'Gold',        labelFull: 'Gold Medal'    },
] as const;

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const filterBtn = 'px-3.5 py-[6px] font-sans text-[12.5px] font-medium cursor-pointer border-r border-line last:border-r-0 transition-all whitespace-nowrap';

export function StageFilter({ value, onChange }: Props) {
  return (
    <>
      {/* Mobile: native select */}
      <div className="relative w-full sm:hidden">
        <select
          className="w-full appearance-none bg-surface-2 border border-line-hi text-content font-sans text-[12.5px] rounded-[5px] pl-3 pr-8 py-[7px] outline-none focus:border-blue cursor-pointer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {STAGES.map(({ value: v, labelFull }) => (
            <option key={v} value={v} className="bg-surface-2 text-content">
              {labelFull}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-[18px] top-1/2 -translate-y-1/2 text-dim text-[10px]">
          ⬇️
        </span>
      </div>

      {/* Desktop: button group */}
      <div className="hidden sm:flex border border-line-hi rounded-[5px] overflow-hidden">
        {STAGES.map(({ value: v, labelShort }) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`${filterBtn} ${
              value === v
                ? 'bg-surface-3 text-content font-semibold'
                : 'bg-surface-2 text-dim hover:bg-surface-3 hover:text-content'
            }`}
          >
            {labelShort}
          </button>
        ))}
      </div>
    </>
  );
}
