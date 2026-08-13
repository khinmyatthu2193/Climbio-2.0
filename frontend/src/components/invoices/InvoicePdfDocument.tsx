import { Document, Font, Image, Page, StyleSheet, Text, View, type TextProps } from '@react-pdf/renderer';
import myanmarRegular from '@fontsource/noto-sans-myanmar/files/noto-sans-myanmar-myanmar-400-normal.woff';
import myanmarBold from '@fontsource/noto-sans-myanmar/files/noto-sans-myanmar-myanmar-700-normal.woff';
import type { User } from '@/types/auth';
import type { Invoice } from '@/types/invoice';
import { getPdfWatermarkPosition, watermarkSizes } from '@/utils/invoiceWatermark';
import type { WatermarkPosition, WatermarkSize } from '@/types/auth';

Font.register({ family: 'NotoSansMyanmar', fonts: [{ src: myanmarRegular, fontWeight: 400 }, { src: myanmarBold, fontWeight: 700 }] });
Font.registerEmojiSource({ format: 'png', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/' });

function MixedText({ value, style, bold = false, fixed = false }: { value: string; style?: TextProps['style']; bold?: boolean; fixed?: boolean }) {
  return <Text style={style} fixed={fixed}>{value.split(/([\u1000-\u109F\uAA60-\uAA7F]+)/u).map((part, index) => /[\u1000-\u109F\uAA60-\uAA7F]/u.test(part) ? <Text key={index} style={{ fontFamily: 'NotoSansMyanmar', fontWeight: bold ? 700 : 400 }}>{part}</Text> : part)}</Text>;
}

const styles = StyleSheet.create({
  page: { padding: 42, paddingBottom: 70, color: '#16372b', fontFamily: 'Helvetica', fontSize: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 46, height: 46, borderRadius: 8, objectFit: 'cover' },
  logoFallback: { width: 46, height: 46, borderRadius: 8, backgroundColor: '#237a57', alignItems: 'center', justifyContent: 'center' },
  logoLetter: { color: '#ffffff', fontSize: 24, fontFamily: 'Helvetica-Bold' },
  shopName: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  muted: { color: '#64748b', marginBottom: 3 },
  invoiceTitle: { fontSize: 24, fontFamily: 'Helvetica-Bold', textAlign: 'right', color: '#237a57' },
  invoiceMeta: { marginTop: 6, textAlign: 'right', color: '#64748b' },
  customerBox: { backgroundColor: '#f0fdf4', borderRadius: 8, padding: 14, marginBottom: 24 },
  sectionLabel: { color: '#237a57', fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 7, textTransform: 'uppercase' },
  customerName: { fontFamily: 'Helvetica-Bold', fontSize: 12, marginBottom: 4 },
  table: { borderWidth: 1, borderColor: '#dbe7e1', borderRadius: 6, overflow: 'hidden' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#dbe7e1', minHeight: 34, alignItems: 'center' },
  lastRow: { borderBottomWidth: 0 },
  tableHeader: { backgroundColor: '#ecfdf5', fontFamily: 'Helvetica-Bold', color: '#237a57' },
  productCell: { width: '46%', padding: 9 },
  quantityCell: { width: '14%', padding: 9, textAlign: 'right' },
  priceCell: { width: '20%', padding: 9, textAlign: 'right' },
  totalCell: { width: '20%', padding: 9, textAlign: 'right' },
  totals: { width: 250, alignSelf: 'flex-end', marginTop: 20 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  grandTotal: { borderTopWidth: 1, borderTopColor: '#b7cfc4', marginTop: 4, paddingTop: 10, fontSize: 13, fontFamily: 'Helvetica-Bold' },
  footer: { position: 'absolute', bottom: 30, left: 42, right: 42, borderTopWidth: 1, borderTopColor: '#dbe7e1', paddingTop: 10, textAlign: 'center', color: '#64748b', fontSize: 9 },
  watermarkImage: { position: 'absolute', objectFit: 'contain' },
  watermarkEmoji: { position: 'absolute', textAlign: 'center' },
});

export function InvoicePdfDocument({ invoice, shop }: { invoice: Invoice; shop: User }) {
  const currency = shop.setting?.currency ?? 'MMK';
  const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'MMK' ? 0 : 2,
  });
  const setting = shop.setting;
  const themeColor = setting?.invoiceThemeColor || '#7c3aed';
  const watermarkOpacity = Math.min(30, Math.max(0, setting?.watermarkOpacity ?? 10)) / 100;
  const watermarkImage = setting?.watermarkType === 'LOGO' ? shop.shopLogo : setting?.watermarkType === 'IMAGE' ? setting.watermarkImageUrl : null;
  const watermarkSize = (setting?.watermarkSize ?? 'MEDIUM') as WatermarkSize;
  const watermarkPosition = (setting?.watermarkPosition ?? 'CENTER') as WatermarkPosition;
  const size = watermarkSizes[watermarkSize];
  const imagePosition = getPdfWatermarkPosition(watermarkPosition, size.pdf);
  const emojiPosition = getPdfWatermarkPosition(watermarkPosition, size.pdf);
  const rotation = Math.min(45, Math.max(-45, setting?.watermarkRotation ?? 0));

  return (
    <Document title={invoice.invoiceNumber} author={shop.shopName} subject="Invoice">
      <Page size="A4" style={styles.page}>
        {watermarkImage && <Image fixed style={[styles.watermarkImage, imagePosition, { width: size.pdf, height: size.pdf, opacity: watermarkOpacity, transform: `rotate(${rotation}deg)` }]} src={watermarkImage} />}
        {setting?.watermarkType === 'EMOJI' && setting.watermarkEmoji && <Text fixed style={[styles.watermarkEmoji, emojiPosition, { width: size.pdf, height: size.pdf, fontSize: size.emojiPdf, opacity: watermarkOpacity, transform: `rotate(${rotation}deg)` }]}>{setting.watermarkEmoji}</Text>}
        <View style={styles.header}>
          <View style={styles.brand}>
            {shop.shopLogo ? (
              <Image style={styles.logo} src={shop.shopLogo} />
            ) : (
              <View style={styles.logoFallback}><Text style={styles.logoLetter}>C</Text></View>
            )}
            <View>
              <MixedText style={styles.shopName} value={shop.shopName || 'Climbio'} bold />
              <Text style={styles.muted}>Powered by Climbio</Text>
              {shop.phone && <Text style={styles.muted}>{shop.phone}</Text>}
            </View>
          </View>
          <View>
            <Text style={[styles.invoiceTitle, { color: themeColor }]}>INVOICE</Text>
            <Text style={styles.invoiceMeta}>{invoice.invoiceNumber}</Text>
            <Text style={styles.invoiceMeta}>{new Date(invoice.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={[styles.customerBox, { borderLeftWidth: 3, borderLeftColor: themeColor }]}>
          <Text style={[styles.sectionLabel, { color: themeColor }]}>Bill to</Text>
          <MixedText style={styles.customerName} value={invoice.customerName} bold />
          <MixedText style={styles.muted} value={invoice.customerPhone || 'No phone number'} />
        </View>

        <View style={[styles.table, { borderColor: themeColor }]}>
          <View style={[styles.row, styles.tableHeader, { color: themeColor, borderBottomColor: themeColor }]}>
            <Text style={styles.productCell}>Product</Text>
            <Text style={styles.quantityCell}>Qty</Text>
            <Text style={styles.priceCell}>Price</Text>
            <Text style={styles.totalCell}>Total</Text>
          </View>
          {invoice.items?.map((item, index) => (
            <View key={item.id} style={[styles.row, { borderBottomColor: themeColor }, index === (invoice.items?.length ?? 0) - 1 ? styles.lastRow : {}]}>
              <MixedText style={styles.productCell} value={item.productName} />
              <Text style={styles.quantityCell}>{item.quantity}</Text>
              <Text style={styles.priceCell}>{money.format(Number(item.price))}</Text>
              <Text style={styles.totalCell}>{money.format(Number(item.price) * item.quantity)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalLine}><Text>Subtotal</Text><Text>{money.format(Number(invoice.subtotal))}</Text></View>
          <View style={styles.totalLine}><Text>Discount</Text><Text>- {money.format(Number(invoice.discount))}</Text></View>
          <View style={[styles.totalLine, styles.grandTotal, { borderTopColor: themeColor, color: themeColor }]}><Text>Total</Text><Text>{money.format(Number(invoice.total))}</Text></View>
        </View>

        <MixedText style={[styles.footer, { borderTopColor: themeColor }]} fixed value={shop.setting?.invoiceFooter || `Thank you for choosing ${shop.shopName || 'Climbio'}.`} />
      </Page>
    </Document>
  );
}
