'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, UserCheck, UserX, Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { getIdToken } from '@/lib/firebase';

interface Agent {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function AgentsPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');

  // Add form
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [adding, setAdding] = useState(false);

  async function fetchAgents() {
    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/trpc/agencies.listAgents`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        setAgents(data?.result?.data?.json || []);
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) fetchAgents();
  }, [user]);

  const handleDeactivate = async (agentId: number) => {
    if (!confirm('Da li ste sigurni da zelite da deaktivirate ovog agenta?')) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/trpc/agencies.deactivateAgent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ json: { agentId } }),
        }
      );

      fetchAgents();
    } catch (err) {
      setError('Greska pri deaktivaciji agenta');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenti</h1>
          <p className="text-muted-foreground mt-1">
            Upravljajte agentima koji rade u vasoj agenciji
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Dodaj agenta
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Add Agent Form */}
      {showAdd && (
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h3 className="font-semibold">Pozovite novog agenta</h3>
          <p className="text-sm text-muted-foreground">
            Agent ce morati da se registruje na platformi sa ovim emailom.
            Njegov nalog ce automatski biti povezan sa vasom agencijom.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="agent@email.com"
                required
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Ime i prezime *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ime Prezime"
                required
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAdd(false)}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              Otkazi
            </button>
            <button
              onClick={async () => {
                // For now, just show info about registration
                // Full implementation will use Firebase Admin to create account
                alert(
                  `Agent ${newName} (${newEmail}) treba da se registruje na platformi.\n\n` +
                  `Posaljite mu link: ${window.location.origin}/registracija`
                );
                setShowAdd(false);
                setNewEmail('');
                setNewName('');
              }}
              disabled={!newEmail || !newName || adding}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              <Mail className="h-4 w-4" />
              {adding ? 'Slanje...' : 'Posalji pozivnicu'}
            </button>
          </div>
        </div>
      )}

      {/* Agents List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : agents.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-semibold text-lg">Nema drugih agenata</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Vi ste jedini korisnik u ovoj agenciji
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card divide-y">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    agent.isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {agent.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">
                    {agent.fullName}
                    {agent.role === 'owner' && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
                        Vlasnik
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{agent.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  {agent.isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                      <UserCheck className="h-3.5 w-3.5" />
                      Aktivan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-red-600">
                      <UserX className="h-3.5 w-3.5" />
                      Neaktivan
                    </span>
                  )}
                  {agent.lastLoginAt && (
                    <p className="text-xs text-muted-foreground">
                      Poslednja prijava:{' '}
                      {new Date(agent.lastLoginAt).toLocaleDateString('sr-RS')}
                    </p>
                  )}
                </div>
                {agent.role !== 'owner' && agent.isActive && (
                  <button
                    onClick={() => handleDeactivate(agent.id)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Deaktiviraj
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
