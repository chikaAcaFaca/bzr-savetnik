'use client';

/**
 * App Layout - Protected routes
 *
 * Wraps all /app/* routes with authentication guard and dashboard sidebar.
 * Sidebar navigation adapts based on user type (agency vs company).
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  FileText,
  Bot,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
  CreditCard,
  Search,
  Target,
  MessageSquare,
  ClipboardList,
  AlertTriangle,
  Upload,
  GitBranch,
  Mail,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, userType } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push('/prijava');
    return null;
  }

  // Agency navigation items
  const agencyNavItems = [
    { href: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/app/klijenti', icon: Building2, label: 'Klijenti' },
    { href: '/app/evidencije', icon: ClipboardList, label: 'Evidencije' },
    { href: '/app/povrede', icon: AlertTriangle, label: 'Povrede' },
    { href: '/app/tok-dokumenta', icon: GitBranch, label: 'Tok dokumenta' },
    { href: '/app/pronalazenje-klijenata', icon: Target, label: 'Pronalazenje klijenata' },
    { href: '/app/poruke', icon: MessageSquare, label: 'Poruke' },
    { href: '/app/pozicije', icon: Briefcase, label: 'Radna mesta' },
    { href: '/app/dokumenti', icon: FileText, label: 'Dokumenti' },
    { href: '/app/ai-savetnik', icon: Bot, label: 'AI Savetnik' },
    { href: '/app/agenti', icon: Users, label: 'Agenti' },
    { href: '/app/newsletter', icon: Mail, label: 'Newsletter' },
    { href: '/app/podesavanja', icon: Settings, label: 'Podesavanja' },
  ];

  // Company navigation items
  const companyNavItems = [
    { href: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/app/moja-stranica', icon: Globe, label: 'Moja Stranica' },
    { href: '/app/evidencije', icon: ClipboardList, label: 'Evidencije' },
    { href: '/app/dokumenti-firme', icon: Upload, label: 'Dokumenti firme' },
    { href: '/app/dokumenti', icon: FileText, label: 'Dokumenti' },
    { href: '/app/ai-savetnik', icon: Bot, label: 'AI Savetnik' },
    { href: '/app/pronadji-agenciju', icon: Search, label: 'Pronadji agenciju' },
    { href: '/app/poruke', icon: MessageSquare, label: 'Poruke' },
    { href: '/app/pretplata', icon: CreditCard, label: 'Pretplata' },
    { href: '/app/podesavanja', icon: Settings, label: 'Podesavanja' },
  ];

  const navItems = userType === 'company' ? companyNavItems : agencyNavItems;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b h-14 flex items-center px-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="ml-2 font-bold">BZR Savetnik</span>
        {userType && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {userType === 'company' ? 'Firma' : 'Agencija'}
          </span>
        )}
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-background border-r transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-4 border-b">
          <Link href="/app/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="BZR Savetnik" className="h-8 w-8 object-contain" />
            <span className="font-bold">Savetnik</span>
          </Link>
          {userType && (
            <div className="mt-2 text-xs px-2 py-1 rounded bg-muted text-muted-foreground inline-block">
              {userType === 'company' ? 'Firma' : 'Agencija'}
            </div>
          )}
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t">
          <button
            onClick={async () => {
              const { logout } = await import('@/lib/firebase');
              await logout();
              localStorage.removeItem('bzr_user_type');
              router.push('/prijava');
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive w-full"
          >
            <LogOut className="h-4 w-4" />
            Odjavi se
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
