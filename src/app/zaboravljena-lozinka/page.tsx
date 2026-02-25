'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { resetPassword } = await import('@/lib/firebase');
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greska pri slanju emaila');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">BZR</span>
            </div>
            <span className="font-bold text-2xl">Savetnik</span>
          </Link>
          <p className="text-muted-foreground mt-2">Resetujte vasu lozinku</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-semibold text-lg">Email je poslat!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Proverite vase sanduche na <strong>{email}</strong> i pratite uputstva za resetovanje lozinke.
              </p>
              <Link
                href="/prijava"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground mt-6"
              >
                Nazad na prijavu
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-4">
                Unesite email adresu povezanu sa vasim nalogom i posalacemo vam link za resetovanje lozinke.
              </p>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email adresa</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vas@email.com"
                    required
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Slanje...' : 'Posalji link za reset'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link href="/prijava" className="text-primary hover:underline font-medium">
            Nazad na prijavu
          </Link>
        </p>
      </div>
    </div>
  );
}
