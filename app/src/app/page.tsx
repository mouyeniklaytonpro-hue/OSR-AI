"use client";

import { useEffect, useState } from "react";
import {
  AGENT_IDS,
  AGENT_PROFILES,
  type AgentId,
} from "@/lib/agents";
import type { CompanyProfile } from "@/lib/company-profile";
import ChatMarkdown from "./ChatMarkdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  selectedAgents?: readonly AgentId[];
  humanApprovalRequired?: boolean;
}

interface BusinessBrainResponse {
  answer: string;
  mission: {
    selectedAgents: AgentId[];
    humanApproval: { required: boolean };
  };
}

function isCompanyProfile(value: unknown): value is CompanyProfile {
  if (typeof value !== "object" || value === null) return false;
  const profile = value as Record<string, unknown>;
  return (
    typeof profile.id === "string" &&
    typeof profile.name === "string" &&
    Array.isArray(profile.services) &&
    profile.services.every((service) => typeof service === "string") &&
    (profile.deliveryModel === undefined ||
      typeof profile.deliveryModel === "string")
  );
}

function isBusinessBrainResponse(
  value: unknown,
): value is BusinessBrainResponse {
  if (typeof value !== "object" || value === null) return false;
  const result = value as Record<string, unknown>;
  if (
    typeof result.answer !== "string" ||
    typeof result.mission !== "object" ||
    result.mission === null
  ) {
    return false;
  }
  const mission = result.mission as Record<string, unknown>;
  return (
    Array.isArray(mission.selectedAgents) &&
    mission.selectedAgents.length > 0 &&
    mission.selectedAgents.every(
      (agentId) =>
        typeof agentId === "string" &&
        (AGENT_IDS as readonly string[]).includes(agentId),
    ) &&
    typeof mission.humanApproval === "object" &&
    mission.humanApproval !== null &&
    typeof (mission.humanApproval as Record<string, unknown>).required ===
      "boolean"
  );
}

const agentPresentation: Record<AgentId, { icon: string; color: string }> = {
  "marketing-seo": { icon: "✦", color: "#C6A15B" },
  "content-creative": { icon: "◈", color: "#8FA8D8" },
  "business-strategist": { icon: "⌘", color: "#B69AE8" },
  "sales-analytics": { icon: "↗", color: "#65C79B" },
  "training-executive": { icon: "◎", color: "#D9A17D" },
};

const departments = [
  { number: "01", agentId: "marketing-seo" },
  { number: "02", agentId: "business-strategist" },
  { number: "03", agentId: "sales-analytics" },
  { number: "04", agentId: "content-creative" },
  { number: "05", agentId: "training-executive" },
] as const;

const navItems = [
  "Overview",
  "AI Agents",
  "Departments",
  "Workspace",
  "Analytics",
  "Settings",
] as const;

type View = (typeof navItems)[number];

const navIcons: Record<View, string> = {
  Overview: "◫",
  "AI Agents": "✧",
  Departments: "▦",
  Workspace: "▤",
  Analytics: "↗",
  Settings: "⚙",
};

