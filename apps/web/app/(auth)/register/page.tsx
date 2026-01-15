"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "../../../components/ui/button";
import { apiFetch } from "../../../lib/api";

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  displayName: z.string().min(3),
  password: z.string().min(8)
});

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    username: "",
    displayName: "",
    password: ""
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError("يرجى إدخال بيانات صحيحة");
      return;
    }
    setError(null);
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(parsed.data)
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
      <div className="w-full max-w-md rounded-xl border border-[#2b2f3a] bg-[#1b1f27] p-6">
        <h1 className="mb-4 text-xl font-semibold">إنشاء حساب</h1>
        <div className="space-y-3 text-sm">
          <input
            className="w-full rounded-lg bg-[#20242d] px-3 py-2 text-white"
            placeholder="email"
            value={form.email}
            onChange={handleChange("email")}
          />
          <input
            className="w-full rounded-lg bg-[#20242d] px-3 py-2 text-white"
            placeholder="username"
            value={form.username}
            onChange={handleChange("username")}
          />
          <input
            className="w-full rounded-lg bg-[#20242d] px-3 py-2 text-white"
            placeholder="display name"
            value={form.displayName}
            onChange={handleChange("displayName")}
          />
          <input
            className="w-full rounded-lg bg-[#20242d] px-3 py-2 text-white"
            placeholder="password"
            type="password"
            value={form.password}
            onChange={handleChange("password")}
          />
          {error && <div className="text-xs text-red-400">{error}</div>}
          <Button onClick={handleSubmit}>تسجيل</Button>
        </div>
      </div>
    </div>
  );
}
