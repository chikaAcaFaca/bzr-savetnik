'use client';

/**
 * Moja Stranica - Company Free Presentation Dashboard
 *
 * Tabs: O firmi, Blog, Ponude, Galerija, Podesavanja
 * Company owners manage their free profile page content here.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { refreshCachedToken } from '@/lib/trpc';
import {
  FileText, Tag, Image, Settings, Plus, Trash2, Edit2, Save, X, Loader2, ExternalLink, Eye, EyeOff, Sparkles,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type TabId = 'about' | 'blog' | 'ponude' | 'galerija' | 'podesavanja';

interface CompanyPost {
  id: number;
  companyDirectoryId: number;
  type: 'blog' | 'ponuda' | 'galerija';
  title: string | null;
  content: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ProfileData {
  maticniBroj: string;
  poslovnoIme: string;
  kratakOpis: string | null;
  usluge: string | null;
  logoUrl: string | null;
  telefon: string | null;
  email: string | null;
  adresa: string | null;
  webSajt: string | null;
  telefonVidljiv: boolean | null;
  emailVidljiv: boolean | null;
  kontaktFormAktivna: boolean | null;
  claimedAt: string | null;
}

export default function MojaStranicaPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('about');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<CompanyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // About form
  const [kratakOpis, setKratakOpis] = useState('');
  const [usluge, setUsluge] = useState('');

  // Contact info form
  const [telefon, setTelefon] = useState('');
  const [emailKontakt, setEmailKontakt] = useState('');
  const [adresa, setAdresa] = useState('');
  const [webSajt, setWebSajt] = useState('');

  // Settings form
  const [telefonVidljiv, setTelefonVidljiv] = useState(false);
  const [emailVidljiv, setEmailVidljiv] = useState(false);
  const [kontaktFormAktivna, setKontaktFormAktivna] = useState(false);

  // Post editor
  const [editingPost, setEditingPost] = useState<CompanyPost | null>(null);
  const [newPost, setNewPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postType, setPostType] = useState<'blog' | 'ponuda' | 'galerija'>('blog');
  const [uploading, setUploading] = useState(false);

  // Working hours
  const defaultHours: Record<string, string> = {
    ponedeljak: '08:00-16:00',
    utorak: '08:00-16:00',
    sreda: '08:00-16:00',
    cetvrtak: '08:00-16:00',
    petak: '08:00-16:00',
    subota: 'Zatvoreno',
    nedelja: 'Zatvoreno',
  };
  const [radnoVreme, setRadnoVreme] = useState<Record<string, string>>(defaultHours);

  // AI generation & improvement
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [postsRemaining, setPostsRemaining] = useState(5);
  const [aiImproving, setAiImproving] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function trpcCall(path: string, method: 'GET' | 'POST' = 'GET', input?: any) {
    const token = await refreshCachedToken();
    if (!token) throw new Error('Niste prijavljeni');

    if (method === 'GET') {
      const url = input
        ? `${API_URL}/trpc/${path}?input=${encodeURIComponent(JSON.stringify({ json: input }))}`
        : `${API_URL}/trpc/${path}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.json?.message || 'Greska');
      }
      const data = await res.json();
      return data?.result?.data?.json;
    } else {
      const res = await fetch(`${API_URL}/trpc/${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ json: input }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.json?.message || 'Greska');
      }
      const data = await res.json();
      return data?.result?.data?.json;
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      // Load profile
      const profileData = await trpcCall('companies.myProfile');
      if (!profileData) {
        setError('Firma nije pronadjena');
        setLoading(false);
        return;
      }

      // Try to get directory profile using company's PIB
      try {
        const dirProfile = await trpcCall('companyDirectory.getPublicProfile', 'GET', {
          maticniBroj: profileData.maticniBroj || '',
        });
        if (dirProfile) {
          setProfile(dirProfile);
          setKratakOpis(dirProfile.kratakOpis || '');
          setUsluge(dirProfile.usluge || '');
          setTelefon(dirProfile.telefon || '');
          setEmailKontakt(dirProfile.email || '');
          setAdresa(dirProfile.adresa || '');
          setWebSajt(dirProfile.webSajt || '');
          setTelefonVidljiv(dirProfile.telefonVidljiv ?? false);
          setEmailVidljiv(dirProfile.emailVidljiv ?? false);
          setKontaktFormAktivna(dirProfile.kontaktFormAktivna ?? false);
          if (dirProfile.radnoVreme && typeof dirProfile.radnoVreme === 'object') {
            setRadnoVreme({ ...defaultHours, ...(dirProfile.radnoVreme as Record<string, string>) });
          }
        }
      } catch {
        // No directory profile claimed yet
      }

      // Load posts
      try {
        const myPostsData = await trpcCall('companyDirectory.myPosts', 'GET');
        if (myPostsData && Array.isArray(myPostsData.posts)) {
          setPosts(myPostsData.posts);
          setPostsRemaining(myPostsData.postsRemaining ?? 5);
        } else if (Array.isArray(myPostsData)) {
          // Backwards compatibility
          setPosts(myPostsData);
        }
      } catch {
        // No posts yet
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greska pri ucitavanju');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAbout() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await trpcCall('companyDirectory.updateMyProfile', 'POST', {
        kratakOpis,
        usluge,
        radnoVreme,
      });
      setSuccess('Sacuvano!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greska pri cuvanju');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSettings() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await trpcCall('companyDirectory.updateMyProfile', 'POST', {
        telefon,
        email: emailKontakt,
        adresa,
        webSajt,
        telefonVidljiv,
        emailVidljiv,
        kontaktFormAktivna,
      });
      setSuccess('Podesavanja sacuvana!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greska pri cuvanju');
    } finally {
      setSaving(false);
    }
  }

  async function handleAiImprove() {
    const textToImprove = postContent.trim();
    if (!textToImprove || textToImprove.length < 10) return;
    setAiImproving(true);
    setError('');
    try {
      const type = activeTab === 'ponude' ? 'ponuda' : 'blog';
      const result = await trpcCall('companyDirectory.improveText', 'POST', {
        text: textToImprove,
        instruction: aiInstruction.trim() || undefined,
        type,
      });
      if (result?.improved) {
        setPostContent(result.improved);
        setAiInstruction('');
        setSuccess('Tekst poboljsan! Pregledajte izmene.');
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greska pri poboljsanju teksta');
    } finally {
      setAiImproving(false);
    }
  }

  async function handleCreatePost() {
    setSaving(true);
    setError('');
    try {
      const type = activeTab === 'blog' ? 'blog' : activeTab === 'ponude' ? 'ponuda' : 'galerija';
      const newPostData = await trpcCall('companyDirectory.createPost', 'POST', {
        type,
        title: postTitle || undefined,
        content: postContent || undefined,
        imageUrl: postImageUrl || undefined,
      });
      setPosts([newPostData, ...posts]);
      resetPostEditor();
      setSuccess('Post kreiran!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greska pri kreiranju');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePost() {
    if (!editingPost) return;
    setSaving(true);
    setError('');
    try {
      const updated = await trpcCall('companyDirectory.updatePost', 'POST', {
        postId: editingPost.id,
        title: postTitle || undefined,
        content: postContent || undefined,
        imageUrl: postImageUrl || undefined,
      });
      setPosts(posts.map(p => p.id === editingPost.id ? updated : p));
      resetPostEditor();
      setSuccess('Post azuriran!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greska pri azuriranju');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePost(postId: number) {
    if (!confirm('Da li ste sigurni da zelite da obrisete ovaj post?')) return;
    try {
      await trpcCall('companyDirectory.deletePost', 'POST', { postId });
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greska pri brisanju');
    }
  }

  async function handleTogglePublish(post: CompanyPost) {
    try {
      const updated = await trpcCall('companyDirectory.updatePost', 'POST', {
        postId: post.id,
        isPublished: !post.isPublished,
      });
      setPosts(posts.map(p => p.id === post.id ? updated : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greska');
    }
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const token = await refreshCachedToken();
      if (!token) throw new Error('Niste prijavljeni');

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/api/company-media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setPostImageUrl(data.url);
      } else {
        setError(data.error || 'Greska pri otpremanju slike');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greska pri otpremanju');
    } finally {
      setUploading(false);
    }
  }

  async function handleAiGenerate() {
    if (!aiTopic.trim()) return;
    setAiGenerating(true);
    setError('');
    try {
      const type = activeTab === 'ponude' ? 'ponuda' : 'blog';
      const result = await trpcCall('companyDirectory.generatePostContent', 'POST', {
        topic: aiTopic.trim(),
        type,
      });
      if (result?.title) setPostTitle(result.title);
      if (result?.content) setPostContent(result.content);
      setAiTopic('');
      setSuccess('AI tekst generisan! Mozete ga izmeniti pre objavljivanja.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greska pri generisanju AI teksta');
    } finally {
      setAiGenerating(false);
    }
  }

  function resetPostEditor() {
    setNewPost(false);
    setEditingPost(null);
    setPostTitle('');
    setPostContent('');
    setPostImageUrl('');
  }

  function startEditPost(post: CompanyPost) {
    setEditingPost(post);
    setNewPost(false);
    setPostTitle(post.title || '');
    setPostContent(post.content || '');
    setPostImageUrl(post.imageUrl || '');
  }

  function startNewPost() {
    resetPostEditor();
    setNewPost(true);
  }

  const tabs: { id: TabId; label: string; icon: typeof FileText }[] = [
    { id: 'about', label: 'O firmi', icon: FileText },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'ponude', label: 'Ponude', icon: Tag },
    { id: 'galerija', label: 'Galerija', icon: Image },
    { id: 'podesavanja', label: 'Podesavanja', icon: Settings },
  ];

  const filteredPosts = posts.filter(p => {
    if (activeTab === 'blog') return p.type === 'blog';
    if (activeTab === 'ponude') return p.type === 'ponuda';
    if (activeTab === 'galerija') return p.type === 'galerija';
    return false;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Moja Stranica</h1>
        <p className="text-muted-foreground mb-6">
          Vasa firma jos nema preuzetu stranicu u direktorijumu. Stranica ce biti automatski kreirana
          kada se vas PIB pronadje u nasem direktorijumu od 750.000+ firmi.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Moja Stranica</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upravljajte vasim besplatnim profilom firme
          </p>
        </div>
        {profile.maticniBroj && (
          <a
            href={`/firma/${profile.maticniBroj}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm hover:bg-muted"
          >
            <ExternalLink className="h-4 w-4" />
            Pogledaj stranicu
          </a>
        )}
      </div>

      {/* Success/Error banners */}
      {success && (
        <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-sm text-green-800">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); resetPostEditor(); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: O firmi */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold mb-4">Opis firme</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Kratak opis</label>
                <textarea
                  value={kratakOpis}
                  onChange={(e) => setKratakOpis(e.target.value)}
                  placeholder="Opisite vasu firmu u 2-3 recenice..."
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">{kratakOpis.length}/500</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Usluge i delatnosti</label>
                <textarea
                  value={usluge}
                  onChange={(e) => setUsluge(e.target.value)}
                  placeholder="Navedite vase glavne usluge i delatnosti..."
                  rows={3}
                  maxLength={1000}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">{usluge.length}/1000</p>
              </div>

              {/* Radno vreme editor */}
              <div>
                <label className="block text-sm font-medium mb-2">Radno vreme</label>
                <div className="grid gap-2">
                  {[
                    { key: 'ponedeljak', label: 'Ponedeljak' },
                    { key: 'utorak', label: 'Utorak' },
                    { key: 'sreda', label: 'Sreda' },
                    { key: 'cetvrtak', label: 'Cetvrtak' },
                    { key: 'petak', label: 'Petak' },
                    { key: 'subota', label: 'Subota' },
                    { key: 'nedelja', label: 'Nedelja' },
                  ].map((day) => (
                    <div key={day.key} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-24">{day.label}</span>
                      <input
                        type="text"
                        value={radnoVreme[day.key] || ''}
                        onChange={(e) =>
                          setRadnoVreme((prev) => ({ ...prev, [day.key]: e.target.value }))
                        }
                        placeholder="08:00-16:00 ili Zatvoreno"
                        className="flex-1 rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Format: 08:00-16:00 ili Zatvoreno
                </p>
              </div>

              <button
                onClick={handleSaveAbout}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Sacuvaj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs: Blog / Ponude / Galerija */}
      {(activeTab === 'blog' || activeTab === 'ponude' || activeTab === 'galerija') && (
        <div className="space-y-4">
          {/* Add new button + remaining counter */}
          {!newPost && !editingPost && (
            <div className="flex items-center justify-between">
              <button
                onClick={startNewPost}
                disabled={postsRemaining <= 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {activeTab === 'blog' ? 'Novi blog post' : activeTab === 'ponude' ? 'Nova ponuda' : 'Nova slika'}
              </button>
              <span className="text-sm text-muted-foreground">
                Preostalo objava ovog meseca: {postsRemaining}/5
              </span>
            </div>
          )}

          {/* Post editor (create or edit) */}
          {(newPost || editingPost) && (
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {editingPost ? 'Izmeni' : 'Dodaj'}{' '}
                  {activeTab === 'blog' ? 'blog post' : activeTab === 'ponude' ? 'ponudu' : 'sliku'}
                </h3>
                <button onClick={resetPostEditor} className="p-1 hover:bg-muted rounded">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* AI Generation */}
              {activeTab !== 'galerija' && (
                <div className="rounded-md border border-dashed border-primary/30 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Sparkles className="h-4 w-4" />
                    Generisi AI tekstom
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="O cemu zelite da pisete? (npr. Bezbednost na radu u zimskim uslovima)"
                      maxLength={500}
                      className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={aiGenerating}
                    />
                    <button
                      onClick={handleAiGenerate}
                      disabled={aiGenerating || !aiTopic.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap"
                    >
                      {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {aiGenerating ? 'Generisanje...' : 'Generisi'}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AI ce generisati naslov i tekst koji mozete izmeniti pre objavljivanja.
                  </p>
                </div>
              )}

              {activeTab !== 'galerija' && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Naslov</label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder={activeTab === 'blog' ? 'Naslov blog posta...' : 'Naziv ponude...'}
                    maxLength={500}
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {activeTab !== 'galerija' && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Sadrzaj</label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Tekst..."
                    rows={6}
                    maxLength={10000}
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  {/* AI Improve existing text */}
                  {postContent.length >= 10 && (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={aiInstruction}
                        onChange={(e) => setAiInstruction(e.target.value)}
                        placeholder="Opciono: kako da poboljsa? (npr. formalniji ton, krace...)"
                        className="flex-1 rounded-md border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={aiImproving}
                      />
                      <button
                        onClick={handleAiImprove}
                        disabled={aiImproving}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-primary/30 text-xs font-medium text-primary hover:bg-primary/5 disabled:opacity-50 whitespace-nowrap"
                      >
                        {aiImproving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        {aiImproving ? 'Poboljsavam...' : 'Poboljsaj AI'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {activeTab === 'galerija' ? 'Slika' : 'Slika (opciono)'}
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm cursor-pointer hover:bg-muted">
                    <Image className="h-4 w-4" />
                    {uploading ? 'Otpremanje...' : 'Otpremi sliku'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      disabled={uploading}
                    />
                  </label>
                  {postImageUrl && (
                    <div className="flex items-center gap-2">
                      <img src={postImageUrl} alt="" className="h-10 w-10 rounded object-cover" />
                      <button onClick={() => setPostImageUrl('')} className="text-xs text-destructive hover:underline">
                        Ukloni
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={editingPost ? handleUpdatePost : handleCreatePost}
                  disabled={saving || (activeTab === 'galerija' && !postImageUrl)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingPost ? 'Sacuvaj izmene' : 'Objavi'}
                </button>
                <button
                  onClick={resetPostEditor}
                  className="px-4 py-2 rounded-md border text-sm hover:bg-muted"
                >
                  Otkazi
                </button>
              </div>
            </div>
          )}

          {/* Posts list */}
          {filteredPosts.length === 0 && !newPost && !editingPost && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nema sadrzaja. Kliknite dugme iznad da dodate.</p>
            </div>
          )}

          <div className="grid gap-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={post.title || ''}
                        className="w-full h-48 object-cover rounded-md mb-3"
                      />
                    )}
                    {post.title && (
                      <h4 className="font-medium truncate">{post.title}</h4>
                    )}
                    {post.content && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{new Date(post.createdAt).toLocaleDateString('sr-Latn')}</span>
                      <span className={`px-1.5 py-0.5 rounded ${post.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {post.isPublished ? 'Objavljeno' : 'Skriveno'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className="p-1.5 rounded hover:bg-muted"
                      title={post.isPublished ? 'Sakrij' : 'Objavi'}
                    >
                      {post.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => startEditPost(post)}
                      className="p-1.5 rounded hover:bg-muted"
                      title="Izmeni"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 rounded hover:bg-muted text-destructive"
                      title="Obrisi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Podesavanja */}
      {activeTab === 'podesavanja' && (
        <div className="space-y-6">
          {/* Kontakt podaci */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Kontakt podaci</h2>
            <p className="text-sm text-muted-foreground">
              Unesite kontakt informacije koje ce se prikazivati na vasoj javnoj stranici.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Telefon</label>
                <input
                  type="text"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="+381 11 1234567"
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={emailKontakt}
                  onChange={(e) => setEmailKontakt(e.target.value)}
                  placeholder="kontakt@firma.rs"
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Adresa</label>
              <input
                type="text"
                value={adresa}
                onChange={(e) => setAdresa(e.target.value)}
                placeholder="Ulica i broj, Grad"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Web sajt</label>
              <input
                type="text"
                value={webSajt}
                onChange={(e) => setWebSajt(e.target.value)}
                placeholder="https://www.vasafirma.rs"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Vidljivost */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Vidljivost informacija</h2>
            <p className="text-sm text-muted-foreground">
              Izaberite koje informacije zelite da budu vidljive na vasoj javnoj stranici.
            </p>

            <div className="space-y-4">
              <label className="flex items-center justify-between gap-4 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                <div>
                  <p className="text-sm font-medium">Telefon vidljiv</p>
                  <p className="text-xs text-muted-foreground">Vas broj telefona ce biti prikazan na javnoj stranici</p>
                </div>
                <input
                  type="checkbox"
                  checked={telefonVidljiv}
                  onChange={(e) => setTelefonVidljiv(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300"
                />
              </label>

              <label className="flex items-center justify-between gap-4 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                <div>
                  <p className="text-sm font-medium">Email vidljiv</p>
                  <p className="text-xs text-muted-foreground">Vasa email adresa ce biti prikazana na javnoj stranici</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailVidljiv}
                  onChange={(e) => setEmailVidljiv(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300"
                />
              </label>

              <label className="flex items-center justify-between gap-4 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                <div>
                  <p className="text-sm font-medium">Kontakt forma aktivna</p>
                  <p className="text-xs text-muted-foreground">Posetioci mogu da vas kontaktiraju putem forme na stranici</p>
                </div>
                <input
                  type="checkbox"
                  checked={kontaktFormAktivna}
                  onChange={(e) => setKontaktFormAktivna(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300"
                />
              </label>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Sacuvaj podesavanja
          </button>
        </div>
      )}
    </div>
  );
}