export default function Home() {
  const [active, setActive] = useState<View>("Overview");
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null,
  );
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCompanyProfile() {
      try {
        const response = await fetch("/api/company-profile", {
          signal: controller.signal,
        });
        if (!response.ok) return;

        const profile: unknown = await response.json();
        if (isCompanyProfile(profile)) setCompanyProfile(profile);
      } catch {
        if (!controller.signal.aborted) setCompanyProfile(null);
      }
    }

    void loadCompanyProfile();
    return () => controller.abort();
  }, []);

  function selectAgent(agentId: AgentId) {
    setSelectedAgent(agentId);
    setActive("Workspace");
  }

  async function sendMessage() {
    const message = prompt.trim();
    if (!message || isSending) return;

    setMessages((previous) => [...previous, { role: "user", content: message }]);
    setPrompt("");
    setRequestError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/business-brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          ...(selectedAgent ? { preferredAgentId: selectedAgent } : {}),
        }),
      });

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new Error("La reponse du serveur est illisible.");
      }

      if (!response.ok) {
        const errorMessage =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Le Business Brain n'a pas pu traiter la demande.";
        throw new Error(errorMessage);
      }

      if (!isBusinessBrainResponse(payload)) {
        throw new Error("La reponse du Business Brain est invalide.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: payload.answer,
          selectedAgents: payload.mission.selectedAgents,
          humanApprovalRequired: payload.mission.humanApproval.required,
        },
      ]);
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "Impossible de joindre le Business Brain.",
      );
    } finally {
      setIsSending(false);
    }
  }

  const agentCards = AGENT_IDS.map((agentId) => {
    const agent = AGENT_PROFILES[agentId];
    const presentation = agentPresentation[agentId];

    return (
      <button
        key={agent.name}
        type="button"
        aria-label={`Select ${agent.name} for Workspace`}
        onClick={() => selectAgent(agentId)}
        style={styles.agentCard}
      >
        <div
          style={{
            ...styles.agentIcon,
            color: presentation.color,
            borderColor: `${presentation.color}55`,
          }}
        >
          {presentation.icon}
        </div>
        <h3 style={styles.agentName}>{agent.name}</h3>
        <p style={styles.agentRole}>{agent.role}</p>
        <div style={styles.agentFooter}>
          <span>
            <span style={styles.onlineDot} /> Available
          </span>
          <span style={{ color: "#C6A15B" }}>Select ↗</span>
        </div>
      </button>
    );
  });

  const departmentRows = departments.map(({ number, agentId }) => {
    const agent = AGENT_PROFILES[agentId];

    return (
      <div key={number} style={styles.department}>
        <span style={styles.departmentNumber}>{number}</span>
        <span style={styles.departmentName}>{agent.department}</span>
        <button
          type="button"
          onClick={() => selectAgent(agentId)}
          style={styles.departmentAgent}
        >
          {agent.name}
        </button>
        <span style={styles.departmentCount}>1 agent</span>
      </div>
    );
  });

  return (
    <main style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoMark}>Ø</div>
          <div>
            <div style={styles.logoName}>OSR<span style={{color:"#C6A15B"}}>-AI</span></div>
            <div style={styles.logoCaption}>INTELLIGENCE SYSTEM</div>
          </div>
        </div>

        <div style={styles.navLabel}>MAIN MENU</div>

        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            type="button"
            style={{
              ...styles.navItem,
              ...(active === item ? styles.navActive : {}),
            }}
          >
            <span>{navIcons[item]}</span>
            {item}
            {item === "AI Agents" && (
              <span style={styles.navCount}>{AGENT_IDS.length}</span>
            )}
          </button>
        ))}

        <div style={styles.sidebarBottom}>
          <div style={styles.systemBox}>
            <div style={styles.onlineDot} />
            <span>All systems operational</span>
          </div>
          <div style={styles.profile}>
            <div style={styles.avatar}>OSR</div>
            <div>
              <div style={styles.profileName}>
                {companyProfile?.name ?? "Company profile"}
              </div>
              <div style={styles.profileRole}>Active company profile</div>
            </div>
          </div>
        </div>
      </aside>

      <section style={styles.main}>
        <header style={styles.header}>
          <div>
            <div style={styles.breadcrumb}>OSR-AI / {active}</div>
            <h1 style={styles.pageTitle}>{active}</h1>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.status}>
              <span style={styles.onlineDot} />
              SYSTEM ONLINE
            </div>
            <button type="button" aria-label="Search" style={styles.headerButton}>⌕</button>
            <button
              type="button"
              aria-label="Open Settings"
              onClick={() => setActive("Settings")}
              style={styles.headerButton}
            >
              ⚙
            </button>
          </div>
        </header>

        <div style={styles.content}>
          {active === "Overview" && (
            <>
              <section style={styles.hero}>
                <div>
                  <div style={styles.eyebrow}>
                    <span style={{ color: "#C6A15B" }}>✦</span>
                    PREMIUM AI BUSINESS WORKSPACE
                  </div>
                  <h2 style={styles.heroTitle}>
                    Your business.
                    <br />
                    <span style={{ color: "#C6A15B" }}>Your intelligence.</span>
                  </h2>
                  <p style={styles.heroText}>
                    Centralisez vos operations, pilotez vos agents IA
                    et developpez votre activite depuis un espace unique.
                  </p>
                </div>
                <div style={styles.heroOrb}>
                  <div style={styles.orbInner}>ØSR</div>
                </div>
              </section>

              <div style={styles.stats}>
                {[
                  [String(AGENT_IDS.length), "AI AGENTS", `+${departments.length} departments`],
                  [String(departments.length).padStart(2, "0"), "DEPARTMENTS", "Business divisions"],
                  ["24/7", "AVAILABILITY", "Always operational"],
                  ["01", "WORKSPACE", "Centralized platform"],
                ].map(([value, label, detail]) => (
                  <div key={label} style={styles.statCard}>
                    <div style={styles.statValue}>{value}</div>
                    <div style={styles.statLabel}>{label}</div>
                    <div style={styles.statDetail}>{detail}</div>
                  </div>
                ))}
              </div>

              <div style={styles.sectionHeading}>
                <div>
                  <div style={styles.sectionEyebrow}>INTELLIGENCE NETWORK</div>
                  <h2 style={styles.sectionTitle}>Your AI Agents</h2>
                </div>
                <button
                  type="button"
                  style={styles.outlineButton}
                  onClick={() => setActive("AI Agents")}
                >
                  View all agents →
                </button>
              </div>

              <div style={styles.agentGrid}>{agentCards}</div>

              <div style={styles.sectionHeading}>
                <div>
                  <div style={styles.sectionEyebrow}>BUSINESS ORGANIZATION</div>
                  <h2 style={styles.sectionTitle}>Departments</h2>
                </div>
              </div>

              <div style={styles.departmentList}>{departmentRows}</div>
            </>
          )}

          {active === "AI Agents" && (
            <>
              <div style={styles.sectionHeading}>
                <div>
                  <div style={styles.sectionEyebrow}>INTELLIGENCE NETWORK</div>
                  <h2 style={styles.sectionTitle}>Your AI Agents</h2>
                </div>
              </div>
              <div style={styles.agentGrid}>{agentCards}</div>
            </>
          )}

          {active === "Departments" && (
            <>
              <div style={styles.sectionHeading}>
                <div>
                  <div style={styles.sectionEyebrow}>BUSINESS ORGANIZATION</div>
                  <h2 style={styles.sectionTitle}>Departments</h2>
                </div>
              </div>
              <div style={styles.departmentList}>{departmentRows}</div>
            </>
          )}

          {active === "Workspace" && (
            <section style={styles.brain}>
              <div style={styles.brainHeader}>
                <div>
                  <div style={styles.sectionEyebrow}>OSR INTELLIGENCE</div>
                  <h2 style={styles.sectionTitle}>AI Command Center</h2>
                </div>
                <span style={styles.status}>
                  <span style={styles.onlineDot} /> READY
                </span>
              </div>

              <div style={styles.selectedAgent}>
                {selectedAgent
                  ? `Agent selectionne : ${AGENT_PROFILES[selectedAgent].name}`
                  : "Le Business Brain selectionnera les agents adaptes a votre demande."}
              </div>

              <div style={styles.chat}>
                {messages.length === 0 ? (
                  <div style={styles.emptyChat}>
                    <div style={{ fontSize: 30, color: "#C6A15B" }}>✧</div>
                    <h3 style={{ color: "#F5F0E8" }}>How can OSR help you?</h3>
                    <p style={{ color: "#8995A8" }}>
                      Posez une question ou decrivez votre prochain projet.
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={index} style={styles.message}>
                      <span style={{ color: "#C6A15B" }}>
                        {message.role === "user"
                          ? "YOU"
                          : `OSR-AI${message.selectedAgents ? ` · ${message.selectedAgents.map((agentId) => AGENT_PROFILES[agentId].name).join(", ")}` : ""}`}
                      </span>
                      {message.role === "assistant" ? (
                        <ChatMarkdown content={message.content} />
                      ) : (
                        <p style={{ whiteSpace: "pre-wrap" }}>
                          {message.content}
                        </p>
                      )}
                      {message.humanApprovalRequired && (
                        <p role="note" style={styles.approvalNotice}>
                          Validation humaine requise avant toute action externe.
                        </p>
                      )}
                    </div>
                  ))
                )}
                {requestError && (
                  <p role="alert" style={styles.errorMessage}>
                    {requestError}
                  </p>
                )}
                {isSending && (
                  <p role="status" style={styles.loadingMessage}>
                    Le Business Brain prepare une reponse...
                  </p>
                )}
              </div>

              <div style={styles.inputArea}>
                <input
                  value={prompt}
                  disabled={isSending}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void sendMessage();
                  }}
                  placeholder="Describe your business objective..."
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={isSending || !prompt.trim()}
                  style={styles.sendButton}
                >
                  {isSending ? "SENDING..." : "SEND ↗"}
                </button>
              </div>
              <p style={styles.disclaimer}>
                Les recommandations sont generees avec OpenAI. Toute action
                externe reste soumise a une validation humaine.
              </p>
            </section>
          )}

          {active === "Analytics" && (
            <>
              <div style={styles.sectionHeading}>
                <div>
                  <div style={styles.sectionEyebrow}>BUSINESS INTELLIGENCE</div>
                  <h2 style={styles.sectionTitle}>Analytics</h2>
                </div>
              </div>
              <p style={styles.pageDescription}>
                Donnees de configuration disponibles et indicateurs qui ne
                peuvent pas encore etre mesures.
              </p>
              <h3 style={styles.subsectionTitle}>Available configuration data</h3>
              <div style={styles.infoGrid}>
                {[
                  ["AI agents", String(AGENT_IDS.length), "Agents configured in the application"],
                  ["Departments", String(departments.length), "Departments configured in the application"],
                  ["Workspaces", "1", "Configured workspace"],
                ].map(([label, value, detail]) => (
                  <div key={label} style={styles.infoCard}>
                    <div style={styles.infoLabel}>{label}</div>
                    <div style={styles.statValue}>{value}</div>
                    <div style={styles.infoDetail}>{detail}</div>
                  </div>
                ))}
              </div>
              <h3 style={styles.subsectionTitle}>Not available yet</h3>
              <div style={styles.infoGrid}>
                {[
                  "Agent usage and activity",
                  "Conversation volume",
                  "Business performance and conversions",
                ].map((metric) => (
                  <div key={metric} style={styles.unavailableCard}>
                    <div style={styles.infoLabel}>{metric}</div>
                    <div style={styles.unavailableValue}>Not available</div>
                    <div style={styles.infoDetail}>
                      Requires the AI engine and data integrations, which are
                      not connected yet.
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {active === "Settings" && (
            <>
              <div style={styles.sectionHeading}>
                <div>
                  <div style={styles.sectionEyebrow}>APPLICATION CONFIGURATION</div>
                  <h2 style={styles.sectionTitle}>Settings</h2>
                </div>
              </div>
              <p style={styles.pageDescription}>
                Current application configuration and integration status.
              </p>
              <div style={styles.settingsList}>
                {[
                  ["Application", "OSR-AI", "Intelligence System"],
                  [
                    "Company profile",
                    companyProfile?.name ?? "Loading profile...",
                    companyProfile?.services.join(" · ") ?? "",
                  ],
                  [
                    "Delivery model",
                    companyProfile?.deliveryModel ?? "Loading profile...",
                    "Current active company profile",
                  ],
                  ["Appearance", "Dark theme", "Gold accent"],
                  ["AI engine", "OpenAI", "Server-side integration via OPENAI_API_KEY"],
                  ["Integrations", "Not connected", "Planned for a future step"],
                ].map(([label, value, detail]) => (
                  <div key={label} style={styles.settingRow}>
                    <span style={styles.infoLabel}>{label}</span>
                    <span style={styles.settingValue}>{value}</span>
                    <span style={styles.infoDetail}>{detail}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <footer style={styles.footer}>
            <span>OSR-AI © 2026</span>
            <span>YOUR BUSINESS. YOUR AI. YOUR FUTURE.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: "100vh",
    display: "flex",
    background: "#080D18",
    color: "#F5F0E8",
    fontFamily: "Arial, sans-serif",
  },
  sidebar: {
    width: 245,
    minHeight: "100vh",
    background: "#0B1220",
    borderRight: "1px solid #202B3D",
    padding: "28px 18px",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  logo: { display: "flex", alignItems: "center", gap: 12, marginBottom: 55 },
  logoMark: {
    width: 42,
    height: 42,
    border: "1px solid #C6A15B",
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    color: "#C6A15B",
    fontSize: 27,
  },
  logoName: { fontSize: 21, fontWeight: 800, letterSpacing: 2 },
  logoCaption: { color: "#8995A8", fontSize: 8, letterSpacing: 2 },
  navLabel: { color: "#66748A", fontSize: 10, letterSpacing: 2, marginBottom: 15 },
  navItem: {
    border: "none",
    background: "transparent",
    color: "#8995A8",
    padding: "13px 12px",
    display: "flex",
    gap: 13,
    alignItems: "center",
    textAlign: "left",
    borderRadius: 8,
    marginBottom: 5,
    cursor: "pointer",
    fontSize: 13,
  },
  navActive: {
    background: "#18243A",
    color: "#C6A15B",
    borderLeft: "2px solid #C6A15B",
  },
  navCount: {
    marginLeft: "auto",
    background: "#28374B",
    padding: "3px 7px",
    borderRadius: 10,
    fontSize: 10,
  },
  sidebarBottom: { marginTop: "auto" },
  systemBox: {
    padding: 12,
    border: "1px solid #202B3D",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 9,
    color: "#8995A8",
    fontSize: 10,
    marginBottom: 5,
  },
  onlineDot: {
    display: "inline-block",
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#65C79B",
    boxShadow: "0 0 8px #65C79B",
  },
  profile: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    borderTop: "1px solid #202B3D",
    paddingTop: 5,
  },
  avatar: {
    background: "#C6A15B",
    color: "#080D18",
    borderRadius: 8,
    padding: 10,
    fontSize: 11,
    fontWeight: "bold",
  },
  profileName: { fontSize: 12 },
  profileRole: { fontSize: 10, color: "#8995A8", marginTop: 4 },
  main: { flex: 1, minWidth: 0 },
  header: {
    height: 85,
    borderBottom: "1px solid #202B3D",
    padding: "0 35px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breadcrumb: { color: "#8995A8", fontSize: 10, marginBottom: 7 },
  pageTitle: { fontSize: 19, margin: 0, fontWeight: 600 },
  headerRight: { display: "flex", gap: 12, alignItems: "center" },
  status: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #28374B",
    padding: "8px 12px",
    borderRadius: 30,
    color: "#8995A8",
    fontSize: 9,
  },
  headerButton: {
    background: "#121C2D",
    border: "1px solid #28374B",
    borderRadius: 8,
    color: "#C6A15B",
    padding: 10,
    cursor: "pointer",
  },
  content: { maxWidth: 1250, margin: "auto", padding: 35 },
  hero: {
    background: "linear-gradient(120deg,#101B2D,#15223A)",
    border: "1px solid #28374B",
    borderRadius: 15,
    padding: "45px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  eyebrow: { fontSize: 10, letterSpacing: 3, color: "#8995A8" },
  heroTitle: { fontSize: 43, lineHeight: 1.15, margin: "20px 0" },
  heroText: { color: "#8995A8", maxWidth: 470, fontSize: 13, lineHeight: 1.8 },
  heroOrb: {
    width: 170,
    height: 170,
    border: "1px solid #C6A15B",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 0 65px #C6A15B22, inset 0 0 35px #C6A15B15",
  },
  orbInner: {
    width: 110,
    height: 110,
    border: "1px solid #C6A15B77",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    color: "#C6A15B",
    fontSize: 27,
    letterSpacing: 3,
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(4,minmax(0,1fr))",
    gap: 15,
    margin: "25px 0 45px",
  },
  statCard: {
    background: "#101827",
    border: "1px solid #202B3D",
    borderRadius: 10,
    padding: 5,
  },
  statValue: { color: "#C6A15B", fontSize: 27, fontWeight: 700 },
  statLabel: { fontSize: 10, letterSpacing: 1.5, marginTop: 9 },
  statDetail: { fontSize: 10, color: "#8995A8", marginTop: 7 },
  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    marginTop: 35,
  },
  sectionEyebrow: { fontSize: 9, letterSpacing: 2, color: "#C6A15B" },
  sectionTitle: { fontSize: 21, margin: "8px 0 0" },
  outlineButton: {
    background: "transparent",
    border: "1px solid #28374B",
    color: "#C6A15B",
    borderRadius: 7,
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 11,
  },
  agentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5,minmax(0,1fr))",
    gap: 12,
  },
  agentCard: {
    background: "#101827",
    border: "1px solid #202B3D",
    borderRadius: 10,
    padding: 17,
    textAlign: "left",
    cursor: "pointer",
    color: "#F5F0E8",
    minWidth: 0,
  },
  agentIcon: {
    width: 36,
    height: 36,
    border: "1px solid",
    borderRadius: 9,
    display: "grid",
    placeItems: "center",
    fontSize: 19,
  },
  agentName: { fontSize: 12, marginTop: 17, lineHeight: 1.4 },
  agentRole: { color: "#8995A8", fontSize: 10, minHeight: 28, lineHeight: 1.5 },
  agentFooter: {
    borderTop: "1px solid #202B3D",
    paddingTop: 12,
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#8995A8",
  },
  departmentList: {
    border: "1px solid #202B3D",
    borderRadius: 10,
    overflow: "hidden",
  },
  department: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    padding: "17px 20px",
    borderBottom: "1px solid #202B3D",
    fontSize: 12,
  },
  departmentNumber: { color: "#C6A15B", fontSize: 11 },
  departmentName: { flex: 1 },
  departmentCount: { color: "#8995A8", fontSize: 10 },
  departmentAgent: {
    background: "transparent",
    border: "none",
    color: "#C6A15B",
    cursor: "pointer",
    fontSize: 10,
    textAlign: "left",
  },
  brain: {
    background: "#101827",
    border: "1px solid #28374B",
    borderRadius: 12,
    padding: 24,
    marginTop: 45,
  },
  brainHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedAgent: {
    color: "#C6A15B",
    fontSize: 11,
    marginTop: 18,
  },
  chat: {
    background: "#080D18",
    border: "1px solid #202B3D",
    borderRadius: 9,
    minHeight: 150,
    maxHeight: 260,
    overflowY: "auto",
    padding: 5,
    marginTop: 5,
  },
  emptyChat: { textAlign: "center", padding: 5 },
  message: {
    borderBottom: "1px solid #202B3D",
    padding: 12,
    fontSize: 12,
  },
  errorMessage: { color: "#F08A8A", fontSize: 11, padding: "0 12px" },
  loadingMessage: { color: "#8995A8", fontSize: 11, padding: "0 12px" },
  approvalNotice: { color: "#C6A15B", fontSize: 11, marginTop: 10 },
  inputArea: { display: "flex", gap: 10, marginTop: 15 },
  input: {
    flex: 1,
    minWidth: 0,
    background: "#080D18",
    border: "1px solid #28374B",
    borderRadius: 8,
    padding: 15,
    color: "#F5F0E8",
    outline: "none",
    fontSize: 12,
  },
  sendButton: {
    background: "#C6A15B",
    color: "#080D18",
    border: "none",
    borderRadius: 8,
    padding: "0 22px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: 10,
  },
  disclaimer: { color: "#66748A", fontSize: 9, marginTop: 12 },
  pageDescription: {
    color: "#8995A8",
    fontSize: 12,
    lineHeight: 1.7,
    margin: "15px 0 25px",
  },
  subsectionTitle: {
    color: "#F5F0E8",
    fontSize: 13,
    fontWeight: 600,
    margin: "28px 0 12px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,minmax(0,1fr))",
    gap: 12,
  },
  infoCard: {
    background: "#101827",
    border: "1px solid #202B3D",
    borderRadius: 10,
    padding: 18,
  },
  infoLabel: { color: "#8995A8", fontSize: 10, letterSpacing: 0.5 },
  infoDetail: {
    color: "#8995A8",
    fontSize: 10,
    lineHeight: 1.6,
    marginTop: 8,
  },
  unavailableCard: {
    background: "#101827",
    border: "1px solid #202B3D",
    borderRadius: 10,
    padding: 18,
    minHeight: 125,
  },
  unavailableValue: {
    color: "#C6A15B",
    fontSize: 16,
    fontWeight: 600,
    marginTop: 12,
  },
  settingsList: {
    background: "#101827",
    border: "1px solid #202B3D",
    borderRadius: 10,
    overflow: "hidden",
  },
  settingRow: {
    display: "grid",
    gridTemplateColumns: "minmax(120px, 1fr) minmax(150px, 1fr) minmax(180px, 2fr)",
    alignItems: "center",
    gap: 15,
    padding: "17px 20px",
    borderBottom: "1px solid #202B3D",
  },
  settingValue: { color: "#F5F0E8", fontSize: 12 },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    color: "#66748A",
    fontSize: 9,
    letterSpacing: 1.5,
    padding: "30px 0",
    marginTop: 5,
    borderTop: "1px solid #202B3D",
  },
};