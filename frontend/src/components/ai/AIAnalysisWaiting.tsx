import { useEffect, useState } from 'react';
import { Brain, CheckCircle2, Clock3, PartyPopper, Sparkles } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import type { Language } from '@/hooks/useLanguage';

const quiz = {
  en: [
    { question: 'Which products should you review first?', choices: ['Low-stock products', 'Every product equally', 'Only new products'], answer: 0, note: 'Low-stock products can cause missed sales if they are not replenished.' },
    { question: 'Which invoices count toward Climbio paid revenue?', choices: ['Draft invoices', 'Sent invoices', 'Paid invoices'], answer: 2, note: 'Revenue metrics use invoices confirmed as Paid.' },
    { question: 'What appears in the public catalog?', choices: ['Every saved product', 'Active and publicly visible products', 'Out-of-stock products only'], answer: 1, note: 'Only active products enabled for public visibility appear to customers.' },
  ],
  my: [
    { question: 'မည်သည့်ကုန်ပစ္စည်းများကို အရင်ဆုံး စစ်ဆေးသင့်သလဲ?', choices: ['စတော့နည်းသောပစ္စည်းများ', 'ပစ္စည်းအားလုံးကို တူညီစွာ', 'အသစ်ထည့်ထားသောပစ္စည်းများသာ'], answer: 0, note: 'စတော့နည်းသောပစ္စည်းများကို အချိန်မီမဖြည့်ပါက အရောင်းလွတ်သွားနိုင်ပါသည်။' },
    { question: 'Climbio ဝင်ငွေတွင် မည်သည့်ဘောက်ချာများကို ထည့်တွက်သလဲ?', choices: ['မူကြမ်းဘောက်ချာ', 'ပို့ပြီးဘောက်ချာ', 'ပေးချေပြီးဘောက်ချာ'], answer: 2, note: 'ဝင်ငွေကိန်းဂဏန်းများသည် Paid အဖြစ် အတည်ပြုထားသောဘောက်ချာများကို သုံးပါသည်။' },
    { question: 'အများမြင်ကုန်ပစ္စည်းစာရင်းတွင် မည်သည့်ပစ္စည်းများ ပေါ်သလဲ?', choices: ['သိမ်းထားသမျှပစ္စည်းအားလုံး', 'အသုံးပြုနေပြီး အများမြင်ခွင့်ဖွင့်ထားသောပစ္စည်းများ', 'စတော့ကုန်ပစ္စည်းများသာ'], answer: 1, note: 'အသုံးပြုနေပြီး Public visibility ဖွင့်ထားသောပစ္စည်းများသာ ဝယ်ယူသူများမြင်နိုင်ပါသည်။' },
  ],
};

const copy = {
  en: { title: 'Your analysis is still running', estimate: 'Free AI providers can take about 1–3 minutes.', leave: 'You can keep using Climbio or open another page. The analysis will continue in the background.', elapsed: 'Time elapsed', quiz: 'Business quick quiz', quizHelp: 'Test your Climbio knowledge while you wait.', correct: 'Correct!', incorrect: 'Good try!', next: 'Next question', finish: 'See score', score: 'Quiz complete', replay: 'Play again' },
  my: { title: 'သင့်လုပ်ငန်းကို သုံးသပ်နေဆဲဖြစ်သည်', estimate: 'အခမဲ့ AI ဝန်ဆောင်မှုသည် ၁ မိနစ်မှ ၃ မိနစ်ခန့် ကြာနိုင်ပါသည်။', leave: 'Climbio ၏ အခြားစာမျက်နှာများကို ဆက်လက်အသုံးပြုနိုင်ပါသည်။ သုံးသပ်မှုကို နောက်ခံတွင် ဆက်လက်လုပ်ဆောင်နေပါမည်။', elapsed: 'ကြာမြင့်ချိန်', quiz: 'လုပ်ငန်းဗဟုသုတ အမြန်မေးခွန်း', quizHelp: 'စောင့်နေစဉ် Climbio ဗဟုသုတကို စမ်းသပ်ကြည့်ပါ။', correct: 'မှန်ပါတယ်!', incorrect: 'ကြိုးစားမှုကောင်းပါတယ်!', next: 'နောက်မေးခွန်း', finish: 'ရမှတ်ကြည့်ရန်', score: 'မေးခွန်းများ ဖြေပြီးပါပြီ', replay: 'ပြန်ကစားရန်' },
};

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export function AIAnalysisWaiting({ language }: { language: Language }) {
  const text = copy[language];
  const questions = quiz[language];
  const [elapsed, setElapsed] = useState(() => {
    const startedAt = Number(sessionStorage.getItem('climbio-ai-analysis-started-at'));
    return Number.isFinite(startedAt) && startedAt > 0 ? Math.max(0, Math.floor((Date.now() - startedAt) / 1_000)) : 0;
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const current = questions[questionIndex];

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const selectAnswer = (choice: number) => {
    if (selected !== null) return;
    setSelected(choice);
    if (choice === current.answer) setScore((value) => value + 1);
  };

  const advance = () => {
    if (questionIndex === questions.length - 1) {
      setComplete(true);
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelected(null);
  };

  const restart = () => {
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setComplete(false);
  };

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <Card className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white dark:border-violet-500/30">
        <div className="absolute -right-16 -top-16 size-52 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <span className="grid size-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/20"><Sparkles className="size-7 animate-pulse" /></span>
          <h2 className="mt-5 text-xl font-bold">{text.title}</h2>
          <p className="mt-2 text-sm leading-6 text-violet-100">{text.estimate}</p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-200" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-white"><Clock3 className="size-4" /> {text.elapsed}: {formatElapsed(elapsed)}</div>
          <p className="mt-6 rounded-xl bg-white/10 p-4 text-sm leading-6 text-violet-50 ring-1 ring-inset ring-white/15">{text.leave}</p>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"><Brain className="size-5" /></span><div><h2 className="font-bold">{text.quiz}</h2><p className="text-sm text-slate-500">{text.quizHelp}</p></div></div>
        {!complete && current ? (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400"><span>{questionIndex + 1} / {questions.length}</span><span>{score} pts</span></div>
            <h3 className="mt-3 font-bold leading-7 text-slate-950 dark:text-white">{current.question}</h3>
            <div className="mt-4 grid gap-2">
              {current.choices.map((choice, index) => {
                const answered = selected !== null;
                const correct = index === current.answer;
                const chosen = index === selected;
                return <button key={choice} type="button" onClick={() => selectAnswer(index)} disabled={answered} className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${answered && correct ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200' : answered && chosen ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50 dark:border-slate-700 dark:hover:bg-slate-800'}`}>{choice}</button>;
              })}
            </div>
            {selected !== null && <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60"><p className="flex items-center gap-2 font-bold"><CheckCircle2 className={`size-4 ${selected === current.answer ? 'text-emerald-500' : 'text-amber-500'}`} />{selected === current.answer ? text.correct : text.incorrect}</p><p className="mt-1 leading-6 text-slate-600 dark:text-slate-300">{current.note}</p><Button className="mt-3" size="sm" onClick={advance}>{questionIndex === questions.length - 1 ? text.finish : text.next}</Button></div>}
          </div>
        ) : (
          <div className="mt-8 text-center"><PartyPopper className="mx-auto size-10 text-fuchsia-500" /><h3 className="mt-3 text-lg font-bold">{text.score}</h3><p className="mt-2 text-3xl font-extrabold text-violet-600">{score} / {questions.length}</p><Button className="mt-4" variant="outline" onClick={restart}>{text.replay}</Button></div>
        )}
      </Card>
    </div>
  );
}
