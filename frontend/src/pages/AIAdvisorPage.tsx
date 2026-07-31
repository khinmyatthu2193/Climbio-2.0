import { useMutation } from '@tanstack/react-query';
import { BarChart3, Bot, Boxes, CircleDollarSign, Lightbulb, LoaderCircle, RefreshCw, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { aiService } from '@/services/aiService';

function InsightContent({ content }: { content: string }) {
  return (
    <div className="space-y-2 text-sm leading-7 text-slate-700 dark:text-slate-300">
      {content.split('\n').map((line, index) => {
        const text = line.trim();
        if (!text) return <div className="h-2" key={index} />;
        if (/^(#{1,3}\s*)?\d[.)]\s/.test(text)) return <h3 className="pt-3 text-base font-bold text-slate-950 dark:text-white" key={index}>{text.replace(/^#{1,3}\s*/, '')}</h3>;
        if (/^#{1,3}\s+/.test(text)) return <h3 className="pt-3 text-base font-bold text-slate-950 dark:text-white" key={index}>{text.replace(/^#{1,3}\s+/, '')}</h3>;
        if (/^[-*•]\s+/.test(text)) return <p className="flex gap-2" key={index}><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-violet-500" /><span>{text.replace(/^[-*•]\s+/, '')}</span></p>;
        return <p key={index}>{text}</p>;
      })}
    </div>
  );
}

export function AIAdvisorPage() {
  const analysis = useMutation({ mutationFn: aiService.analyze });
  const data = analysis.data;
  const currency = data?.overview.shop.currency ?? 'MMK';
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency });

  return (
    <main className="page-container">
      <PageHeader
        eyebrow="Business intelligence"
        title="Climbio AI Advisor"
        description="Get practical insights from your sales, products, inventory, and customers."
        actions={
          <Button onClick={() => analysis.mutate()} disabled={analysis.isPending}>
            {analysis.isPending ? <LoaderCircle className="size-4 animate-spin" /> : data ? <RefreshCw className="size-4" /> : <Sparkles className="size-4" />}
            {analysis.isPending ? 'Analyzing business…' : data ? 'Analyze again' : 'Analyze My Business'}
          </Button>
        }
      />

      {analysis.isError && <Alert className="mt-6" tone="error">AI analysis could not be completed. Check the backend configuration or try again shortly.</Alert>}

      {!data && !analysis.isPending && (
        <Card className="mt-6 grid min-h-72 place-items-center border-dashed text-center">
          <div className="max-w-md">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"><Bot className="size-7" /></span>
            <h2 className="mt-4 text-xl font-bold">Your business analysis is ready when you are</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Climbio will securely analyze your shop records and prepare a practical Myanmar-language report. Your API key stays on the server.</p>
            <Button className="mt-5" onClick={() => analysis.mutate()}><Sparkles className="size-4" /> Analyze My Business</Button>
          </div>
        </Card>
      )}

      {analysis.isPending && (
        <Card className="mt-6 grid min-h-72 place-items-center text-center">
          <div><LoaderCircle className="mx-auto size-9 animate-spin text-violet-500" /><h2 className="mt-4 font-bold">Reviewing your business data</h2><p className="mt-2 text-sm text-slate-500">Analyzing sales, products, stock, and customer patterns…</p></div>
        </Card>
      )}

      {data && (
        <div className="mt-6 space-y-6">
          <Card>
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"><BarChart3 className="size-5" /></span><div><h2 className="text-lg font-bold">Business Overview</h2><p className="text-sm text-slate-500">Based on current Climbio records</p></div></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Paid revenue', value: money.format(data.overview.sales.revenue), icon: CircleDollarSign },
                { label: 'Paid sales', value: data.overview.sales.totalSales.toLocaleString(), icon: TrendingUp },
                { label: 'Products / stock', value: `${data.overview.inventory.totalProducts} / ${data.overview.inventory.totalStock}`, icon: Boxes },
                { label: 'Customers / repeat', value: `${data.overview.customers.customerCount} / ${data.overview.customers.repeatCustomers}`, icon: Users },
              ].map(({ label, value, icon: Icon }) => <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60" key={label}><Icon className="size-4 text-violet-500" /><p className="mt-3 text-xs text-slate-500">{label}</p><p className="mt-1 font-bold">{value}</p></div>)}
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
            <Card>
              <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"><Sparkles className="size-5" /></span><div><h2 className="text-lg font-bold">AI Insights</h2><p className="text-sm text-slate-500">Generated {new Date(data.insight.createdAt).toLocaleString()}</p></div></div>
              <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-700"><InsightContent content={data.insight.content} /></div>
            </Card>

            <Card className="h-fit">
              <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"><Lightbulb className="size-5" /></span><div><h2 className="text-lg font-bold">Recommendations</h2><p className="text-sm text-slate-500">Items needing attention</p></div></div>
              <div className="mt-5 space-y-5">
                <div><h3 className="text-sm font-bold">Low or out of stock</h3><div className="mt-2 space-y-2">{[...data.overview.inventory.outOfStockProducts, ...data.overview.inventory.lowStockProducts].slice(0, 5).map((product) => <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60" key={product.name}><span className="truncate">{product.name}</span><strong className={product.stock === 0 ? 'text-red-500' : 'text-amber-500'}>{product.stock}</strong></div>)}{data.overview.inventory.lowStockProducts.length + data.overview.inventory.outOfStockProducts.length === 0 && <p className="text-sm text-slate-500">Stock levels look healthy.</p>}</div></div>
                <div><h3 className="text-sm font-bold">Top products</h3><div className="mt-2 space-y-2">{data.overview.topProducts.map((product) => <div className="flex justify-between text-sm" key={product.name}><span className="truncate text-slate-600 dark:text-slate-300">{product.name}</span><strong>{product.unitsSold} sold</strong></div>)}{data.overview.topProducts.length === 0 && <p className="text-sm text-slate-500">Not enough paid sales data yet.</p>}</div></div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}
