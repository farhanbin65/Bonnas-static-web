export function socialImage(value) {
  try {
    if (typeof value !== 'string' || !value.trim()) throw new Error('Missing image');
    const url = new URL(value, 'https://www.bonnas.co.uk');
    if (url.protocol !== 'https:') throw new Error('Invalid image protocol');
    return url.href;
  } catch {
    return 'https://www.bonnas.co.uk/logo.PNG';
  }
}
