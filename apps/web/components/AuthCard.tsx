"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "./ui/button";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const AuthCard = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = () => {
    const result = schema.safeParse({ email, password });
    setError(result.success ? null : "تأكد من البريد وكلمة المرور");
  };

  return (
    <div className="rounded-xl border border-[#2b2f3a] bg-[#1b1f27] p-4">
      <div className="mb-2 text-sm font-semibold">تجربة تسجيل الدخول</div>
      <div className="space-y-2 text-sm">
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
        <Button size="sm" onClick={onSubmit}>
          تحقّق
        </Button>
      </div>
    </div>
  );
};
