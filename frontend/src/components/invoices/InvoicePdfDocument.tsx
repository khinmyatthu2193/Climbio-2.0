import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { User } from '@/types/auth';
import type { Invoice } from '@/types/invoice';

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
});

export function InvoicePdfDocument({ invoice, shop }: { invoice: Invoice; shop: User }) {
  const currency = shop.setting?.currency ?? 'MMK';
  const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'MMK' ? 0 : 2,
  });

  return (
    <Document title={invoice.invoiceNumber} author={shop.shopName} subject="Invoice">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            {shop.shopLogo ? (
              <Image style={styles.logo} src={shop.shopLogo} />
            ) : (
              <View style={styles.logoFallback}><Text style={styles.logoLetter}>C</Text></View>
            )}
            <View>
              <Text style={styles.shopName}>{shop.shopName || 'Climbio'}</Text>
              <Text style={styles.muted}>Powered by Climbio</Text>
              {shop.phone && <Text style={styles.muted}>{shop.phone}</Text>}
            </View>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceMeta}>{invoice.invoiceNumber}</Text>
            <Text style={styles.invoiceMeta}>{new Date(invoice.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.customerBox}>
          <Text style={styles.sectionLabel}>Bill to</Text>
          <Text style={styles.customerName}>{invoice.customerName}</Text>
          <Text style={styles.muted}>{invoice.customerPhone || 'No phone number'}</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={styles.productCell}>Product</Text>
            <Text style={styles.quantityCell}>Qty</Text>
            <Text style={styles.priceCell}>Price</Text>
            <Text style={styles.totalCell}>Total</Text>
          </View>
          {invoice.items?.map((item, index) => (
            <View key={item.id} style={[styles.row, index === (invoice.items?.length ?? 0) - 1 ? styles.lastRow : {}]}>
              <Text style={styles.productCell}>{item.productName}</Text>
              <Text style={styles.quantityCell}>{item.quantity}</Text>
              <Text style={styles.priceCell}>{money.format(Number(item.price))}</Text>
              <Text style={styles.totalCell}>{money.format(Number(item.price) * item.quantity)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalLine}><Text>Subtotal</Text><Text>{money.format(Number(invoice.subtotal))}</Text></View>
          <View style={styles.totalLine}><Text>Discount</Text><Text>- {money.format(Number(invoice.discount))}</Text></View>
          <View style={[styles.totalLine, styles.grandTotal]}><Text>Total</Text><Text>{money.format(Number(invoice.total))}</Text></View>
        </View>

        <Text style={styles.footer} fixed>
          {shop.setting?.invoiceFooter || `Thank you for choosing ${shop.shopName || 'Climbio'}.`}
        </Text>
      </Page>
    </Document>
  );
}
