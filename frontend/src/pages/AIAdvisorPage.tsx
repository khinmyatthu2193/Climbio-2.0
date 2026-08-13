import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { BarChart3, Bot, Boxes, CircleDollarSign, Lightbulb, LoaderCircle, RefreshCw, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { IconLabel } from '@/components/ui/IconLabel';
import { aiService } from '@/services/aiService';
import { useLanguage } from '@/hooks/useLanguage';
import { AIAnalysisWaiting } from '@/components/ai/AIAnalysisWaiting';
import { useAuthStore } from '@/store/authStore';

function InsightContent({ content }: { content: string }) {
  return (
    <div className="text-sm leading-7 text-slate-700 dark:text-slate-300">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h2 className="mb-2 mt-6 text-lg font-bold text-slate-950 first:mt-0 dark:text-white">{children}</h2>,
          h2: ({ children }) => <h3 className="mb-2 mt-6 text-base font-bold text-slate-950 first:mt-0 dark:text-white">{children}</h3>,
          h3: ({ children }) => <h4 className="mb-2 mt-5 font-bold text-slate-950 dark:text-white">{children}</h4>,
          p: ({ children }) => <p className="my-2">{children}</p>,
          ul: ({ children }) => <ul className="my-2 space-y-1.5 pl-5 marker:text-violet-500">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-violet-500">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-slate-950 dark:text-white">{children}</strong>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function AIAdvisorPage() {
  const { language } = useLanguage();
  const userId = useAuthStore((state) => state.user?.id);
  const analysis = useQuery({
    queryKey: ['ai-business-analysis', userId, language],
    queryFn: () => aiService.analyze(language),
    enabled: false,
    retry: false,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1_000,
  });
  const data = analysis.data;
  const analysisRunning = analysis.isFetching;
  const startAnalysis = () => {
    sessionStorage.setItem('climbio-ai-analysis-started-at', String(Date.now()));
    void analysis.refetch().finally(() => sessionStorage.removeItem('climbio-ai-analysis-started-at'));
  };
  const currency = data?.overview.shop.currency ?? 'MMK';
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency });

  return (
    <main className="ai-advisor-page page-container">
      <PageHeader
        eyebrow="Business intelligence"
        title="Climbio AI Advisor"
        description="Get practical insights from your sales, products, inventory, and customers."
        actions={
          <Button className="ai-advisor-action" onClick={startAnalysis} disabled={analysisRunning}>
            {analysisRunning ? <LoaderCircle className="size-4 animate-spin" /> : data ? <RefreshCw className="size-4" /> : <Sparkles className="size-4" />}
            {analysisRunning ? 'Analyzing business…' : data ? 'Analyze again' : 'Analyze My Business'}
          </Button>
        }
      />

      {analysis.isError && <Alert className="mt-6" tone="error">AI analysis could not be completed. Check the backend configuration or try again shortly.</Alert>}

      {!data && !analysisRunning && (
        <Card className="mt-6 grid min-h-72 place-items-center border-dashed text-center">
          <div className="max-w-md">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"><Bot className="size-7" /></span>
            <h2 className="mt-4 text-xl font-bold">Your business analysis is ready when you are</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Climbio will securely analyze your shop records and reply in your selected language. Your API key stays on the server.</p>
            <Button className="mt-5" onClick={startAnalysis}><IconLabel icon={Sparkles}>Analyze My Business</IconLabel></Button>
          </div>
        </Card>
      )}

      {analysisRunning && <AIAnalysisWaiting key={language} language={language} />}

      {data && !analysisRunning && (
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
