"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

/** Locks /operator to admin uids (admins collection). */
export default function OperatorGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    isAdmin(user.uid, user.email).then((ok) => {
      if (!ok) router.replace("/");
      else setAllowed(true);
    });
  }, [user, loading, router]);

  if (allowed !== true) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="animate-pulse text-sm text-neutral-400">
          Verifying operator access...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
