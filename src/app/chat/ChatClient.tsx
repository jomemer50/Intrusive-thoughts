"use client";

import { useChat } from '@ai-sdk/react';
import { FormEvent, useRef, useEffect, useState } from 'react';
import { SendIcon, Loader2, Moon, Sun, Trash2, Plus, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from 'next-themes';

type ConversationInfo = {
  id: string;
  title: string;
  updatedAt: number;
};

export default function ChatClient() {
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadedInitial, setLoadedInitial] = useState(false);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load conversations list
    const savedConvos = localStorage.getItem('nemotron_conversations');
    let loaded: ConversationInfo[] = [];
    if (savedConvos) {
      try {
        loaded = JSON.parse(savedConvos);
        setConversations(loaded);
      } catch (e) {}
    }

    if (loaded.length > 0) {
      // Load the most recent conversation by default
      loaded.sort((a, b) => b.updatedAt - a.updatedAt);
      const latestId = loaded[0].id;
      setActiveConversationId(latestId);
      const savedMsgs = localStorage.getItem(`nemotron_chat_${latestId}`);
      if (savedMsgs) {
        try {
          setInitialMessages(JSON.parse(savedMsgs));
        } catch (e) {}
      }
    } else {
      // No conversations exist, start a fresh one
      setActiveConversationId(crypto.randomUUID());
    }
    setLoadedInitial(true);
  }, []);

  const createNewChat = () => {
    const newId = crypto.randomUUID();
    setActiveConversationId(newId);
    setInitialMessages([]); // Reset initial messages for the new chat
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    const savedMsgs = localStorage.getItem(`nemotron_chat_${id}`);
    if (savedMsgs) {
      try {
        setInitialMessages(JSON.parse(savedMsgs));
      } catch (e) {
        setInitialMessages([]);
      }
    } else {
      setInitialMessages([]);
    }
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newConvos = conversations.filter(c => c.id !== id);
    setConversations(newConvos);
    localStorage.setItem('nemotron_conversations', JSON.stringify(newConvos));
    localStorage.removeItem(`nemotron_chat_${id}`);
    
    if (activeConversationId === id) {
      if (newConvos.length > 0) {
        selectConversation(newConvos[0].id);
      } else {
        createNewChat();
      }
    }
  };

  if (!loadedInitial) return null;

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="font-bold text-lg">Conversations</h2>
          <button 
            onClick={createNewChat}
            className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-sm text-zinc-500 italic p-2">No history yet.</p>
          ) : (
            conversations.map(c => (
              <div 
                key={c.id} 
                onClick={() => selectConversation(c.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group ${
                  activeConversationId === c.id 
                    ? 'bg-zinc-200 dark:bg-zinc-800' 
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <MessageSquare className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  <span className="text-sm truncate">{c.title}</span>
                </div>
                <button 
                  onClick={(e) => deleteConversation(c.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen relative">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="font-semibold">Thoughts</h1>
            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded hidden sm:inline-block">*lights a cigarrete*</span>
          </div>
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* The active chat app instance */}
        {activeConversationId && (
          <ChatApp 
            key={activeConversationId} // Force remount on conversation change
            conversationId={activeConversationId} 
            initialMessages={initialMessages} 
            updateConversationsList={(id, title) => {
              setConversations(prev => {
                const existing = prev.find(c => c.id === id);
                let newList;
                if (existing) {
                  newList = prev.map(c => c.id === id ? { ...c, title, updatedAt: Date.now() } : c);
                } else {
                  newList = [{ id, title, updatedAt: Date.now() }, ...prev];
                }
                localStorage.setItem('nemotron_conversations', JSON.stringify(newList));
                return newList;
              });
            }}
          />
        )}
      </div>
    </div>
  );
}

function ChatApp({ conversationId, initialMessages, updateConversationsList }: { conversationId: string, initialMessages: any[], updateConversationsList: (id: string, title: string) => void }) {
  const [input, setInput] = useState('');

  const { messages, sendMessage, status, setMessages } = useChat({
    api: '/api/chat',
    body: {
      conversationId
    }
  } as any);

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, setMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`nemotron_chat_${conversationId}`, JSON.stringify(messages));
      
      // Update the conversations list title if it's the first user message
      const firstUserMessage = messages.find(m => m.role === 'user');
      const title = firstUserMessage ? ((firstUserMessage as any).content || firstUserMessage.parts?.filter((p:any) => p.type === 'text').map((p:any) => p.text).join(''))?.substring(0, 30) + '...' : 'New Chat';
      updateConversationsList(conversationId, title);
    }
  }, [messages, conversationId]);

  const isLoading = status === 'streaming' || status === 'submitted';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] });
    setInput('');
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-4xl mx-auto w-full relative">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400 space-y-4">
            <p>Ask a profound question or present a moral dilemma. I Dare You.</p>
          </div>
        )}
        
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-3 rounded-2xl max-w-[85%] whitespace-pre-wrap ${
              m.role === 'user' 
                ? 'bg-black text-white dark:bg-zinc-100 dark:text-black rounded-br-sm' 
                : 'bg-zinc-100 text-black dark:bg-zinc-800 dark:text-zinc-100 rounded-bl-sm border border-zinc-200 dark:border-zinc-700'
            }`}>
              {m.role === 'user' ? (
                <div className="whitespace-pre-wrap font-medium">
                  {(m as any).content || m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')}
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-black dark:text-zinc-100 prose-p:text-black dark:prose-p:text-zinc-100 prose-headings:text-black dark:prose-headings:text-zinc-100 prose-strong:text-black dark:prose-strong:text-zinc-100 prose-a:text-blue-600 dark:prose-a:text-blue-400">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {(m as any).content || m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center space-x-2 border border-zinc-200 dark:border-zinc-700">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-500 dark:text-zinc-400" />
              <span className="text-zinc-500 dark:text-zinc-400 text-sm">Getting thoughts back...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
        <form onSubmit={onSubmit} className="max-w-4xl mx-auto flex space-x-4">
          <input
            className="flex-1 p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors"
            value={input || ''}
            placeholder="Explore a topic..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !(input || '').trim()}
            className="bg-black text-white dark:bg-zinc-100 dark:text-black p-3 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex shrink-0 items-center justify-center w-12 h-12"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </>
  );
}