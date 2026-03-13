'use client';

/**
 * Messaging Inbox Page
 *
 * Thread list (left panel) + thread view (right panel).
 * Supports both agency and company users.
 * Handles new thread creation via URL params (?newThread=true&agencyId=X etc.)
 */

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare,
  Send,
  Loader2,
  Archive,
  ArrowLeft,
  Inbox,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/AuthProvider';

export default function MessagingPage() {
  const { userType } = useAuth();
  const searchParams = useSearchParams();
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // URL params for new thread
  const newThreadParam = searchParams.get('newThread');
  const agencyIdParam = searchParams.get('agencyId');
  const companyIdParam = searchParams.get('companyId');
  const agencyNameParam = searchParams.get('agencyName');
  const companyNameParam = searchParams.get('companyName');
  const subjectParam = searchParams.get('subject');
  const threadParam = searchParams.get('thread');

  useEffect(() => {
    if (newThreadParam === 'true') {
      setShowNewThread(true);
      setNewSubject(subjectParam || '');
    }
    if (threadParam) {
      setSelectedThreadId(Number(threadParam));
    }
  }, [newThreadParam, subjectParam, threadParam]);

  // Queries
  const threadsQuery = (trpc as any).messaging.listThreads.useQuery(undefined, {
    refetchInterval: 15000,
  });

  const threadDetailQuery = (trpc as any).messaging.getThread.useQuery(
    { threadId: selectedThreadId! },
    { enabled: !!selectedThreadId, refetchInterval: 10000 }
  );

  const sendMutation = (trpc as any).messaging.sendMessage.useMutation({
    onSuccess: (data: any) => {
      setReplyContent('');
      setNewMessage('');
      setShowNewThread(false);
      setSelectedThreadId(data.threadId);
      threadsQuery.refetch();
      threadDetailQuery.refetch();
    },
  });

  const archiveMutation = (trpc as any).messaging.archiveThread.useMutation({
    onSuccess: () => {
      setSelectedThreadId(null);
      threadsQuery.refetch();
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadDetailQuery.data?.messages]);

  const threads = threadsQuery.data ?? [];
  const threadDetail = threadDetailQuery.data;
  const recipientName = userType === 'agency'
    ? (companyNameParam || threadDetail?.thread?.companyName)
    : (agencyNameParam || threadDetail?.thread?.agencyName);

  const handleSendNewThread = () => {
    if (!newSubject.trim() || !newMessage.trim()) return;

    const params: any = {
      subject: newSubject,
      content: newMessage,
    };

    if (userType === 'agency' && companyIdParam) {
      params.recipientCompanyId = Number(companyIdParam);
    } else if (userType === 'company' && agencyIdParam) {
      params.recipientAgencyId = Number(agencyIdParam);
    }

    sendMutation.mutate(params);
  };

  const handleReply = () => {
    if (!replyContent.trim() || !selectedThreadId) return;
    sendMutation.mutate({
      threadId: selectedThreadId,
      content: replyContent,
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Poruke</h1>

      <div className="rounded-lg border bg-card overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="flex h-full">
          {/* Thread List */}
          <div className={`w-full md:w-80 border-r flex flex-col ${selectedThreadId || showNewThread ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b flex items-center justify-between">
              <span className="text-sm font-medium">Konverzacije</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {threadsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Inbox className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Nema poruka</p>
                </div>
              ) : (
                threads.map((thread: any) => (
                  <button
                    key={thread.id}
                    onClick={() => { setSelectedThreadId(thread.id); setShowNewThread(false); }}
                    className={`w-full text-left p-3 border-b hover:bg-muted/50 transition-colors ${
                      selectedThreadId === thread.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {userType === 'agency' ? thread.companyName : thread.agencyName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {thread.subject}
                        </p>
                        {thread.lastMessagePreview && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {thread.lastMessagePreview}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(thread.lastMessageAt).toLocaleDateString('sr-RS')}
                        </span>
                        {thread.unreadCount > 0 && (
                          <span className="h-5 min-w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs px-1.5">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Thread Detail / New Thread / Empty */}
          <div className={`flex-1 flex flex-col ${!selectedThreadId && !showNewThread ? 'hidden md:flex' : 'flex'}`}>
            {showNewThread ? (
              /* New Thread Form */
              <>
                <div className="p-3 border-b flex items-center gap-2">
                  <button
                    onClick={() => setShowNewThread(false)}
                    className="md:hidden p-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium">Nova poruka</span>
                  {recipientName && (
                    <span className="text-sm text-muted-foreground">- {recipientName}</span>
                  )}
                </div>
                <div className="flex-1 p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Naslov..."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <textarea
                    placeholder="Vasa poruka..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="p-3 border-t">
                  <button
                    onClick={handleSendNewThread}
                    disabled={!newSubject.trim() || !newMessage.trim() || sendMutation.isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {sendMutation.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Posalji
                  </button>
                </div>
              </>
            ) : selectedThreadId && threadDetail ? (
              /* Thread Detail */
              <>
                <div className="p-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedThreadId(null)}
                      className="md:hidden p-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                      <p className="text-sm font-medium">{threadDetail.thread.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {userType === 'agency' ? threadDetail.thread.companyName : threadDetail.thread.agencyName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => archiveMutation.mutate({ threadId: selectedThreadId })}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                    title="Arhiviraj"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {threadDetail.messages.map((msg: any) => {
                    const isOwn =
                      (userType === 'agency' && msg.senderType === 'agency') ||
                      (userType === 'company' && msg.senderType === 'company');

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
                            isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-xs font-medium mb-1 opacity-80">{msg.senderName}</p>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-60">
                            {new Date(msg.createdAt).toLocaleString('sr-RS')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Input */}
                <div className="p-3 border-t flex gap-2">
                  <input
                    type="text"
                    placeholder="Napisite odgovor..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
                    className="flex-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyContent.trim() || sendMutation.isLoading}
                    className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {sendMutation.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Izaberite konverzaciju</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
