"use client";

import { useEffect, useState } from "react";
import { listCustomers } from "@/lib/admin";

type Customer = {
  uid: string;
  email?: string;
  name?: string | null;
  phone?: string | null;
  createdAt?: number;
};

export default function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCustomers()
      .then((c) => setCustomers(c as Customer[]))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="animate-pulse text-neutral-500 text-sm">Loading customers...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-black tracking-tight mb-6">
        CUSTOMERS ({customers.length})
      </h2>
      {customers.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-xl p-10 text-center">
          <p className="text-neutral-500 text-sm">
            No customers yet. They appear here after signing in with Google.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <div
              key={c.uid}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-sm">{c.name || "No name"}</p>
                <p className="text-neutral-500 text-xs">{c.email}</p>
              </div>
              {c.phone && (
                <p className="text-neutral-400 text-xs">{c.phone}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
