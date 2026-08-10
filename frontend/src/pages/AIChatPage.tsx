import { useMemo, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { Bot, LoaderCircle, MessageSquareText, Plus, Send, Sparkles, Trash2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/button';
import { IconLabel } from '@/components/ui/IconLabel';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { aiService } from '@/services/aiService';
import { useLanguage } from '@/hooks/useLanguage';
import type { AIChatHistoryResponse } from '@/types/ai';

const copy = {
  en: {
    eyebrow: 'Business assistant', title: 'Climbio Chat', description: 'Ask focused questions about your sales, products, inventory, and customers.', newChat: 'New chat', history: 'Chat history', clear: 'Clear all', emptyHistory: 'No previous chats yet', loadError: 'Chat history could not be loaded.', welcome: 'How can I help your business today?', welcomeHelp: 'I use your current Climbio records to provide practical answers. Each question is saved in your history.', placeholder: 'Ask a question about your business…', send: 'Send', thinking: 'Reviewing your business data…', responseError: 'Climbio Chat could not answer. Please try again.', deleteTitle: 'Delete this chat?', deleteHelp: 'This question and answer will be permanently removed.', clearTitle: 'Clear all chat history?', clearHelp: 'All saved questions and answers will be permanently removed.', cancel: 'Cancel', confirmDelete: 'Delete', assistant: 'Climbio AI', suggestions: ['Which products should I restock first?', 'How can I improve my profit?', 'What are my slow-moving products?', 'How are my recent sales performing?'], promptHelp: 'Enter to send · Shift + Enter for a new line', deleteFailed: 'The chat could not be deleted.',
  },
  my: {
    eyebrow: 'လုပ်ငန်းအကူအညီ', title: 'Climbio Chat', description: 'အရောင်း၊ ကုန်ပစ္စည်း၊ စတော့နှင့် ဝယ်ယူသူများအကြောင်း တိကျသောမေးခွန်းများ မေးပါ။', newChat: 'Chat အသစ်', history: 'Chat မှတ်တမ်း', clear: 'အားလုံးဖျက်ရန်', emptyHistory: 'ယခင် Chat မရှိသေးပါ', loadError: 'Chat မှတ်တမ်းကို ဖွင့်၍မရပါ။', welcome: 'ယနေ့ သင့်လုပ်ငန်းအတွက် ဘာကူညီပေးရမလဲ?', welcomeHelp: 'လက်ရှိ Climbio မှတ်တမ်းများကို အသုံးပြု၍ လက်တွေ့ကျသောအဖြေများ ပေးပါမည်။ မေးခွန်းတိုင်းကို မှတ်တမ်းတွင် သိမ်းထားပါသည်။', placeholder: 'သင့်လုပ်ငန်းအကြောင်း မေးပါ…', send: 'ပို့ရန်', thinking: 'သင့်လုပ်ငန်းဒေတာကို စစ်ဆေးနေသည်…', responseError: 'Climbio Chat က အဖြေမပေးနိုင်ပါ။ ထပ်မံကြိုးစားပါ။', deleteTitle: 'ဤ Chat ကို ဖျက်မည်လား?', deleteHelp: 'ဤမေးခွန်းနှင့် အဖြေကို အပြီးအပိုင် ဖျက်ပါမည်။', clearTitle: 'Chat မှတ်တမ်းအားလုံး ဖျက်မည်လား?', clearHelp: 'သိမ်းထားသော မေးခွန်းနှင့် အဖြေအားလုံးကို အပြီးအပိုင် ဖျက်ပါမည်။', cancel: 'မလုပ်တော့ပါ', confirmDelete: 'ဖျက်ရန်', assistant: 'Climbio AI', suggestions: ['ဘယ်ပစ္စည်းတွေကို အရင်ဆုံး စတော့ပြန်ဖြည့်သင့်လဲ?', 'အမြတ်တိုးအောင် ဘယ်လိုလုပ်ရမလဲ?', 'ရောင်းနှေးနေသောပစ္စည်းတွေက ဘာတွေလဲ?', 'လတ်တလောအရောင်းအခြေအနေ ဘယ်လိုရှိလဲ?'], promptHelp: 'ပို့ရန် Enter · စာကြောင်းအသစ်အတွက် Shift + Enter', deleteFailed: 'Chat ကို ဖျက်၍မရပါ။',
  },
};

function ChatMarkdown({ content }: { content: string }) {
  return <div className="text-sm leading-7 text-slate-700 dark:text-slate-300"><ReactMarkdown components={{ h2: ({ children }) => <h3 className="mb-2 mt-5 font-bold text-slate-950 first:mt-0 dark:text-white">{children}</h3>, h3: ({ children }) => <h4 className="mb-2 mt-4 font-bold text-slate-950 dark:text-white">{children}</h4>, p: ({ children }) => <p className="my-2">{children}</p>, ul: ({ children }) => <ul className="my-2 space-y-1.5 pl-5 marker:text-violet-500">{children}</ul>, ol: ({ children }) => <ol className="my-2 list-decimal space-y-1.5 pl-5 marker:text-violet-500">{children}</ol>, li: ({ children }) => <li className="pl-1">{children}</li>, strong: ({ children }) => <strong className="font-bold text-slate-950 dark:text-white">{children}</strong> }}>{content}</ReactMarkdown></div>;
}

type DeleteTarget = { type: 'message'; id: string } | { type: 'all' };

export function AIChatPage() {
  const { language } = useLanguage();
  const text = copy[language];
  const queryClient = useQueryClient();
  const history = useQuery({ queryKey: ['ai-chat-history'], queryFn: aiService.chatHistory });
  const [question, setQuestion] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const selectedMessage = useMemo(() => history.data?.messages.find((message) => message.id === selectedId), [history.data?.messages, selectedId]);

  const chat = useMutation({
    mutationFn: (value: string) => aiService.chat({ question: value, language }),
    onSuccess: ({ message }) => {
      queryClient.setQueryData<AIChatHistoryResponse>(['ai-chat-history'], (current) => ({ messages: [...(current?.messages ?? []), message] }));
      setSelectedId(message.id);
      setQuestion('');
    },
  });
  const deleteChat = useMutation({
    mutationFn: (target: DeleteTarget) => target.type === 'all' ? aiService.clearChatHistory() : aiService.deleteChatMessage(target.id),
    onSuccess: (_, target) => {
      if (target.type === 'all') {
        queryClient.setQueryData<AIChatHistoryResponse>(['ai-chat-history'], { messages: [] });
        setSelectedId(null);
      } else {
        queryClient.setQueryData<AIChatHistoryResponse>(['ai-chat-history'], (current) => ({ messages: (current?.messages ?? []).filter((message) => message.id !== target.id) }));
        if (selectedId === target.id) setSelectedId(null);
      }
      setDeleteTarget(null);
    },
  });

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const value = question.trim();
    if (value.length >= 3 && !chat.isPending) chat.mutate(value);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };
  const startNewChat = () => {
    setSelectedId(null);
    setQuestion('');
  };

  return (
    <main className="page-container">
      <div className="mx-auto max-w-7xl">
        <PageHeader eyebrow={text.eyebrow} title={text.title} description={text.description} />
        <div className="mt-6 grid gap-5 lg:grid-cols-[290px_minmax(0,1fr)]">
          <Card className="flex max-h-[720px] flex-col p-3 sm:p-4">
            <Button className="w-full" onClick={startNewChat}><IconLabel icon={Plus}>{text.newChat}</IconLabel></Button>
            <div className="mt-4 flex items-center justify-between px-1"><h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{text.history}</h2>{Boolean(history.data?.messages.length) && <button type="button" className="text-xs font-semibold text-red-600 hover:text-red-700" onClick={() => setDeleteTarget({ type: 'all' })}>{text.clear}</button>}</div>
            <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto">
              {history.isLoading && <div className="flex justify-center py-10"><LoaderCircle className="size-5 animate-spin text-violet-500" /></div>}
              {history.isError && <p className="p-3 text-sm text-red-600">{text.loadError}</p>}
              {!history.isLoading && !history.data?.messages.length && <div className="py-10 text-center text-sm text-slate-500"><MessageSquareText className="mx-auto mb-2 size-6 text-slate-300" />{text.emptyHistory}</div>}
              {[...(history.data?.messages ?? [])].reverse().map((message) => (
                <div key={message.id} className={`group flex items-center gap-1 rounded-xl ${selectedId === message.id ? 'bg-violet-100 dark:bg-violet-500/15' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <button type="button" className="min-w-0 flex-1 px-3 py-2.5 text-left" onClick={() => setSelectedId(message.id)}><p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{message.question}</p><p className="mt-0.5 text-[11px] text-slate-400">{new Date(message.createdAt).toLocaleString(language === 'my' ? 'my-MM' : 'en-US')}</p></button>
                  <button type="button" className="mr-1 rounded-lg p-2 text-slate-400 opacity-100 hover:bg-red-50 hover:text-red-600 lg:opacity-0 lg:group-hover:opacity-100 dark:hover:bg-red-500/10" aria-label={text.confirmDelete} onClick={() => setDeleteTarget({ type: 'message', id: message.id })}><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex min-h-[620px] flex-col overflow-hidden p-0">
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
              {!selectedMessage && !chat.isPending && (
                <div className="mx-auto grid min-h-[390px] max-w-2xl place-items-center text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20"><Bot className="size-8" /></span><h2 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">{text.welcome}</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{text.welcomeHelp}</p><div className="mt-6 grid gap-2 sm:grid-cols-2">{text.suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => setQuestion(suggestion)} className="rounded-xl border border-slate-200 p-3 text-left text-sm font-medium text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">{suggestion}</button>)}</div></div></div>
              )}
              {selectedMessage && <div className="mx-auto max-w-3xl space-y-5"><div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-violet-600 px-4 py-3 text-sm font-medium leading-6 text-white">{selectedMessage.question}</div><div className="rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/60"><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-300"><Sparkles className="size-3.5" /> {text.assistant}</div><ChatMarkdown content={selectedMessage.answer} /></div></div>}
              {chat.isPending && <div className="mx-auto max-w-3xl space-y-5"><div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-violet-600 px-4 py-3 text-sm font-medium text-white">{question.trim()}</div><div className="flex w-fit items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800"><LoaderCircle className="size-4 animate-spin text-violet-500" /> {text.thinking}</div></div>}
              {chat.isError && <Alert className="mx-auto mt-5 max-w-3xl" tone="error">{text.responseError}</Alert>}
            </div>
            <form className="border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5" onSubmit={submit}><div className="mx-auto max-w-3xl"><div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:ring-violet-500/10"><textarea className="max-h-36 min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400" rows={1} maxLength={500} value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={handleKeyDown} placeholder={text.placeholder} disabled={chat.isPending} /><Button type="submit" className="size-11 shrink-0 px-0" aria-label={text.send} disabled={chat.isPending || question.trim().length < 3}><Send className="size-4" /></Button></div><p className="mt-2 text-center text-[11px] text-slate-400">{text.promptHelp}</p></div></form>
          </Card>
        </div>
      </div>

      {deleteTarget && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900" role="alertdialog" aria-modal="true"><span className="grid size-11 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300"><Trash2 className="size-5" /></span><h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">{deleteTarget.type === 'all' ? text.clearTitle : text.deleteTitle}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{deleteTarget.type === 'all' ? text.clearHelp : text.deleteHelp}</p>{deleteChat.isError && <p className="mt-3 text-sm text-red-600">{text.deleteFailed}</p>}<div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteChat.isPending}>{text.cancel}</Button><Button variant="danger" onClick={() => deleteChat.mutate(deleteTarget)} disabled={deleteChat.isPending}><IconLabel icon={deleteChat.isPending ? LoaderCircle : Trash2}>{text.confirmDelete}</IconLabel></Button></div></div></div>}
    </main>
  );
}
