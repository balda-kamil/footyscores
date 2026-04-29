import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MatchesTable } from '@/components/MatchesTable';
import type { Match } from '@/types/match';

function makeMatch(overrides?: Partial<Match>): Match {
  return {
    id: 'test-1',
    gender: 'men',
    stage: 'group',
    group: 'A',
    matchday: 1,
    home: 'France',
    away: 'USA',
    kickoff: '2024-07-25T09:00:00Z',
    venue: 'Parc des Princes',
    city: 'Paris',
    ...overrides,
  };
}

const defaultProps = {
  matches: [],
  loadState: 'idle' as const,
  endpointsVisible: false,
  onLoad: jest.fn(),
  onSelect: jest.fn(),
  onInspect: jest.fn(),
  onClearFilters: jest.fn(),
  isFiltered: false,
};

afterEach(() => jest.clearAllMocks());

describe('MatchesTable — idle state', () => {
  it('shows the empty-state heading', () => {
    render(<MatchesTable {...defaultProps} />);
    expect(screen.getByText(/ready to load matches/i)).toBeInTheDocument();
  });

  it('renders a Load Matches button in idle state', () => {
    render(<MatchesTable {...defaultProps} />);
    expect(screen.getByRole('button', { name: /load matches/i })).toBeInTheDocument();
  });

  it('calls onLoad when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<MatchesTable {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /load matches/i }));
    expect(defaultProps.onLoad).toHaveBeenCalledTimes(1);
  });
});

describe('MatchesTable — loading state', () => {
  it('shows loading text', () => {
    render(<MatchesTable {...defaultProps} loadState="loading" />);
    expect(screen.getByText(/loading matches/i)).toBeInTheDocument();
  });

  it('does not render any rows during loading', () => {
    render(<MatchesTable {...defaultProps} loadState="loading" />);
    expect(screen.queryByRole('row')).not.toBeInTheDocument();
  });
});

describe('MatchesTable — loaded with matches', () => {
  const matches = [
    makeMatch({ id: 'm1', home: 'France', away: 'USA' }),
    makeMatch({ id: 'm2', home: 'Brazil', away: 'Spain' }),
  ];

  it('renders all match rows', () => {
    render(<MatchesTable {...defaultProps} loadState="loaded" matches={matches} />);
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
  });

  it('renders the table header', () => {
    render(<MatchesTable {...defaultProps} loadState="loaded" matches={matches} />);
    expect(screen.getByText(/stage/i)).toBeInTheDocument();
    expect(screen.getByText(/match/i)).toBeInTheDocument();
    expect(screen.getByText(/venue/i)).toBeInTheDocument();
  });

  it('calls onSelect when a row is clicked', async () => {
    const user = userEvent.setup();
    render(<MatchesTable {...defaultProps} loadState="loaded" matches={matches} />);
    const rows = screen.getAllByRole('row');
    // rows[0] is header, rows[1] is first match row
    await user.click(rows[1]);
    expect(defaultProps.onSelect).toHaveBeenCalledWith(matches[0]);
  });

  it('calls onInspect when inspect button is clicked', async () => {
    const user = userEvent.setup();
    render(<MatchesTable {...defaultProps} loadState="loaded" matches={matches} />);
    const inspectButtons = screen.getAllByTitle('Inspect');
    await user.click(inspectButtons[0]);
    expect(defaultProps.onInspect).toHaveBeenCalledWith(matches[0]);
  });

  it('shows endpoints when endpointsVisible=true', () => {
    render(
      <MatchesTable {...defaultProps} loadState="loaded" matches={[makeMatch()]} endpointsVisible={true} />
    );
    expect(screen.getByText(/france-vs-usa/i)).toBeInTheDocument();
  });

  it('shows "not generated" placeholder when endpointsVisible=false', () => {
    render(<MatchesTable {...defaultProps} loadState="loaded" matches={[makeMatch()]} />);
    expect(screen.getByText(/not generated/i)).toBeInTheDocument();
  });

  it('highlights the selected row', () => {
    render(
      <MatchesTable {...defaultProps} loadState="loaded" matches={matches} selectedId="m1" />
    );
    const rows = screen.getAllByRole('row');
    expect(rows[1].className).toContain('bg-blue-subtle');
  });
});

describe('MatchesTable — loaded with no matches (filtered)', () => {
  it('shows no-matches message when filtered yields nothing', () => {
    render(
      <MatchesTable {...defaultProps} loadState="loaded" matches={[]} isFiltered={true} />
    );
    expect(screen.getByText(/no matches found/i)).toBeInTheDocument();
  });

  it('shows a Clear Filters button', () => {
    render(
      <MatchesTable {...defaultProps} loadState="loaded" matches={[]} isFiltered={true} />
    );
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });

  it('calls onClearFilters when button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MatchesTable {...defaultProps} loadState="loaded" matches={[]} isFiltered={true} />
    );
    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(defaultProps.onClearFilters).toHaveBeenCalledTimes(1);
  });
});
