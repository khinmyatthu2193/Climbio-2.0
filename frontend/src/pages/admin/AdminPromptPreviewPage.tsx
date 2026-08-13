import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Eye, Search, X } from 'lucide-react';
import { promptGalleryService } from '@/services/promptGalleryService';
import type { AIPrompt } from '@/types/promptGallery';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/common/LoadingState';
import { Alert } from '@/components/ui/Alert';
import { useLanguage } from '@/hooks/useLanguage';

const copy = {
  en: {
    eyebrow: 'Shop owner preview',
    title: 'Prompt Library Preview',
    description: 'This read-only preview shows published prompts as shop owners will see them.',
    back: 'Back to management',
    search: 'Search prompts',
    categories: 'All categories',
    tools: 'All AI tools',
    loading: 'Loading preview',
    error: 'Could not load the prompt preview.',
    view: 'View Prompt',
    empty: 'No published prompts match these filters.',
    content: 'Prompt content',
    close: 'Close',
  },
  my: {
    eyebrow: 'ဆိုင်ရှင်မြင်ကွင်း အစမ်းကြည့်ရန်',
    title: 'အကြံပြုစာစုများ အစမ်းကြည့်ရန်',
    description: 'ဆိုင်ရှင်များ မြင်တွေ့ရမည့် ထုတ်ဝေပြီးသော အကြံပြုစာစုများကို ပြင်ဆင်၍မရဘဲ အစမ်းကြည့်နိုင်ပါသည်။',
    back: 'စီမံခန့်ခွဲမှုသို့ ပြန်သွားမည်',
    search: 'အကြံပြုစာစု ရှာမည်',
    categories: 'အမျိုးအစားအားလုံး',
    tools: 'AI ကိရိယာအားလုံး',
    loading: 'အစမ်းမြင်ကွင်း ဖွင့်နေသည်',
    error: 'အကြံပြုစာစု အစမ်းမြင်ကွင်းကို ဖွင့်၍မရပါ။',
    view: 'အကြံပြုစာစုကို ကြည့်မည်',
    empty: 'ဤစစ်ထုတ်မှုနှင့် ကိုက်ညီသော ထုတ်ဝေပြီး အကြံပြုစာစု မရှိပါ။',
    content: 'အကြံပြုစာစု အကြောင်းအရာ',
    close: 'ပိတ်မည်',
  },
} as const;

export function AdminPromptPreviewPage() {
  const { language } = useLanguage();
  const text = copy[language];
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [aiTool, setAiTool] = useState('');
  const [selected, setSelected] = useState<AIPrompt | null>(null);
  const query = useQuery({ queryKey: ['admin-prompts-preview'], queryFn: promptGalleryService.adminList });
  const published = useMemo(() => query.data?.filter((prompt) => prompt.status === 'PUBLISHED') ?? [], [query.data]);
  const categories = useMemo(() => [...new Map(published.map((prompt) => [prompt.category.id, prompt.category])).values()], [published]);
  const tools = useMemo(() => [...new Set(published.flatMap((prompt) => prompt.aiTools))].sort(), [published]);
  const normalizedSearch = search.trim().toLowerCase();
  const prompts = published.filter((prompt) =>
    (!categoryId || prompt.categoryId === categoryId)
    && (!aiTool || prompt.aiTools.includes(aiTool))
    && (!normalizedSearch || [prompt.title, prompt.content, prompt.category.name]
      .some((value) => value.toLowerCase().includes(normalizedSearch))),
  );

  return (
    <main className="page-container">
      <PageHeader
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
        actions={(
          <a href="/admin/prompts" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900">
            <ArrowLeft className="size-4" />{text.back}
          </a>
        )}
      />
      <Card className="mt-6">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
          <label className="relative">
            <Search className="absolute left-3 top-3.5 size-4 text-slate-400" />
            <input className="control pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={text.search} />
          </label>
          <select className="control" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">{text.categories}</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.icon} {category.name}</option>)}
          </select>
          <select className="control" value={aiTool} onChange={(event) => setAiTool(event.target.value)}>
            <option value="">{text.tools}</option>
            {tools.map((tool) => <option key={tool}>{tool}</option>)}
          </select>
        </div>
      </Card>
      {query.isLoading ? <LoadingState label={text.loading} /> : query.isError ? (
        <Alert className="mt-4" tone="error">{text.error}</Alert>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="flex flex-col">
              <div className="flex justify-between gap-3">
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{prompt.category.icon} {prompt.category.name}</span>
                <span className="text-right text-xs text-slate-500">{prompt.aiTools.join(' + ')}</span>
              </div>
              {prompt.exampleImageUrl && <div className="mt-4 flex h-52 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-950"><img src={prompt.exampleImageUrl} alt="" className="max-h-full max-w-full object-contain" /></div>}
              <h2 className="mt-4 flex-1 text-lg font-bold">{prompt.title}</h2>
              <Button className="mt-5" variant="outline" onClick={() => setSelected(prompt)}><Eye className="size-4" />{text.view}</Button>
            </Card>
          ))}
          {prompts.length === 0 && <Card className="text-center text-slate-500 md:col-span-2 xl:col-span-3">{text.empty}</Card>}
        </div>
      )}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex justify-between gap-4">
              <div><p className="text-sm font-semibold text-violet-600">{selected.category.icon} {selected.category.name} · {selected.aiTools.join(' + ')}</p><h2 className="mt-1 text-2xl font-bold">{selected.title}</h2></div>
              <button onClick={() => setSelected(null)} aria-label={text.close}><X className="size-5" /></button>
            </div>
            {selected.exampleImageUrl && <div className="mt-5 flex max-h-[60vh] justify-center rounded-xl bg-slate-100 dark:bg-slate-950"><img src={selected.exampleImageUrl} alt="" className="max-h-[60vh] max-w-full object-contain" /></div>}
            <h3 className="mt-6 text-sm font-bold uppercase text-slate-500">{text.content}</h3>
            <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-100 p-4 font-sans text-sm leading-6 dark:bg-slate-950">{selected.content}</pre>
          </div>
        </div>
      )}
    </main>
  );
}
