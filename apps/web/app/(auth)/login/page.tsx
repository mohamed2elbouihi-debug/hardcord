"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "../../../components/ui/button";
import { apiFetch } from "../../../lib/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError("يرجى إدخال بيانات صحيحة");
      return;
    }
    setError(null);
    await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(parsed.data)
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
      <div className="w-full max-w-md rounded-xl border border-[#2b2f3a] bg-[#1b1f27] p-6">
        <h1 className="mb-4 text-xl font-semibold">تسجيل الدخول</h1>
        <div className="space-y-3 text-sm">
          <input
            className="w-full rounded-lg bg-[#20242d] px-3 py-2 text-white"
            placeholder="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="w-full rounded-lg bg-[#20242d] px-3 py-2 text-white"
            placeholder="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && <div className="text-xs text-red-400">{error}</div>}
          <Button onClick={handleSubmit}>دخول</Button>
        </div>
      </div>
    </div>
  );
}
