"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatProps {
    grade?: number;
    diagnosisTags?: string[];
    currentStep?: string;
    modelId?: string;
}

export default function CoachChat({ grade = 7, diagnosisTags = [], currentStep = "", modelId = "condition-mapping" }: ChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [modelContext, setModelContext] = useState<any>(null);

    // Fetch model context on mount/change
    useEffect(() => {
        if (modelId) {
            fetch(`/models/${modelId}/steps.json`)
                .then(res => res.json())
                .then(data => setModelContext(data))
                .catch(err => console.error("Chat context load failed", err));
        }
    }, [modelId]);

    const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
        { role: 'assistant', content: '你好！我是你的几何教练。做题卡住了吗？告诉我哪里想不通。' }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grade,
                    diagnosisTags,
                    userSelfReport: userMsg,
                    currentStep,
                    modelContext: modelContext ? {
                        title: modelContext.title,
                        goal: modelContext.goal,
                        steps: modelContext.steps,
                        check: modelContext.check
                    } : null
                })
            });
            
            if (!res.ok) throw new Error('Failed');
            
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: '教练正在思考中...（网络有点慢，请重试）' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-2xl z-50 hover:bg-blue-700 transition-all ${isOpen ? 'hidden' : 'flex'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <MessageCircle size={28} />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-200"
                    >
                        {/* Header */}
                        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2 font-bold">
                                <Bot size={20} />
                                <span>AI 几何教练</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-200 text-slate-500 p-3 rounded-2xl rounded-bl-none text-xs animate-pulse">
                                        正在分析几何模型...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="输入你的困惑..."
                                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="p-2 bg-blue-600 text-white rounded-xl disabled:opacity-50 hover:bg-blue-700"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}