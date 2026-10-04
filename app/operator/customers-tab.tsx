"use client";

import { useEffect, useState } from "react";
import { listCustomers } from "@/lib/admin";
import { Table, Td } from "./ui";

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
      <h2 className="text-xl font-black tracking-tight mb-5">
        CUSTOMERS ({customers.length})
      </h2>
      {customers.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-xl p-10 text-center">
          <p className="text-neutral-500 text-sm">
            No customers yet. They appear here after signing in with Google.
          </p>
        </div>
      ) : (
        <Table head={["Customer", "Email", "Phone", "Joined"]}>
          {customers.map((c) => (
            <tr key={c.uid} className="hover:bg-neutral-900/60 transition-colors">
              <Td className="font-bold">{c.name || "No name"}</Td>
              <Td className="text-neutral-400">{c.email}</Td>
              <Td className="text-neutral-400">{c.phone || "—"}</Td>
              <Td className="text-neutral-500">
                {c.createdAt
                  ? new Date(c.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
