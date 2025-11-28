import { NodeType, NodeConfig, Step } from './types';

// Visual configuration for the 3D scene
// Increased spacing (X values) to make the visualization clearer
export const NETWORK_NODES: NodeConfig[] = [
  { id: NodeType.Client, position: [-9, 0, 5], color: '#3b82f6', description: "Remote User Device", label: "Client (Nikhil)" },
  { id: NodeType.Internet, position: [-5, 0, 1], color: '#94a3b8', description: "Public Internet / ISP" },
  { id: NodeType.Firewall, position: [-1, 0, 0], color: '#ef4444', description: "Next-Gen Firewall (L3/L4)" },
  { id: NodeType.LB, position: [3, 0, 0], color: '#f59e0b', description: "Load Balancer / Reverse Proxy" },
  { id: NodeType.WAF, position: [3, 0, -3.5], color: '#8b5cf6', description: "Web App Firewall" },
  { id: NodeType.App, position: [7, 0, 0], color: '#10b981', description: "Application Server Cluster" },
  { id: NodeType.Auth, position: [7, 0, 3.5], color: '#ec4899', description: "IdP / Auth Service" },
  { id: NodeType.DB, position: [11, 0, 0], color: '#06b6d4', description: "Encrypted Database" },
  { id: NodeType.SIEM, position: [1, 0, 5], color: '#6366f1', description: "SIEM & Logging" },
];

// Helper to get position vector by ID
export const getPos = (id: NodeType): [number, number, number] => {
  const node = NETWORK_NODES.find(n => n.id === id);
  return node ? node.position : [0, 0, 0];
};

export const STEPS: Step[] = [
  {
    id: 0,
    title: "1. DNS Resolution",
    description: "Client queries DNS resolver to find the IP address of dietiq.example.com. Returns 203.0.113.10.",
    path: [NodeType.Client, NodeType.Internet, NodeType.Client],
    isPacketVisible: true,
    highlightNodes: [NodeType.Client, NodeType.Internet],
    packetColor: "#ffffff",
    packetLabel: "DNS Query"
  },
  {
    id: 1,
    title: "2. TCP Handshake (SYN)",
    description: "Client initiates connection. Packet PASSES THROUGH Firewall (inspected, logged) to the Load Balancer.",
    path: [NodeType.Client, NodeType.Internet, NodeType.Firewall, NodeType.LB],
    isPacketVisible: true,
    highlightNodes: [NodeType.Client, NodeType.Firewall, NodeType.LB],
    packetColor: "#fbbf24",
    packetLabel: "SYN"
  },
  {
    id: 2,
    title: "2. TCP Handshake (SYN-ACK)",
    description: "Load Balancer acknowledges. Packet flows back THROUGH Firewall to Client.",
    path: [NodeType.LB, NodeType.Firewall, NodeType.Internet, NodeType.Client],
    isPacketVisible: true,
    highlightNodes: [NodeType.LB, NodeType.Firewall, NodeType.Client],
    packetColor: "#fbbf24",
    packetLabel: "SYN-ACK"
  },
  {
    id: 3,
    title: "2. TCP Handshake (ACK)",
    description: "Client confirms connection. TCP Session established.",
    path: [NodeType.Client, NodeType.Internet, NodeType.Firewall, NodeType.LB],
    isPacketVisible: true,
    highlightNodes: [NodeType.Client, NodeType.LB],
    packetColor: "#fbbf24",
    packetLabel: "ACK"
  },
  {
    id: 4,
    title: "3. TLS 1.3 Handshake",
    description: "Encryption keys exchanged. ClientHello, ServerHello, Certificate, Finished. Channel is now secure.",
    path: [NodeType.LB, NodeType.Client, NodeType.LB], // Visual oscillation
    isPacketVisible: true,
    highlightNodes: [NodeType.LB, NodeType.Client],
    packetColor: "#10b981",
    packetLabel: "TLS Handshake"
  },
  {
    id: 5,
    title: "4. HTTP Request (Encrypted)",
    description: "User sends GET /api/data. Firewall sees encrypted traffic on port 443 and allows it.",
    path: [NodeType.Client, NodeType.Internet, NodeType.Firewall, NodeType.LB],
    isPacketVisible: true,
    highlightNodes: [NodeType.Client, NodeType.Firewall, NodeType.LB],
    packetColor: "#10b981",
    packetLabel: "HTTPS GET"
  },
  {
    id: 6,
    title: "5. Decryption & WAF Inspection",
    description: "LB terminates TLS. Sends plaintext HTTP to WAF for inspection (SQLi, XSS check).",
    path: [NodeType.LB, NodeType.WAF, NodeType.LB],
    isPacketVisible: true,
    highlightNodes: [NodeType.LB, NodeType.WAF],
    packetColor: "#8b5cf6",
    packetLabel: "Plaintext HTTP"
  },
  {
    id: 7,
    title: "6. App Processing & Routing",
    description: "Clean traffic routed to Application Server. Business logic executes.",
    path: [NodeType.LB, NodeType.App],
    isPacketVisible: true,
    highlightNodes: [NodeType.LB, NodeType.App],
    packetColor: "#ffffff",
    packetLabel: "Request"
  },
  {
    id: 8,
    title: "7. Authentication (OIDC/SAML)",
    description: "App service validates User Session/JWT with Identity Provider.",
    path: [NodeType.App, NodeType.Auth, NodeType.App],
    isPacketVisible: true,
    highlightNodes: [NodeType.App, NodeType.Auth],
    packetColor: "#ec4899",
    packetLabel: "Auth Token"
  },
  {
    id: 9,
    title: "8. Authorization Check",
    description: "Policy Engine checks if User:Alice has ALLOW permission for Resource:Data.",
    path: [NodeType.App, NodeType.App], // Stationary pulse
    isPacketVisible: true,
    highlightNodes: [NodeType.App],
    packetColor: "#ec4899",
    packetLabel: "AuthZ"
  },
  {
    id: 10,
    title: "9. Database Query",
    description: "App queries encrypted database for requested records.",
    path: [NodeType.App, NodeType.DB, NodeType.App],
    isPacketVisible: true,
    highlightNodes: [NodeType.App, NodeType.DB],
    packetColor: "#06b6d4",
    packetLabel: "SQL Query"
  },
  {
    id: 11,
    title: "10. Logging & SIEM",
    description: "Event logs are aggregated from FW, LB, WAF, and App to the SIEM dashboard.",
    path: [NodeType.App, NodeType.SIEM], // Conceptual flow
    isPacketVisible: true,
    highlightNodes: [NodeType.App, NodeType.SIEM, NodeType.Firewall, NodeType.WAF],
    packetColor: "#6366f1",
    packetLabel: "Syslog"
  },
  {
    id: 12,
    title: "11. Response to Client",
    description: "Data returned: App -> LB (Re-encrypt) -> FW -> Client.",
    path: [NodeType.App, NodeType.LB, NodeType.Firewall, NodeType.Internet, NodeType.Client],
    isPacketVisible: true,
    highlightNodes: [NodeType.App, NodeType.LB, NodeType.Firewall, NodeType.Client],
    packetColor: "#10b981",
    packetLabel: "HTTPS Response"
  }
];