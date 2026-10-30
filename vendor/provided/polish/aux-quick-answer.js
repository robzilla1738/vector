// Local answers for the command bar: arithmetic and unit conversions, worked out here with no eval
// and no network. scripts/release/transforms.mjs copies this file to dist/assets/.

const number = value => Number(value.replaceAll(',', ''));
const NUMBER = /^(?:\d{1,3}(?:,\d{3})+|\d+)?(?:\.\d+)?/;

/** Tokens of an arithmetic expression, or null for anything else. */
function tokenize(text) {
  const tokens = [];
  for (let at = 0; at < text.length;) {
    const rest = text.slice(at), space = /^\s+/.exec(rest)?.[0];
    if (space) { at += space.length; continue; }
    const digits = NUMBER.exec(rest)[0];
    if (digits) { tokens.push({number: number(digits)}); at += digits.length; continue; }
    const word = /^(?:sqrt|pi|of)\b/i.exec(rest)?.[0].toLowerCase();
    if (word) { tokens.push({word}); at += word.length; continue; }
    const op = {'×': '*', '÷': '/', '−': '-'}[rest[0]] ?? rest[0];
    if (!'+-*/^%()'.includes(op)) return null;
    tokens.push({op});
    at++;
  }
  return tokens;
}

/** Recursive descent over the tokens: + and - (a percent on the right is a share of the left, as
 * on a calculator), then * / and "of", then powers, then unary minus, percent and parentheses. */
function evaluate(tokens) {
  let at = 0;
  const peek = op => tokens[at]?.op === op;
  const take = op => peek(op) && ++at;
  const primary = () => {
    const token = tokens[at];
    if (take('(')) { const value = sum(); if (!take(')')) throw Error('unbalanced'); return value; }
    if (token?.word === 'pi') { at++; return Math.PI; }
    if (token?.word === 'sqrt') { at++; if (!take('(')) throw Error('sqrt needs parentheses'); const value = sum(); if (!take(')')) throw Error('unbalanced'); return Math.sqrt(value); }
    if (token?.number === undefined) throw Error('expected a number');
    at++;
    return token.number;
  };
  const percent = () => {
    const value = primary();
    return take('%') ? {share: value / 100} : value;
  };
  const plain = value => typeof value === 'object' ? value.share : value;
  const unary = () => take('-') ? -plain(unary()) : take('+') ? plain(unary()) : percent();
  const power = () => {
    const base = unary();
    return take('^') ? plain(base) ** plain(power()) : base;
  };
  const product = () => {
    let value = power();
    for (;;) {
      if (take('*') || tokens[at]?.word === 'of' && ++at) value = plain(value) * plain(power());
      else if (take('/')) value = plain(value) / plain(power());
      else return value;
    }
  };
  function sum() {
    let value = plain(product());
    for (;;) {
      const sign = take('+') ? 1 : take('-') ? -1 : 0;
      if (!sign) return value;
      const right = product();
      value += sign * (typeof right === 'object' ? value * right.share : right);
    }
  }
  const value = sum();
  if (at !== tokens.length) throw Error('trailing input');
  return value;
}

/** A value for reading (grouped) and for pasting (plain): twelve significant digits. */
function format(value) {
  const rounded = Number(value.toPrecision(12));
  return {text: String(rounded), title: rounded.toLocaleString('en-US', {maximumFractionDigits: 6})};
}

// Not arithmetic, whatever the digits suggest: dates, phone numbers, version-like runs.
const DASHED_DIGITS = /^\d+(?:-\d+)+$/;

function arithmetic(query) {
  const text = query.trim();
  if (DASHED_DIGITS.test(text)) return null;
  const tokens = tokenize(text);
  if (!tokens?.some(token => token.op && token.op !== '(' && token.op !== ')' || token.word)) return null;
  try {
    const value = evaluate(tokens);
    return Number.isFinite(value) ? {...format(value), subtitle: text} : null;
  } catch { return null; }
}

