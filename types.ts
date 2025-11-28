import { Vector3 } from 'three';

export enum NodeType {
  Client = 'Client',
  Internet = 'Internet',
  Firewall = 'Firewall',
  LB = 'Load Balancer',
  WAF = 'WAF',
  App = 'App Server',
  Auth = 'Auth Service',
  DB = 'Database',
  SIEM = 'SIEM / Logging'
}

export interface NodeConfig {
  id: NodeType;
  position: [number, number, number];
  color: string;
  icon?: string;
  description: string;
  label?: string; // Custom display label
}

export interface Step {
  id: number;
  title: string;
  description: string;
  path: NodeType[]; // The sequence of nodes the packet travels
  isPacketVisible: boolean;
  highlightNodes: NodeType[];
  packetColor?: string;
  packetLabel?: string; // Text shown above the moving packet
}