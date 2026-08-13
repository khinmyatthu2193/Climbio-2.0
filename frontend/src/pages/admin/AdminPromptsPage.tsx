import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Edit3, Plus, Tags, Trash2, X } from 'lucide-react';
import { promptGalleryService } from '@/services/promptGalleryService';
import type { AIPrompt, PromptInput } from '@/types/promptGallery';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/common/LoadingState';

const toolOptions = ['ChatGPT', 'Gemini', 'Claude', 'Image Generation AI', 'Midjourney', 'Other'];
const empty: PromptInput = { title: '', categoryId: '', content: '', aiTools: [], exampleImageUrl: null, status: 'DRAFT' };

export function AdminPromptsPage() {
  const client = useQueryClient();
  const [editing, setEditing] = useState<AIPrompt | null | undefined>();
  const [form, setForm] = useState<PromptInput>(empty);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [message, setMessage] = useState('');
  const prompts = useQuery({ queryKey: ['admin-prompts'], queryFn: promptGalleryService.adminList });
  const categories = useQuery({ queryKey: ['admin-prompt-categories'], queryFn: promptGalleryService.adminCategories });

  useEffect(() => {
    setImageFile(null);
    if (editing === null) setForm(empty);
    else if (editing) setForm({ title: editing.title, categoryId: editing.categoryId, content: editing.content, aiTools: editing.aiTools, exampleImageUrl: editing.exampleImageUrl, status: editing.status });
  }, [editing]);

  const refresh = async () => Promise.all([client.invalidateQueries({ queryKey: ['admin-prompts'] }), client.invalidateQueries({ queryKey: ['admin-prompt-categories'] })]);
  const save = useMutation({
    mutationFn: async () => {
      const exampleImageUrl = imageFile ? await promptGalleryService.uploadImage(imageFile) : form.exampleImageUrl;
      const input = { ...form, exampleImageUrl };
      return editing ? promptGalleryService.update(editing.id, input) : promptGalleryService.create(input);
    },
    onSuccess: async () => { setEditing(undefined); setMessage('Prompt saved successfully'); await refresh(); },
  });
  const remove = useMutation({ mutationFn: promptGalleryService.remove, onSuccess: refresh });
  const addCategory = useMutation({ mutationFn: () => promptGalleryService.createCategory({ name: categoryName, icon: categoryIcon || undefined, description: categoryDescription || undefined }), onSuccess: async () => { setCategoryName(''); setCategoryIcon(''); setCategoryDescription(''); await refresh(); } });
  const submit = (event: FormEvent) => { event.preventDefault(); save.mutate(); };
  const toggleTool = (tool: string) => setForm((current) => ({ ...current, aiTools: current.aiTools.includes(tool) ? current.aiTools.filter((item) => item !== tool) : [...current.aiTools, tool] }));

  return <main className="page-container">
    <PageHeader eyebrow="Administration" title="AI Prompt Gallery" description="Create and publish ready-made marketing prompts for shop owners." actions={<><Button variant="outline" onClick={() => setCategoryOpen(true)}><Tags className="size-4" />Categories</Button><Button onClick={() => setEditing(null)}><Plus className="size-4" />New prompt</Button></>} />
    {message && <Alert className="mt-4" tone="success">{message}</Alert>}
    {prompts.isLoading ? <LoadingState label="Loading prompts" /> : prompts.isError ? <Alert className="mt-4" tone="error">Could not load prompts.</Alert> : <Card className="mt-6 overflow-x-auto p-0"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr><th className="px-5 py-4">Prompt</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">AI tools</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Updated</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y dark:divide-slate-800">{prompts.data?.map((prompt) => <tr key={prompt.id}><td className="px-5 py-4 font-semibold">{prompt.title}</td><td className="px-5 py-4">{prompt.category.icon} {prompt.category.name}</td><td className="px-5 py-4">{prompt.aiTools.join(', ')}</td><td className="px-5 py-4"><span className={prompt.status === 'PUBLISHED' ? 'text-emerald-600' : 'text-amber-600'}>{prompt.status === 'PUBLISHED' ? 'Published' : 'Draft'}</span></td><td className="px-5 py-4 text-sm">{new Date(prompt.updatedAt).toLocaleDateString()}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => setEditing(prompt)}><Edit3 className="size-4" />Edit</Button><Button size="sm" variant="ghost" onClick={() => { if (window.confirm(`Delete “${prompt.title}”?`)) remove.mutate(prompt.id); }}><Trash2 className="size-4 text-red-500" />Delete</Button></div></td></tr>)}{!prompts.data?.length && <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No prompts yet. Create the first one.</td></tr>}</tbody></table></Card>}

    {editing !== undefined && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><form onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">{editing ? 'Edit prompt' : 'Create prompt'}</h2><button type="button" onClick={() => setEditing(undefined)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close"><X className="size-5" /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">
      <Field label="Title"><input required maxLength={160} className="control w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
      <Field label="Category"><select required className="control w-full" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Choose category</option>{categories.data?.map((category) => <option key={category.id} value={category.id}>{category.icon} {category.name}</option>)}</select></Field>
      <Field label="Recommended AI tools" wide><div className="grid gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700 sm:grid-cols-3">{toolOptions.map((tool) => <label key={tool} className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-violet-600" checked={form.aiTools.includes(tool)} onChange={() => toggleTool(tool)} />{tool}</label>)}</div>{form.aiTools.length === 0 && <p className="mt-1 text-xs text-red-600">Select at least one AI tool.</p>}</Field>
      <Field label="Status"><select className="control w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PromptInput['status'] })}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></Field>
      <Field label="Example image (optional)"><input type="file" accept="image/jpeg,image/png,image/webp" className="control w-full" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} /><p className="mt-1 text-xs text-slate-500">JPG, PNG, or WebP. Maximum 2 MB.</p></Field>
      {(imageFile || form.exampleImageUrl) && <div className="sm:col-span-2"><div className="flex max-h-80 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-950"><img src={imageFile ? URL.createObjectURL(imageFile) : form.exampleImageUrl || ''} alt="Prompt preview" className="max-h-80 max-w-full object-contain" /></div>{form.exampleImageUrl && !imageFile && <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => setForm({ ...form, exampleImageUrl: null })}>Remove image</Button>}</div>}
      <Field label="Prompt content" wide><textarea required className="control min-h-52 w-full font-mono text-sm" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></Field>
    </div>{save.isError && <Alert className="mt-4" tone="error">{getErrorMessage(save.error)}</Alert>}<div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditing(undefined)}>Cancel</Button><Button type="submit" disabled={save.isPending || form.aiTools.length === 0}>{save.isPending ? 'Saving...' : 'Save prompt'}</Button></div></form></div>}

    {categoryOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"><div className="flex justify-between"><h2 className="text-xl font-bold">Prompt categories</h2><button onClick={() => setCategoryOpen(false)} aria-label="Close"><X className="size-5" /></button></div><form className="mt-5 grid gap-3 sm:grid-cols-[70px_1fr_auto]" onSubmit={(e) => { e.preventDefault(); addCategory.mutate(); }}><input className="control" maxLength={20} placeholder="Icon" value={categoryIcon} onChange={(e) => setCategoryIcon(e.target.value)} /><input required className="control" placeholder="Category name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} /><Button type="submit" disabled={addCategory.isPending}>Add</Button><input className="control sm:col-span-3" placeholder="Description (optional)" value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} /></form><div className="mt-5 divide-y dark:divide-slate-800">{categories.data?.map((category) => <div key={category.id} className="flex items-center gap-3 py-3"><span className="text-xl">{category.icon || '✨'}</span><div className="min-w-0 flex-1"><p className="font-semibold">{category.name}</p><p className="text-xs text-slate-500">{category._count?.prompts ?? 0} prompts · {category.isActive ? 'Active' : 'Hidden'}</p></div><Button size="sm" variant="outline" onClick={() => promptGalleryService.updateCategory(category.id, { name: category.name, icon: category.icon, description: category.description, isActive: !category.isActive }).then(refresh)}>{category.isActive ? 'Hide' : 'Show'}</Button><Button size="sm" variant="ghost" disabled={Boolean(category._count?.prompts)} onClick={() => promptGalleryService.removeCategory(category.id).then(refresh)}><Trash2 className="size-4 text-red-500" /></Button></div>)}</div></div></div>}
  </main>;
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) { return <label className={wide ? 'sm:col-span-2' : ''}><span className="mb-1.5 block text-sm font-semibold">{label}</span>{children}</label>; }

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ error?: string; details?: Record<string, string[]> }>(error)) {
    const response = error.response?.data;
    const validationMessage = response?.details && Object.values(response.details).flat().find(Boolean);
    return validationMessage || response?.error || (error.response ? `Could not save the prompt (${error.response.status}).` : 'Could not connect to the server.');
  }
  return error instanceof Error ? error.message : 'Could not save the prompt.';
}
