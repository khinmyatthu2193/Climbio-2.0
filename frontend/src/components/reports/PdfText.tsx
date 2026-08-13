import { Font, Text, type TextProps } from '@react-pdf/renderer';
import myanmarRegular from '@fontsource/noto-sans-myanmar/files/noto-sans-myanmar-myanmar-400-normal.woff';
import myanmarBold from '@fontsource/noto-sans-myanmar/files/noto-sans-myanmar-myanmar-700-normal.woff';

const MYANMAR_FONT_FAMILY = 'NotoSansMyanmarEmbedded';
const MYANMAR_RUN = /([\u1000-\u109F\uA9E0-\uA9FF\uAA60-\uAA7F]+)/u;
const HAS_MYANMAR = /[\u1000-\u109F\uA9E0-\uA9FF\uAA60-\uAA7F]/u;

Font.register({
  family: MYANMAR_FONT_FAMILY,
  fonts: [
    { src: myanmarRegular, fontWeight: 400 },
    { src: myanmarBold, fontWeight: 700 },
  ],
});

export function PdfText({ value, style, bold = false, fixed = false, minPresenceAhead }: {
  value: string | number;
  style?: TextProps['style'];
  bold?: boolean;
  fixed?: boolean;
  minPresenceAhead?: number;
}) {
  const text = String(value).normalize('NFC');
  return (
    <Text style={style} fixed={fixed} minPresenceAhead={minPresenceAhead}>
      {text.split(MYANMAR_RUN).filter(Boolean).map((part, index) => (
        <Text
          key={`${index}-${part}`}
          style={{
            fontFamily: HAS_MYANMAR.test(part) ? MYANMAR_FONT_FAMILY : bold ? 'Helvetica-Bold' : 'Helvetica',
            fontWeight: bold ? 700 : 400,
          }}
        >
          {part}
        </Text>
      ))}
    </Text>
  );
}
