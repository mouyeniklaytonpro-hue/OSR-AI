"use client";

import { useState } from "react";

const agents = [
  {
    name: "Marketing & SEO",
    role: "Visibilite et strategie",
    icon: "✦",
    color: "#C6A15B",
  },
  {
    name: "Content & Creative",
    role: "Creation et communication",
    icon: "◈",
    color: "#8FA8D8",
  },
  {
    name: "Business Strategist",
    role: "Strategie et conseil",
    icon: "⌘",
    color: "#B69AE8",
  },
  {
    name: "Sales & Analytics",
    role: "Developpement commercial",
    icon: "↗",
    color: "#65C79B",
  },
  {
    name: "Training & Executive",
    role: "Organisation et formation",
    icon: "◎",
    color: "#D9A17D",
  },
];

const departments = [
  { number: "01", name: "Marketing & Communication", count: "5 agents" },
  { number: "02", name: "Conseil & Strategie", count: "4 agents" },
  { number: "03", name: "Developpement commercial", count: "3 agents" },
  { number: "04", name: "Creation digitale & Web", count: "4 agents" },
  { number: "05", name: "Formation & Production", count: "4 agents" },
];

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  function sendMessage() {
    if (!prompt.trim()) return;
    setMessages((previous) => [...previous, prompt.trim()]);
    setPrompt("");
  }

  const navItems = [
    "Overview",
    "AI Agents",
    "Departments",
    "Workspace",
    "Analytics",
    "Settings",
  ];

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
            style={{
              ...styles.navItem,
              ...(active === item ? styles.navActive : {}),
            }}
          >
            <span>{{
              Overview: "◫",
              "AI Agents": "✧",
              Departments: "▦",
              Workspace: "▤",
              Analytics: "↗",
              Settings: "⚙",
            }[item]}</span>
            {item}
            {item === "AI Agents" && (
              <span style={styles.navCount}>20</span>
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
              <div style={styles.profileName}>OSR Group</div>
              <div style={styles.profileRole}>Administrator</div>
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
            <button style={styles.headerButton}>⌕</button>
            <button style={styles.headerButton}>⚙</button>
          </div>
        </header>

        <div style={styles.content}>
          <section style={styles.hero}>
            <div>
              <div style={styles.eyebrow}>
                <span style={{color:"#C6A15B"}}>✦</span>
                PREMIUM AI BUSINESS WORKSPACE
              </div>
              <h2 style={styles.heroTitle}>
                Your business.
                <br />
                <span style={{color:"#C6A15B"}}>Your intelligence.</span>
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
              ["20", "AI AGENTS", "+5 departments"],
              ["05", "DEPARTMENTS", "Business divisions"],
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
              style={styles.outlineButton}
              onClick={() => setActive("AI Agents")}
            >
              View all agents →
            </button>
          </div>

          <div style={styles.agentGrid}>
            {agents.map((agent) => (
              <button
                key={agent.name}
                onClick={() => {
                  setSelectedAgent(agent.name);
                  setActive("Workspace");
                }}
                style={styles.agentCard}
              >
                <div style={{
                  ...styles.agentIcon,
                  color: agent.color,
                  borderColor: agent.color + "55",
                }}>
                  {agent.icon}
                </div>
                <h3 style={styles.agentName}>{agent.name}</h3>
                <p style={styles.agentRole}>{agent.role}</p>
                <div style={styles.agentFooter}>
                  <span><span style={styles.onlineDot}/> Available</span>
                  <span style={{color:"#C6A15B"}}>↗</span>
                </div>
              </button>
            ))}
          </div>

          <div style={styles.sectionHeading}>
            <div>
              <div style={styles.sectionEyebrow}>BUSINESS ORGANIZATION</div>
              <h2 style={styles.sectionTitle}>Departments</h2>
            </div>
          </div>

          <div style={styles.departmentList}>
            {departments.map((department) => (
              <div key={department.number} style={styles.department}>
                <span style={styles.departmentNumber}>{department.number}</span>
                <span style={styles.departmentName}>{department.name}</span>
                <span style={styles.departmentCount}>{department.count}</span>
                <span style={{color:"#C6A15B"}}>→</span>
              </div>
            ))}
          </div>

          <section style={styles.brain}>
            <div style={styles.brainHeader}>
              <div>
                <div style={styles.sectionEyebrow}>OSR INTELLIGENCE</div>
                <h2 style={styles.sectionTitle}>AI Command Center</h2>
              </div>
              <span style={styles.status}>
                <span style={styles.onlineDot}/> READY
              </span>
            </div>

            {selectedAgent && (
              <div style={styles.selectedAgent}>
                Agent selectionne : {selectedAgent}
              </div>
            )}

            <div style={styles.chat}>
              {messages.length === 0 ? (
                <div style={styles.emptyChat}>
                  <div style={{fontSize:30,color:"#C6A15B"}}>✧</div>
                  <h3 style={{color:"#F5F0E8"}}>How can OSR help you?</h3>
                  <p style={{color:"#8995A8"}}>
                    Posez une question ou decrivez votre prochain projet.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} style={styles.message}>
                    <span style={{color:"#C6A15B"}}>YOU</span>
                    <p>{message}</p>
                  </div>
                ))
              )}
            </div>

            <div style={styles.inputArea}>
              <input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
                placeholder="Describe your business objective..."
                style={styles.input}
              />
              <button onClick={sendMessage} style={styles.sendButton}>
                SEND ↗
              </button>
            </div>
            <p style={styles.disclaimer}>
              Interface de demonstration. Le moteur IA et les integrations
              seront connectes dans une prochaine etape.
            </p>
          </section>

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
    marginBottom: 20,
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
    paddingTop: 20,
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
    padding: 20,
  },
  statValue: { color: "#C6A15B", fontSize: 27, fontWeight: 700 },
  statLabel: { fontSize: 10, letterSpacing: 1.5, marginTop: 9 },
  statDetail: { fontSize: 10, color: "#8995A8", marginTop: 7 },
  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
    padding: 20,
    marginTop: 20,
  },
  emptyChat: { textAlign: "center", padding: 20 },
  message: {
    borderBottom: "1px solid #202B3D",
    padding: 12,
    fontSize: 12,
  },
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
  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    color: "#66748A",
    fontSize: 9,
    letterSpacing: 1.5,
    padding: "30px 0",
    marginTop: 20,
    borderTop: "1px solid #202B3D",
  },
};