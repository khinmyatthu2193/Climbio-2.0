const fs = require('node:fs');
const path = require('node:path');
const fontkit = require('fontkit');

const fontPath = path.resolve(__dirname, '../node_modules/@fontsource/noto-sans-myanmar/files/noto-sans-myanmar-myanmar-400-normal.woff');
const font = fontkit.create(fs.readFileSync(fontPath));
const samples = [
  'မြန်မာ',
  'အစီရင်ခံစာ',
  'ရောင်းအား',
  'ဒီးယားလေဒီ',
  'မောင်အောင်',
  'အင်္ကျီ',
  'ဖက်ရှင်အဝတ်အစား',
];

let substitutedRuns = 0;
let positionedRuns = 0;
for (const sample of samples) {
  const directGlyphs = font.glyphsForString(sample).map((glyph) => glyph.id);
  const shaped = font.layout(sample);
  const shapedGlyphs = shaped.glyphs.map((glyph) => glyph.id);
  if (shapedGlyphs.some((glyph) => glyph === 0)) throw new Error(`Missing Myanmar glyph in: ${sample}`);
  if (JSON.stringify(directGlyphs) !== JSON.stringify(shapedGlyphs)) substitutedRuns += 1;
  if (shaped.positions.some((position) => position.xOffset !== 0 || position.yOffset !== 0 || position.xAdvance === 0)) positionedRuns += 1;
}

if (substitutedRuns < 3) throw new Error(`Expected substitutions in complex Myanmar runs; found ${substitutedRuns}.`);
if (positionedRuns < 3) throw new Error(`Expected mark positioning in complex Myanmar runs; found ${positionedRuns}.`);
console.log(`Verified ${samples.length} Myanmar strings: ${substitutedRuns} use glyph substitutions and ${positionedRuns} use mark positioning.`);