/** factor: how many base units one of it is. aliases: every spelling, lower case, singular. */
const unit = (label, factor, ...aliases) => ({label, factor, aliases: [label.toLowerCase(), ...aliases]});
const KINDS = [
  [unit('mm', 0.001, 'millimeter', 'millimetre'), unit('cm', 0.01, 'centimeter', 'centimetre'), unit('m', 1, 'meter', 'metre'),
    unit('km', 1000, 'kilometer', 'kilometre'), unit('in', 0.0254, 'inch', 'inches'), unit('ft', 0.3048, 'foot', 'feet'),
    unit('yd', 0.9144, 'yard'), unit('mi', 1609.344, 'mile')],
  [unit('mg', 0.001, 'milligram'), unit('g', 1, 'gram'), unit('kg', 1000, 'kilogram', 'kilo'), unit('t', 1e6, 'tonne'),
    unit('oz', 28.349523125, 'ounce'), unit('lb', 453.59237, 'pound')],
  [unit('ml', 0.001, 'milliliter', 'millilitre'), unit('l', 1, 'liter', 'litre'), unit('tsp', 0.00492892159375, 'teaspoon'),
    unit('tbsp', 0.01478676478125, 'tablespoon'), unit('fl oz', 0.0295735295625, 'floz', 'fluid ounce'),
    unit('cup', 0.2365882365), unit('pt', 0.473176473, 'pint'), unit('qt', 0.946352946, 'quart'), unit('gal', 3.785411784, 'gallon')],
  [unit('ms', 0.001, 'millisecond'), unit('s', 1, 'sec', 'second'), unit('min', 60, 'minute'), unit('h', 3600, 'hr', 'hour'),
    unit('day', 86400, 'd'), unit('week', 604800, 'wk'), unit('year', 31557600, 'yr')],
  [unit('B', 1, 'byte'), unit('KB', 1e3, 'kilobyte'), unit('MB', 1e6, 'megabyte'), unit('GB', 1e9, 'gigabyte'), unit('TB', 1e12, 'terabyte'),
    unit('KiB', 1024), unit('MiB', 1024 ** 2), unit('GiB', 1024 ** 3), unit('TiB', 1024 ** 4)],
  [unit('m/s', 1), unit('km/h', 1 / 3.6, 'kph', 'kmh'), unit('mph', 0.44704), unit('kn', 0.514444444, 'knot')],
];
const find = name => {
  const key = name.toLowerCase().replace(/\s+/g, ' ').replace(/^°/, ''), singular = key.endsWith('s') ? key.slice(0, -1) : key;
  for (const kind of KINDS) for (const entry of kind) if (entry.aliases.includes(key) || entry.aliases.includes(singular)) return {kind, entry};
  return null;
};
const TEMPERATURES = {c: 'celsius', f: 'fahrenheit', k: 'kelvin'};
const temperature = name => {
  const key = name.toLowerCase().replace(/^°/, '');
  return Object.keys(TEMPERATURES).find(short => key === short || key === TEMPERATURES[short]);
};
const toCelsius = {c: value => value, f: value => (value - 32) * 5 / 9, k: value => value - 273.15};
const fromCelsius = {c: value => value, f: value => value * 9 / 5 + 32, k: value => value + 273.15};
const temperatureLabel = {c: '°C', f: '°F', k: 'K'};

const CONVERSION = /^(-?(?:\d{1,3}(?:,\d{3})+|\d+)?(?:\.\d+)?)\s*(°?[a-z/]+(?: [a-z]+)?)\s+(?:to|in|as)\s+(°?[a-z/]+(?: [a-z]+)?)$/i;

function conversion(query) {
  const [, amount, from, to] = CONVERSION.exec(query.trim()) ?? [];
  if (!amount || !/\d/.test(amount)) return null;
  const value = number(amount), source = temperature(from), target = temperature(to);
  if (source && target) {
    const {text, title} = format(fromCelsius[target](toCelsius[source](value)));
    return {text, title: `${title} ${temperatureLabel[target]}`, subtitle: `${amount} ${temperatureLabel[source]}`};
  }
  const a = find(from), b = find(to);
  if (!a || !b || a.kind !== b.kind) return null;
  const {text, title} = format(value * a.entry.factor / b.entry.factor);
  return {text, title: `${title} ${b.entry.label}`, subtitle: `${amount} ${a.entry.label}`};
}

/** {title, subtitle, text} for a sum or a conversion; null for anything else. `text` is what Copy gives. */
export const auxQuickAnswer = query => conversion(query) ?? arithmetic(query);

/** The command bar's sections with the answer on top. */
export function auxAnswerSections(query, sections) {
  const answer = auxQuickAnswer(query);
  return answer ? [{id: 'aux-answer', title: 'Answer', items: [{id: 'aux-answer', kind: 'aux-answer', actionLabel: 'Copy', ...answer}]}, ...sections] : sections;
}
