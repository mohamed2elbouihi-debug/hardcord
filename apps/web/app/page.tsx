import { AuthCard } from "../components/AuthCard";
import { Button } from "../components/ui/button";

const servers = ["HC", "UX", "QA", "OPS"];
const channels = ["general", "announcements", "support", "voice-hub"];
const members = [
  { name: "Nova", status: "online" },
  { name: "Atlas", status: "idle" },
  { name: "Rin", status: "dnd" },
  { name: "Quill", status: "offline" }
];

const activities = [
  { title: "Hardcord Town Hall", subtitle: "Community Stage" },
  { title: "UI Co-Op", subtitle: "Design Studio" }
];

const storeItems = [
  { title: "Nebula Badge", subtitle: "120 Coins" },
  { title: "Pulse Avatar", subtitle: "200 Coins" }
];

const effects = [
  { title: "Starlight Aura", subtitle: "Epic" },
  { title: "Glitch Trails", subtitle: "Legendary" }
];

export default function HomePage() {
  return (
    <main className="grid h-screen grid-cols-[72px_240px_1fr_300px] bg-[#0f1117]">
      <aside className="flex flex-col items-center gap-3 border-r border-[#2b2f3a] bg-[#1e2128] py-4">
        {servers.map((server, index) => (
          <button
            key={server}
            className={`grid h-12 w-12 place-items-center rounded-2xl bg-[#2b2f3a] text-sm font-semibold text-white transition ${
              index === 0 ? "bg-indigo-500" : "hover:bg-indigo-400"
            }`}
          >
            {server}
          </button>
        ))}
      </aside>

      <aside className="flex flex-col border-r border-[#2b2f3a] bg-[#23272f] p-4 text-sm">
        <div className="mb-4 text-base font-semibold">Hardcord HQ</div>
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-slate-400">Text Channels</div>
          {channels.slice(0, 3).map((channel, index) => (
            <div
              key={channel}
              className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                index === 0 ? "bg-[#2f3340] text-white" : "text-slate-300"
              }`}
            >
              <span className="opacity-70">#</span>
              {channel}
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <div className="text-xs uppercase tracking-wide text-slate-400">Voice Channels</div>
          <div className="flex items-center gap-2 rounded-md px-2 py-1 text-slate-300">
            <span>🔊</span>
            {channels[3]}
          </div>
        </div>
      </aside>

      <section className="flex flex-col bg-[#2b2f3a]">
        <header className="flex items-center justify-between border-b border-[#333845] px-6 py-4">
          <div>
            <div className="text-lg font-semibold">#general</div>
            <div className="text-xs text-slate-400">Nova و Atlas يكتبان الآن</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">😊 Emoji</Button>
            <Button variant="ghost" size="sm">📎 Upload</Button>
            <Button variant="ghost" size="sm">🔔 Alerts</Button>
          </div>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {members.slice(0, 3).map((member) => (
            <div key={member.name} className="flex gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#3b3f4c] font-semibold">
                {member.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold">{member.name}</span>
                  <span className="text-xs text-slate-400">منذ دقيقة</span>
                </div>
                <div className="text-sm text-slate-200">
                  جاهزون لإطلاق تجربة دردشة فورية مع ردود فعل وتحرير الرسائل.
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#333845] px-6 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#1f232c] px-4 py-3 text-sm text-slate-300">
            <span>＋</span>
            <input
              className="flex-1 bg-transparent outline-none"
              placeholder="اكتب رسالة في #general"
            />
            <span>🎤</span>
            <span>😊</span>
          </div>
        </div>
      </section>

      <aside className="flex flex-col gap-4 overflow-y-auto border-l border-[#2b2f3a] bg-[#1f222b] p-4">
        <AuthCard />
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-slate-400">Members</div>
          {members.map((member) => (
            <div key={member.name} className="flex items-center gap-2 rounded-lg px-2 py-1">
              <span
                className={`h-2 w-2 rounded-full ${
                  member.status === "online"
                    ? "bg-emerald-400"
                    : member.status === "idle"
                    ? "bg-amber-400"
                    : member.status === "dnd"
                    ? "bg-red-500"
                    : "bg-slate-500"
                }`}
              />
              <span className="text-sm">{member.name}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[#2b2f3a] bg-[#1b1f27] p-3">
          <div className="text-xs uppercase tracking-wide text-slate-400">Voice</div>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-[#20242d] px-3 py-2 text-sm">
            <span>voice-hub</span>
            <span className="text-xs text-emerald-300">Live</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#2b2f3a] bg-[#1b1f27] p-3">
          <div className="text-xs uppercase tracking-wide text-slate-400">Activity</div>
          <div className="mt-2 space-y-2">
            {activities.map((activity) => (
              <div key={activity.title} className="flex justify-between rounded-lg bg-[#20242d] px-3 py-2 text-sm">
                <span className="font-medium">{activity.title}</span>
                <span className="text-xs text-slate-400">{activity.subtitle}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#2b2f3a] bg-[#1b1f27] p-3">
          <div className="text-xs uppercase tracking-wide text-slate-400">Store</div>
          <div className="mt-2 space-y-2">
            {storeItems.map((item) => (
              <div key={item.title} className="flex justify-between rounded-lg bg-[#20242d] px-3 py-2 text-sm">
                <span className="font-medium">{item.title}</span>
                <span className="text-xs text-slate-400">{item.subtitle}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#2b2f3a] bg-[#1b1f27] p-3">
          <div className="text-xs uppercase tracking-wide text-slate-400">Profile Effects</div>
          <div className="mt-2 space-y-2">
            {effects.map((effect) => (
              <div key={effect.title} className="flex justify-between rounded-lg bg-[#20242d] px-3 py-2 text-sm">
                <span className="font-medium">{effect.title}</span>
                <span className="text-xs text-slate-400">{effect.subtitle}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}
