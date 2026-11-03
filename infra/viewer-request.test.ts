import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The CloudFront Function lives inline in the template (CloudFormation has
// no file include for it), so the test reads it from there: one source.
type Request = { uri: string; method: string };
type Response = { statusCode: number };
type Handler = (event: { request: Request }) => Request | Response;

function loadHandler(): Handler {
  const template = readFileSync(
    new URL('./template.yml', import.meta.url),
    'utf8',
  );
  const match = template.match(/FunctionCode: \|\n((?: {8}.*\n|\n)+)/);
  if (!match) throw new Error('FunctionCode block not found in template');
  const code = match[1].replace(/^ {8}/gm, '');
  return new Function(`${code}\nreturn handler;`)() as Handler;
}

const handler = loadHandler();
const viewerRequest = (uri: string) =>
  handler({ request: { uri, method: 'GET' } });

describe('viewer request on the S3 behaviour', () => {
  it('serves the SPA index for an unknown app route', () => {
    expect(viewerRequest('/review/abc')).toMatchObject({ uri: '/index.html' });
  });

  it('serves the SPA index for the site root', () => {
    expect(viewerRequest('/')).toMatchObject({ uri: '/index.html' });
  });

  it('leaves requests for built files alone', () => {
    expect(viewerRequest('/assets/index-abc123.js')).toMatchObject({
      uri: '/assets/index-abc123.js',
    });
    expect(viewerRequest('/favicon.svg')).toMatchObject({
      uri: '/favicon.svg',
    });
  });

  it('returns 404 for Spotify paths other than /embed/playlist/', () => {
    expect(viewerRequest('/embed/track/4uLU6hMCjMI75M1A2tKUQC')).toMatchObject({
      statusCode: 404,
    });
    expect(viewerRequest('/embed/album/x.json')).toMatchObject({
      statusCode: 404,
    });
    expect(viewerRequest('/embed')).toMatchObject({ statusCode: 404 });
  });
});
