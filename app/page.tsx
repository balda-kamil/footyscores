'use client';

import {useState, useMemo} from 'react';
import {Toolbar} from '@/components/Toolbar';
import {MatchesTable} from '@/components/MatchesTable';
import {Badge} from '@/components/Badge';
import {mockMatches} from '@/lib/mockMatches';
import {generateEndpoint, stageLabel, formatKickoff} from '@/lib/matchUtils';
import {Match} from '@/types/match';

export default function Home() {
    const [loadState, setLoadState] = useState<'idle' | 'loading' | 'loaded'>('idle');
    const [generating, setGenerating] = useState(false);
    const [endpointsVisible, setEndpointsVisible] = useState(false);
    const [exported, setExported] = useState(false);
    const [genderFilter, setGenderFilter] = useState('all');
    const [stageFilter, setStageFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [inspectMatch, setInspectMatch] = useState<Match | null>(null);

    async function handleLoad() {
        setLoadState('loading');
        await new Promise((r) => setTimeout(r, 1000));
        setLoadState('loaded');
    }

    async function handleGenerate() {
        setGenerating(true);
        await new Promise((r) => setTimeout(r, 600));
        setGenerating(false);
        setEndpointsVisible(true);
    }

    function handleExport() {
        setExported(true);
        setTimeout(() => setExported(false), 2500);
    }

    function clearFilters() {
        setSearch('');
        setGenderFilter('all');
        setStageFilter('all');
    }

    const filtered = useMemo(() => {
        let ms = mockMatches;
        if (genderFilter !== 'all') ms = ms.filter((m) => m.gender === genderFilter);
        if (stageFilter !== 'all') ms = ms.filter((m) => m.stage === stageFilter);
        if (search) {
            const q = search.toLowerCase();
            ms = ms.filter(
                (m) =>
                    m.home.toLowerCase().includes(q) ||
                    m.away.toLowerCase().includes(q) ||
                    m.venue.toLowerCase().includes(q) ||
                    m.city.toLowerCase().includes(q)
            );
        }
        return ms;
    }, [genderFilter, stageFilter, search]);

    const isFiltered = genderFilter !== 'all' || stageFilter !== 'all' || search !== '';
    const menCount = mockMatches.filter((m) => m.gender === 'men').length;
    const womenCount = mockMatches.filter((m) => m.gender === 'women').length;

    return (
        <>
            {/* Header */}
            <header
                className="flex flex-wrap items-center gap-4 px-4 sm:px-7 py-6 border-b border-line bg-surface sticky top-0 z-50 sm:flex-nowrap">
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-8 h-8 rounded-lg bg-green-subtle border border-[rgba(0,232,122,0.25)] flex items-center justify-center text-base shrink-0">
                        ⚽
                    </div>
                    <div className="font-bold text-[15px] tracking-[-0.3px]">
                        Footy<span className="text-green">Scores</span>
                    </div>
                </div>

                <div className="w-px h-5 bg-line-hi"/>
                <div className="text-dim text-[12.5px]">
                    QA Endpoint Generator · Paris 2024 Olympics
                </div>

                <div className="ml-auto flex items-center gap-2.5 w-full">
                    {loadState === 'loaded' && (
                        <>
                            <Badge variant="green">{mockMatches.length} matches</Badge>
                            {endpointsVisible && (
                                <Badge variant="blue">{mockMatches.length} endpoints</Badge>
                            )}
                        </>
                    )}
                </div>
            </header>

            <div className="flex-1 flex flex-col">
                {/* Controls */}
                <div className="px-4 sm:px-7 pt-6">
                    <Toolbar
                        loadState={loadState}
                        generating={generating}
                        endpointsVisible={endpointsVisible}
                        exported={exported}
                        genderFilter={genderFilter}
                        stageFilter={stageFilter}
                        search={search}
                        onLoad={handleLoad}
                        onGenerate={handleGenerate}
                        onExport={handleExport}
                        onGenderFilter={setGenderFilter}
                        onStageFilter={setStageFilter}
                        onSearch={setSearch}
                    />

                    {/* Stats bar */}
                    {loadState === 'loaded' && (
                        <div
                            className="flex flex-wrap gap-px bg-line border border-line rounded-lg overflow-hidden mt-5">
                            {(
                                [
                                    {label: 'Total Matches', value: mockMatches.length, color: 'text-green'},
                                    {label: "Men's (U23)", value: menCount, color: 'text-blue'},
                                    {label: "Women's", value: womenCount, color: 'text-purple'},
                                    {
                                        label: 'Group Stage',
                                        value: mockMatches.filter((m) => m.stage === 'group').length,
                                        color: ''
                                    },
                                    {
                                        label: 'Knockout',
                                        value: mockMatches.filter((m) => m.stage !== 'group').length,
                                        color: 'text-orange'
                                    },
                                    {
                                        label: 'Endpoints Generated',
                                        value: endpointsVisible ? mockMatches.length : 0,
                                        color: 'text-green'
                                    },
                                ] as const
                            ).map(({label, value, color}) => (
                                <div key={label}
                                     className="min-w-[100px] flex-1 bg-surface px-5 py-[14px] flex flex-col gap-[3px] justify-between">
                                    <div className="text-[11px] text-dim uppercase tracking-[0.6px] font-semibold">
                                        {label}
                                    </div>
                                    <div className={`text-[22px] font-bold tracking-[-0.5px] ${color}`}>{value}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="px-4 sm:px-7 pt-4 pb-6 flex-1">
                    <MatchesTable
                        matches={filtered}
                        loadState={loadState}
                        endpointsVisible={endpointsVisible}
                        baseUrl="https://api.footyscores.com"
                        onLoad={handleLoad}
                        onInspect={setInspectMatch}
                        onClearFilters={clearFilters}
                        isFiltered={isFiltered}
                    />
                </div>
            </div>

            {/* Inspect Modal */}
            {inspectMatch && (
                <InspectModal match={inspectMatch} onClose={() => setInspectMatch(null)}/>
            )}

            {/* Export toast */}
            {exported && (
                <div
                    className="fixed bottom-6 right-6 z-[200] bg-surface border border-[rgba(0,232,122,0.3)] rounded-lg px-[18px] py-3 text-[13px] font-medium shadow-[0_8px_24px_rgba(0,0,0,0.4)] anim-slide-up">
                    <span className="text-green font-bold">✓</span>
                    &nbsp;JSON exported — {filtered.length > 0 ? filtered.length : mockMatches.length} matches
                </div>
            )}
        </>
    );
}

function InspectModal({match, onClose}: { match: Match; onClose: () => void }) {
    const [copied, setCopied] = useState(false);
    const endpoint = generateEndpoint(match, 'https://api.footyscores.com');
    const kf = formatKickoff(match.kickoff);

    function handleCopy() {
        navigator.clipboard.writeText(endpoint).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    }

    const infoCell = 'bg-surface-2 border border-line rounded-[5px] p-[12px_14px]';
    const infoCellLabel = 'text-[10.5px] text-dim font-semibold uppercase tracking-[0.4px] mb-1';
    const infoCellVal = 'text-[13.5px] font-semibold';
    const sectionLabel = 'text-[11px] font-bold uppercase tracking-[0.7px] text-dim mb-2';

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-5 anim-fade-in"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-surface border border-line-hi rounded-xl w-[680px] max-w-full max-h-[85vh] flex flex-col anim-slide-up shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
                {/* Modal header */}
                <div
                    className="px-[22px] py-[18px] border-b border-line flex flex-wrap sm:flex-nowrap items-center gap-3">
                    <div className="flex gap-2 items-center w-full sm:w-auto">
                        <Badge variant={match.gender === 'men' ? 'blue' : 'purple'}>
                            {match.gender === 'men' ? 'Men' : 'Women'}
                        </Badge>
                        <Badge variant={match.stage === 'group' ? 'muted' : 'orange'}>
                            {stageLabel(match)}
                        </Badge>
                    </div>
                    <div className="text-[15px] font-bold flex-1 ml-1">
                        {match.home} vs {match.away}
                    </div>
                    <button
                        className="w-7 h-7 rounded-[6px] bg-surface-2 border border-line text-dim cursor-pointer text-base flex items-center justify-center transition-all hover:bg-red-subtle hover:text-red"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                {/* Modal body */}
                <div className="p-[22px] overflow-y-auto flex flex-col gap-5">
                    {/* Info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className={infoCell}>
                            <div className={infoCellLabel}>Kickoff</div>
                            <div className={infoCellVal}>{kf.date}</div>
                            <div className="text-[12px] text-dim">{kf.time} (Paris)</div>
                        </div>
                        <div className={infoCell}>
                            <div className={infoCellLabel}>Venue</div>
                            <div className={infoCellVal}>{match.venue}</div>
                            <div className="text-[12px] text-dim">{match.city}</div>
                        </div>
                        <div className={infoCell}>
                            <div className={infoCellLabel}>Home</div>
                            <div className={infoCellVal}>{match.home}</div>
                        </div>
                        <div className={infoCell}>
                            <div className={infoCellLabel}>Away</div>
                            <div className={infoCellVal}>{match.away}</div>
                        </div>
                    </div>

                    {/* Endpoint */}
                    <div>
                        <div className={sectionLabel}>Generated Endpoint</div>
                        <div
                            className="bg-surface-2 border border-line rounded-[5px] p-[12px_14px] font-mono text-[12px] text-green break-all leading-relaxed relative">
                            <span className="text-dim">https://api.footyscores.com</span>
                            <span className="text-green">/api/v1/matches/</span>
                            <span className="text-blue">olympics-football-{match.gender}</span>
                            <span className="text-dim">/2024/</span>
                            <span className="text-orange">
                {match.stage === 'group'
                    ? `group-${match.group!.toLowerCase()}-matchday-${match.matchday}`
                    : match.stage}
              </span>
                            <span className="text-dim">/</span>
                            <span className="text-content">
                {match.home.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                                -vs-
                                {match.away.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
              </span>
                            <button
                                className={`absolute top-[-20px] right-2 px-[9px] py-[3px] text-[11px] font-semibold rounded cursor-pointer transition-all border ${
                                    copied
                                        ? 'bg-green-subtle text-green border-[rgba(0,232,122,0.3)]'
                                        : 'bg-surface-3 text-dim border-line-hi hover:bg-green-subtle hover:text-green'
                                }`}
                                onClick={handleCopy}
                            >
                                {copied ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Match details */}
                    <div>
                        <div className={sectionLabel}>Match Details</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className={infoCell}>
                                <div className={infoCellLabel}>Competition</div>
                                <div className="text-[12px] font-semibold">Paris 2024 Olympics Football</div>
                                <div className="text-[12px] text-dim">
                                    {match.gender === 'men' ? 'Men (U23)' : 'Women'}
                                </div>
                            </div>
                            <div className={infoCell}>
                                <div className={infoCellLabel}>Stage</div>
                                <div className="text-[12px] font-semibold">{stageLabel(match)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
