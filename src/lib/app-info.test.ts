import { describe, expect, it } from 'vitest';
import { appName, appTagline } from './app-info';

// Placeholder test proving the runner and the hook wiring.
// Real tests start with the Transfer core (ticket #5).
describe('app info', () => {
  it('names the app and mentions both services', () => {
    expect(appName).toBe('Playlist Transfer');
    expect(appTagline).toMatch(/Spotify/);
    expect(appTagline).toMatch(/Apple Music/);
  });
});
