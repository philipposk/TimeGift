'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { TopNav } from '@/components/tg/nav';
import { Icon } from '@/components/tg/icon';

export default function AddMemoryPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const giftId = params.id;
  const [user, setUser] = useState<any>(null);
  const [story, setStory] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) {
        router.push(`/auth/signin?next=/gifts/${giftId}/memory`);
        return;
      }
      setUser(u);
    });
  }, [giftId, router]);

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!giftId || !user) return;
    if (!photo && !story.trim()) {
      setError('Add at least a photo or a sentence.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      let photoUrl = '';
      if (photo) {
        const path = `${user.id}/${giftId}/${Date.now()}_${photo.name}`;
        const { error: uploadErr } = await supabase.storage.from('memories').upload(path, photo, {
          upsert: false,
        });
        if (uploadErr) throw uploadErr;
        const { data: pub } = supabase.storage.from('memories').getPublicUrl(path);
        photoUrl = pub.publicUrl;
      }
      const res = await fetch(`/api/gifts/${giftId}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoUrl: photoUrl || null,
          story: story.trim() || null,
          location: location.trim() || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Save failed.');
      router.push(`/gifts/${giftId}`);
    } catch (e: any) {
      setError(e.message || 'Save failed.');
      setSubmitting(false);
    }
  }

  return (
    <>
      <TopNav />
      <main>
        <div className="container" style={{ paddingTop: 24, paddingBottom: 80, maxWidth: 640 }}>
          <div className="stack gap-2 mb-8">
            <div className="eyebrow">Keeping it</div>
            <h1 style={{ fontSize: 36, letterSpacing: '-0.02em' }}>Add a memory</h1>
            <p className="muted" style={{ fontSize: 14.5 }}>
              A photo, a sentence, or both. This stays in your private shelf.
            </p>
          </div>

          <div className="stack gap-6">
            <div className="field">
              <label className="field-label">Photo (optional)</label>
              {photoPreview ? (
                <div style={{ position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{ width: '100%', borderRadius: 4, maxHeight: 360, objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview('');
                    }}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'var(--paper)',
                      border: '1px solid var(--hairline)',
                      padding: 6,
                      borderRadius: 999,
                      cursor: 'pointer',
                    }}
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
              ) : (
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 48,
                    border: '1px dashed var(--hairline)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: '#fbf7ee',
                  }}
                >
                  <Icon name="camera" size={28} className="muted" />
                  <div className="meta mt-3">Click to upload</div>
                  <input type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            <div className="field">
              <label className="field-label">Sentence (optional)</label>
              <textarea
                className="textarea"
                rows={5}
                placeholder="Five trips, one couch through a window, pizza at 9pm. Worth it."
                value={story}
                onChange={(e) => setStory(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="field-label">Location (optional)</label>
              <input
                className="input"
                placeholder="Bondi Beach, Sydney"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: 16,
                  border: '1px solid var(--rose-soft)',
                  background: 'var(--rose-soft)',
                  color: '#5b2228',
                  borderRadius: 6,
                }}
              >
                {error}
              </div>
            )}

            <div className="row between" style={{ paddingTop: 24, borderTop: '1px solid var(--hairline-soft)' }}>
              <button className="btn btn-ghost" onClick={() => router.push(`/gifts/${giftId}`)}>
                <Icon name="arrow-left" size={14} /> Back
              </button>
              <button className="btn btn-accent" onClick={submit} disabled={submitting}>
                {submitting ? 'Saving…' : 'Keep this memory'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
