import { test } from 'node:test';
import assert from 'node:assert/strict';

 test('pixel consent, navigation, private pages and WhatsApp events', async () => {
  const values = new Map();
  const scripts = [];
  globalThis.window = {
    localStorage: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) },
    location: { hostname: 'www.bonnas.co.uk', pathname: '/' },
  };
  globalThis.document = {
    createElement: () => ({}),
    head: { appendChild: (element) => scripts.push(element) },
    cookie: '',
  };
  try {
    const pixel = await import('../src/lib/metaPixel.js');
    pixel.trackPage('/');
    assert.equal(scripts.length, 0);
    pixel.setConsent('rejected');
    pixel.trackPage('/menu');
    assert.equal(scripts.length, 0);
    pixel.setConsent('accepted');
    pixel.trackPage('/records');
    pixel.trackPage('/invoice');
    assert.equal(scripts.length, 0);
    pixel.trackPage('/');
    pixel.trackPage('/'); // React StrictMode replay.
    pixel.trackPage('/menu');
    assert.equal(scripts.length, 1);
    const calls = window.fbq.queue;
    const events = () => calls.filter(([command]) => command === 'track');
    assert.deepEqual(events().map((call) => call[1]), ['PageView', 'PageView']);
    assert.ok(calls.some((call) => call[0] === 'init' && call[1] === '1641796190684961'));
    const click = (href) => ({ target: { closest: () => ({ href }) } });
    pixel.trackWhatsAppClick(click('https://example.com/'));
    pixel.trackWhatsAppClick(click('https://wa.me/447912795556?text=PRIVATE_ORDER'));
    assert.deepEqual(events().at(-1), ['track', 'Contact', { content_name: 'WhatsApp', content_category: 'Enquiry' }]);
    assert.ok(!JSON.stringify(calls).includes('PRIVATE_ORDER'));
    const before = events().length;
    window.location.pathname = '/invoice';
    pixel.trackPage('/invoice');
    pixel.trackWhatsAppClick(click('https://wa.me/447912795556'));
    assert.equal(events().length, before);
    window.location.pathname = '/';
    pixel.setConsent('rejected');
    pixel.trackPage('/');
    pixel.trackWhatsAppClick(click('https://wa.me/447912795556'));
    assert.equal(events().length, before);
    assert.equal(pixel.readConsent(), 'rejected');
    assert.deepEqual(calls.at(-1), ['consent', 'revoke']);
    pixel.setConsent('accepted');
    pixel.trackPage('/');
    assert.equal(scripts.length, 1);
    assert.equal(events().length, before + 1);
    window.localStorage.getItem = () => { throw new Error('blocked'); };
    window.localStorage.setItem = () => { throw new Error('blocked'); };
    assert.equal(pixel.readConsent(), null);
    assert.doesNotThrow(() => pixel.setConsent('rejected'));
  } finally {
    delete globalThis.window;
    delete globalThis.document;
  }
});
