'use client';

/**
 * Newsletter Signup Component
 *
 * Reusable component for newsletter subscription.
 * Placed on landing page footer, pricing page, etc.
 */

import { useState } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

interface NewsletterSignupProps {
  variant?: 'inline' | 'card';
  className?: string;
}

export default function NewsletterSignup({ variant = 'inline', className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [ime, setIme] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/trpc/newsletter.subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: { email: email.trim(), ime: ime.trim() || undefined } }),
      });

      if (response.ok) {
        setSuccess(true);
        setEmail('');
        setIme('');
      } else {
        setError('Doslo je do greske. Pokusajte ponovo.');
      }
    } catch {
      setError('Doslo je do greske. Pokusajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm">Uspesno ste se prijavili na newsletter!</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`rounded-lg border bg-card p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Newsletter</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Prijavite se za najnovije vesti o bezbednosti i zdravlju na radu, zakonskim izmenama i novim funkcijama platforme.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={ime}
            onChange={(e) => setIme(e.target.value)}
            placeholder="Vase ime (opciono)"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Vasa email adresa"
              required
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Prijavi se'}
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </form>
      </div>
    );
  }

  // Inline variant
  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Vasa email adresa"
        required
        className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Mail className="h-4 w-4" /> Prijavi se</>}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
