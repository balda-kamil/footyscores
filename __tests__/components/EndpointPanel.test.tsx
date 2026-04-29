import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EndpointPanel } from '@/components/EndpointPanel';
import type { Match } from '@/types/match';

const match: Match = {
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
};

const defaultProps = { match, onClose: jest.fn() };

let writeTextSpy: jest.Mock;

beforeEach(() => {
  writeTextSpy = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: writeTextSpy },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

function mockFetchSuccess(data: unknown = {}) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  } as Response);
}

function mockFetchFailure(status = 500, error = 'Server Error') {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({ error }),
  } as unknown as Response);
}

describe('EndpointPanel — rendering', () => {
  it('shows home and away team names in the panel', () => {
    const { container } = render(<EndpointPanel {...defaultProps} />);
    expect(container).toHaveTextContent('France');
    expect(container).toHaveTextContent('USA');
  });

  it('shows the generated endpoint path containing slugified teams', () => {
    const { container } = render(<EndpointPanel {...defaultProps} />);
    expect(container).toHaveTextContent('france-vs-usa');
  });

  it('shows the expected response JSON in the pre block', () => {
    const { container } = render(<EndpointPanel {...defaultProps} />);
    expect(container).toHaveTextContent('Paris 2024 Olympics Football');
  });

  it('renders the Run Comparison button initially', () => {
    render(<EndpointPanel {...defaultProps} />);
    expect(screen.getByRole('button', { name: /run comparison/i })).toBeInTheDocument();
  });

  it('calls onClose when the × button is clicked', async () => {
    const user = userEvent.setup();
    render(<EndpointPanel {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: '×' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the stage label badge', () => {
    const { container } = render(<EndpointPanel {...defaultProps} />);
    expect(container).toHaveTextContent('Group A');
  });
});

describe('EndpointPanel — copy endpoint', () => {
  it('renders a Copy button', () => {
    render(<EndpointPanel {...defaultProps} />);
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('calls navigator.clipboard.writeText with the endpoint when Copy is clicked', () => {
    render(<EndpointPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /copy/i }));
    expect(writeTextSpy).toHaveBeenCalledWith(
      expect.stringContaining('france-vs-usa')
    );
  });
});

describe('EndpointPanel — comparison: loading state', () => {
  it('shows loading indicator while fetching', async () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<EndpointPanel {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /run comparison/i }));
    expect(screen.getByText(/fetching from api/i)).toBeInTheDocument();
  });
});

describe('EndpointPanel — comparison: success', () => {
  const successData = {
    competition: { name: 'Paris 2024 Olympics Football', season: '2024', round: 'Group A · MD1' },
    venue: { name: 'Parc des Princes', city: 'Paris' },
    kickoff: '2024-07-25T09:00:00Z',
    teams: { home: 'France', away: 'USA' },
  };

  it('shows Re-run button after successful comparison', async () => {
    mockFetchSuccess(successData);
    const user = userEvent.setup();
    render(<EndpointPanel {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /run comparison/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /re-run/i })).toBeInTheDocument()
    );
  });

  it('shows match count summary when comparison completes', async () => {
    mockFetchSuccess(successData);
    const user = userEvent.setup();
    render(<EndpointPanel {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /run comparison/i }));
    await waitFor(() =>
      expect(screen.getByText(/fields match/i)).toBeInTheDocument()
    );
  });

  it('calls fetch a second time when Re-run is clicked', async () => {
    mockFetchSuccess(successData);
    const user = userEvent.setup();
    render(<EndpointPanel {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /run comparison/i }));
    await waitFor(() => screen.getByRole('button', { name: /re-run/i }));
    await user.click(screen.getByRole('button', { name: /re-run/i }));
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

describe('EndpointPanel — comparison: error', () => {
  it('shows error message when the API responds with an error', async () => {
    mockFetchFailure(404, 'Not Found');
    const user = userEvent.setup();
    render(<EndpointPanel {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /run comparison/i }));
    await waitFor(() =>
      expect(screen.getByText(/not found/i)).toBeInTheDocument()
    );
  });

  it('shows Retry button after failure', async () => {
    mockFetchFailure(500, 'Server Error');
    const user = userEvent.setup();
    render(<EndpointPanel {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /run comparison/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    );
  });

  it('retries when Retry button is clicked', async () => {
    mockFetchFailure(500, 'Server Error');
    const user = userEvent.setup();
    render(<EndpointPanel {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /run comparison/i }));
    await waitFor(() => screen.getByRole('button', { name: /retry/i }));
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('shows error for a network-level failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));
    const user = userEvent.setup();
    render(<EndpointPanel {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /run comparison/i }));
    await waitFor(() =>
      expect(screen.getByText(/network failure/i)).toBeInTheDocument()
    );
  });
});
