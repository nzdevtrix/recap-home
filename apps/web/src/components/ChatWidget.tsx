'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ChatWidget() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/chatbot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, role: 'PRIVATE' })
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      setResponse('Failed to connect to chatbot service.');
    }
    setLoading(false);
    setMessage('');
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, width: 320, zIndex: 999 }}>
      <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
        <div className="bg-primary text-primary-foreground p-3 text-sm font-medium">
          Recap Home Assistant
        </div>
        <div style={{ height: 200, overflowY: 'auto', padding: 12 }} className="bg-muted/30">
          {response && (
            <div className="bg-primary/10 rounded-lg p-3 mb-2 text-sm">{response}</div>
          )}
          {!response && (
            <p className="text-muted-foreground text-sm">Ask me anything about your delivery!</p>
          )}
        </div>
        <div className="p-3 border-t flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Button onClick={handleSubmit} disabled={loading} size="sm">
            {loading ? '...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}