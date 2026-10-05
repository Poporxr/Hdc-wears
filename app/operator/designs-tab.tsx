"use client";

import { useEffect, useState } from "react";
import {
  listDesignRequests,
  updateDesignRequestStatus,
  deleteDesignRequest,
  DESIGN_STATUSES,
  type DesignRequest,
} from "@/lib/admin";
import { useToast } from "@/components/toast";

const STATUS_STYLES: Record<DesignRequest["status"], string> = {
  new: "bg-white text-black",
  contacted: "bg-sky-500/20 text-sky-300 border border-sky-500/40",
  quoted: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
  done: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
};

export default function DesignsTab() {
  const toast = useToast();
  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | DesignRequest["status"]>("all");

  const load = () => {
    setLoading(true);
    listDesignRequests()
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setStatus = async (id: string, status: DesignRequest["status"]) => {
    try {
      await updateDesignRequestStatus(id, status);
      setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch {
      toast({ title: "Could not update status", variant: "error" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this design request?")) return;
    try {
      await deleteDesignRequest(id);
      setRequests((rs) => rs.filter((r) => r.id !== id));
      toast({ title: "Request deleted", variant: "info" });
    } catch {
      toast({ title: "Could not delete", variant: "error" });
    }
  };

  const visible =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const counts = (s: DesignRequest["status"]) =>
    requests.filter((r) => r.status === s).length;

  if (loading) {
    return (
      <p className="animate-pulse text-neutral-500 text-sm">
        Loading design requests...
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black tracking-tight">
          CUSTOM DESIGNS ({requests.length})
        </h2>
        <button
          onClick={load}
          className="text-xs font-bold text-neutral-400 hover:text-white border border-neutral-800 rounded-lg px-3 py-2"
        >
          REFRESH
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", ...DESIGN_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-[11px] font-bold tracking-wide px-3 py-2 rounded-full border transition ${
              filter === s
                ? "bg-white text-black border-white"
                : "text-neutral-400 border-neutral-800 hover:border-neutral-600"
            }`}
          >
            {s.toUpperCase()}
            {s !== "all" && ` (${counts(s)})`}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-xl p-10 text-center">
          <p className="text-neutral-500 text-sm">
            No design requests here yet. They land here when customers submit
            the custom design form.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((r) => {
            const open = openId === r.id;
            return (
              <div
                key={r.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenId(open ? null : r.id)}
                  className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-neutral-800/50 transition"
                >
                  <span
                    className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[r.status]}`}
                  >
                    {r.status.toUpperCase()}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold truncate">
                      {r.name}
                      <span className="font-normal text-neutral-500 ml-2">
                        {r.garment}
                      </span>
                    </span>
                    <span className="block text-xs text-neutral-500 truncate">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </span>
                  <span className="text-neutral-500 text-lg shrink-0">
                    {open ? "−" : "+"}
                  </span>
                </button>

                {open && (
                  <div className="px-4 pb-4 pt-1 border-t border-neutral-800">
                    <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap mt-3">
                      {r.description}
                    </p>
                    {r.imageUrl && (
                      <a
                        href={r.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block mt-3"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.imageUrl}
                          alt="Design reference"
                          className="rounded-lg max-h-56 object-cover border border-neutral-800 hover:opacity-90 transition"
                        />
                      </a>
                    )}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 text-sm">
                      <span className="text-neutral-500">Email</span>
                      <a
                        href={`mailto:${r.email}`}
                        className="text-sky-300 hover:underline truncate"
                      >
                        {r.email}
                      </a>
                      <span className="text-neutral-500">Phone</span>
                      <a
                        href={`tel:${r.phone}`}
                        className="text-sky-300 hover:underline"
                      >
                        {r.phone}
                      </a>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {DESIGN_STATUSES.filter((s) => s !== r.status).map(
                        (s) => (
                          <button
                            key={s}
                            onClick={() => setStatus(r.id, s)}
                            className="text-[11px] font-bold tracking-wide px-3 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:border-white hover:text-white transition"
                          >
                            MARK {s.toUpperCase()}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => remove(r.id)}
                        className="text-[11px] font-bold tracking-wide px-3 py-2 rounded-lg border border-red-900 text-red-400 hover:bg-red-950 transition ml-auto"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
