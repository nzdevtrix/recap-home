'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Tracking() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const trackOrder = async () => {
    if (!orderId.trim()) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/${orderId}`);
      if (!res.ok) { setError('Order not found'); setOrder(null); return; }
      const data = await res.json();
      setOrder(data);
      setError('');
    } catch {
      setError('Failed to connect');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Track Order</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>Enter Order ID</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="Order ID..." />
            <Button onClick={trackOrder}>Track</Button>
          </CardContent>
        </Card>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {order && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>ID:</strong> {order.id}</p>
                <p><strong>Status:</strong>
                  <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>{order.status}</span>
                </p>
                <p><strong>Total:</strong> ${order.total}</p>
                <p><strong>Pickup:</strong> {order.pickupAddress}</p>
                <p><strong>Delivery:</strong> {order.deliveryAddress}</p>
                <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Live Location</CardTitle>
              </CardHeader>
              <CardContent>
                <Map />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}