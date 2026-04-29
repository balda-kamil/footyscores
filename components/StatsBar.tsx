import { Match } from '@/types/match';

interface Props {
  matches: Match[];
  endpointsVisible: boolean;
}

const STATS = (matches: Match[], endpointsVisible: boolean) =>
  [
    { label: 'Total Matches',      value: matches.length,                                    color: 'text-green'  },
    { label: "Men's (U23)",        value: matches.filter((m) => m.gender === 'men').length,  color: 'text-blue'   },
    { label: "Women's",            value: matches.filter((m) => m.gender === 'women').length,color: 'text-purple' },
    { label: 'Group Stage',        value: matches.filter((m) => m.stage === 'group').length, color: ''            },
    { label: 'Knockout',           value: matches.filter((m) => m.stage !== 'group').length, color: 'text-orange' },
    { label: 'Endpoints Generated',value: endpointsVisible ? matches.length : 0,             color: 'text-green'  },
  ] as const;

export function StatsBar({ matches, endpointsVisible }: Props) {
  return (
    <div className="flex flex-wrap gap-px bg-line border border-line rounded-lg overflow-hidden mt-5">
      {STATS(matches, endpointsVisible).map(({ label, value, color }) => (
        <div
          key={label}
          className="min-w-[100px] flex-1 bg-surface px-5 py-[14px] flex flex-col gap-[3px]"
        >
          <div className="text-[11px] text-dim uppercase tracking-[0.6px] font-semibold">
            {label}
          </div>
          <div className={`text-[22px] font-bold tracking-[-0.5px] ${color}`}>{value}</div>
        </div>
      ))}
    </div>
  );
}
