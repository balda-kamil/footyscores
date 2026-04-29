import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from '@/components/Toolbar';

const defaultProps = {
  loadState: 'idle' as const,
  endpointsVisible: false,
  exported: false,
  genderFilter: 'all',
  stageFilter: 'all',
  search: '',
  onLoad: jest.fn(),
  onGenerate: jest.fn(),
  onExport: jest.fn(),
  onGenderFilter: jest.fn(),
  onStageFilter: jest.fn(),
  onSearch: jest.fn(),
};

afterEach(() => jest.clearAllMocks());

describe('Toolbar — Load Matches button', () => {
  it('renders the load button in idle state', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /load matches/i })).toBeInTheDocument();
  });

  it('shows "Loading…" text while loading', () => {
    render(<Toolbar {...defaultProps} loadState="loading" />);
    expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument();
  });

  it('shows "✓ Matches Loaded" when loaded', () => {
    render(<Toolbar {...defaultProps} loadState="loaded" />);
    expect(screen.getByRole('button', { name: /matches loaded/i })).toBeInTheDocument();
  });

  it('is disabled while loading', () => {
    render(<Toolbar {...defaultProps} loadState="loading" />);
    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
  });

  it('is disabled once loaded', () => {
    render(<Toolbar {...defaultProps} loadState="loaded" />);
    expect(screen.getByRole('button', { name: /matches loaded/i })).toBeDisabled();
  });

  it('calls onLoad when clicked in idle state', async () => {
    const user = userEvent.setup();
    render(<Toolbar {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /load matches/i }));
    expect(defaultProps.onLoad).toHaveBeenCalledTimes(1);
  });
});

describe('Toolbar — Generate Endpoints button', () => {
  it('is disabled when not loaded', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /generate endpoints/i })).toBeDisabled();
  });

  it('is enabled when loaded', () => {
    render(<Toolbar {...defaultProps} loadState="loaded" />);
    expect(screen.getByRole('button', { name: /generate endpoints/i })).not.toBeDisabled();
  });

  it('shows "Hide Endpoints" when endpointsVisible=true', () => {
    render(<Toolbar {...defaultProps} loadState="loaded" endpointsVisible={true} />);
    expect(screen.getByRole('button', { name: /hide endpoints/i })).toBeInTheDocument();
  });

  it('calls onGenerate when clicked', async () => {
    const user = userEvent.setup();
    render(<Toolbar {...defaultProps} loadState="loaded" />);
    await user.click(screen.getByRole('button', { name: /generate endpoints/i }));
    expect(defaultProps.onGenerate).toHaveBeenCalledTimes(1);
  });
});

describe('Toolbar — Export JSON button', () => {
  it('is disabled when not loaded', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /export json/i })).toBeDisabled();
  });

  it('shows "✓ Exported" feedback', () => {
    render(<Toolbar {...defaultProps} loadState="loaded" exported={true} />);
    expect(screen.getByRole('button', { name: /exported/i })).toBeInTheDocument();
  });

  it('calls onExport when clicked', async () => {
    const user = userEvent.setup();
    render(<Toolbar {...defaultProps} loadState="loaded" />);
    await user.click(screen.getByRole('button', { name: /export json/i }));
    expect(defaultProps.onExport).toHaveBeenCalledTimes(1);
  });
});

describe('Toolbar — filters (only visible when loaded)', () => {
  it('does not show filters when idle', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /^all$/i })).not.toBeInTheDocument();
  });

  it('shows gender filter buttons when loaded', () => {
    render(<Toolbar {...defaultProps} loadState="loaded" />);
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Men' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Women' })).toBeInTheDocument();
  });

  it('calls onGenderFilter with correct value', async () => {
    const user = userEvent.setup();
    render(<Toolbar {...defaultProps} loadState="loaded" />);
    await user.click(screen.getByRole('button', { name: 'Men' }));
    expect(defaultProps.onGenderFilter).toHaveBeenCalledWith('men');
  });

  it('calls onSearch when typing in search input', async () => {
    const user = userEvent.setup();
    render(<Toolbar {...defaultProps} loadState="loaded" />);
    const input = screen.getByPlaceholderText(/search teams/i);
    await user.type(input, 'fr');
    expect(defaultProps.onSearch).toHaveBeenCalled();
  });

  it('shows current search value', () => {
    render(<Toolbar {...defaultProps} loadState="loaded" search="france" />);
    expect(screen.getByPlaceholderText(/search teams/i)).toHaveValue('france');
  });
});
