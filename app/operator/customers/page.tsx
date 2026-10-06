"use client";

import { useEffect, useMemo, useState } from "react";
import { listCustomers } from "@/lib/admin";
import { Table, Td, SearchInput, RowMenu, ListSkeleton, type MenuItem } from "../ui";

type Customer = {
  uid: string;
  email?: string;
  name?: string | null;
  phone?: string | null;
  createdAt?: number;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listCustomers()
      .then((c) => setCustomers(c as Customer[]))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.phone || "").includes(q)
    );
  }, [customers, query]);

  const menuItems = (c: Customer): MenuItem[] =>
    c.email
      ? [{ label: "Email customer", onClick: () => (window.location.href = `mailto:${c.email}`) }]
      : [];

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-black tracking-tight mb-5">CUSTOMERS</h2>
        <ListSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <h2 className="text-xl font-black tracking-tight">
          CUSTOMERS ({customers.length})
        </h2>
        <div className="md:ml-auto">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search name, email, phone..."
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-xl p-10 text-center">
          <p className="text-neutral-500 text-sm">
            {customers.length === 0
              ? "No customers yet. They appear here after signing up."
              : "No customers match."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Table head={["Customer", "Email", "Phone", "Joined", ""]}>
              {filtered.map((c) => (
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
                  <Td>
                    {c.email && (
                      <RowMenu items={menuItems(c)} label={`Actions for ${c.name || c.email}`} />
                    )}
                  </Td>
                </tr>
              ))}
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2.5">
            {filtered.map((c) => (
              <div
                key={c.uid}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-neutral-300">
                      {(c.name || c.email || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{c.name || "No name"}</p>
                    <p className="text-xs text-neutral-500 truncate">{c.email}</p>
                    {c.phone && (
                      <p className="text-xs text-neutral-500 mt-0.5">{c.phone}</p>
                    )}
                  </div>
                  {c.email && (
                    <RowMenu items={menuItems(c)} label={`Actions for ${c.name || c.email}`} />
                  )}
                </div>
                <p className="text-[11px] text-neutral-600 mt-3">
                  Joined{" "}
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
