import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const emojiCategories = {
  'General / Premium': ['❤️', '⭐', '✨', '💎', '🎁', '🎀', '🌟', '🔥', '🏆', '👑', '💫', '🤍'],
  'Fashion / Clothing': ['👗', '👚', '👕', '👖', '👜', '👠', '👟', '🧥', '🧢', '💍', '💄', '🕶️', '🧵', '✂️'],
  'Beauty / Salon': ['🌸', '🌺', '💅', '💄', '🪞', '🧴', '🧼', '🧖', '✨', '💆', '🌷'],
  'Food / Restaurant / Cafe': ['🍔', '🍕', '🍜', '🍱', '🍰', '🧁', '🍩', '☕', '🥤', '🍵', '🍽️', '👨‍🍳', '🥢', '🔥'],
  'Gift / Decoration': ['🎁', '🎀', '🧸', '💐', '🌹', '🎉', '🎈', '💝', '🪅', '⭐'],
  'Electronics / Technology': ['📱', '💻', '🖥️', '⌨️', '🎧', '📷', '📡', '🔋', '⚡', '💡'],
  'Grocery / Market': ['🛒', '🛍️', '🥦', '🍎', '🥤', '📦', '🏪', '🏬', '🌾'],
  'Home / Furniture': ['🏠', '🛋️', '🪑', '🛏️', '🖼️', '🔑', '🌿', '🕯️'],
  'Sports / Fitness': ['⚽', '🏀', '🏋️', '🚴', '🏆', '🥇', '💪', '🔥'],
  'Travel / Service': ['✈️', '🚗', '🚕', '🏨', '📍', '🌍', '🧳'],
} as const;

export function EmojiWatermarkPicker({ value, onChange }: { value: string; onChange: (emoji: string) => void }) {
  const [search, setSearch] = useState('');
  const visible = useMemo(() => Object.entries(emojiCategories).filter(([category, emojis]) => !search.trim() || category.toLowerCase().includes(search.toLowerCase()) || emojis.includes(search.trim() as never)), [search]);
  return <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
    <label className="relative block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search emoji categories" /></label>
    <div className="mt-4 max-h-72 space-y-4 overflow-y-auto pr-1">{visible.map(([category, emojis]) => <section key={category}><h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{category}</h4><div className="flex flex-wrap gap-2">{emojis.map((emoji, index) => <button key={`${emoji}-${index}`} type="button" className={`grid size-11 place-items-center rounded-xl border text-xl transition hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 ${value === emoji ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200 dark:bg-violet-500/15 dark:ring-violet-500/30' : 'border-slate-200 dark:border-slate-700'}`} aria-label={`Use ${emoji} as watermark`} aria-pressed={value === emoji} onClick={() => onChange(emoji)}>{emoji}</button>)}</div></section>)}</div>
  </div>;
}
