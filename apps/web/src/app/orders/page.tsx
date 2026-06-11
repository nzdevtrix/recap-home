'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [form, setForm] = useState({
    items: 'Pizza',
    total: '10.99',
    pickupAddress: '123 Main St',
    deliveryAddress: '456 Elm St'
  });

  const createOrder = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '1',
          items: [{ id: '1', name: form.items }],
          total: parseFloat(form.total),
          pickupAddress: form.pickupAddress,
          deliveryAddress: form.deliveryAddress
        })
      });
      const data = await res.json();
      setOrders([data, ...orders]);
    } catch (err) {
      console.error('Failed to create order:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Orders</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Item</Label>
                <Input value={form.items} onChange={e => setForm({ ...form, items: e.target.value })} />
              </div>
              <div>
                <Label>Total</Label>
                <Input type="number" step="0.01" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} />
              </div>
              <div>
                <Label>Pickup Address</Label>
                <Input value={form.pickupAddress} onChange={e => setForm({ ...form, pickupAddress: e.target.value })} />
              </div>
              <div>
                <Label>Delivery Address</Label>
                <Input value={form.deliveryAddress} onChange={e => setForm({ ...form, deliveryAddress: e.target.value })} />
              </div>
              <Button onClick={createOrder} className="w-full">Create Order</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Live Map</CardTitle>
            </CardHeader>
            <CardContent>
              <Map />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-2">
                {orders.map((order: any) => (
                  <div key={order.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Order #{order.id}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>{order.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Total: ${order.total}</p>
                    <p className="text-sm text-muted-foreground">{order.pickupAddress} → {order.deliveryAddress}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}