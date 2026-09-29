export type DashboardLayout =
  | 'holo-core'
  | 'tactical-grid'
  | 'android-island'
  | 'telemetry-monitor';

export type OrbState =
  | 'IDLE'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'EXECUTING'
  | 'SUCCESS'
  | 'ERROR';

export type OrbSize = 'sm' | 'md' | 'lg' | 'xl';
export type OrbPosition = 'center' | 'top' | 'pip' | 'dock';

export type OrbStyleId =
  | 'arc_reactor'
  | 'quantum_pulse'
  | 'cyber_rings'
  | 'holo_sphere'
  | 'sonic_waves'
  | 'neon_vortex'
  | 'hex_matrix'
  | 'plasma_flare'
  | 'synapse_core'
  | 'dark_matter'
  | 'binary_orbit'
  | 'tachyon_shield'
  | 'iris_glow'
  | 'pulsar_spin'
  | 'void_singularity'
  | 'jarvis_mark7'
  | 'circuit_lattice'
  | 'matrix_rain'
  | 'gamma_burst'
  | 'chrono_dial'
  | 'nebula_stream'
  | 'supernova'
  | 'shield_barrier'
  | 'neural_mesh'
  | 'prism_beam'
  | 'infinity_loop'
  | 'core_reactor'
  | 'cyber_eye'
  | 'astro_pulse'
  | 'zenith_flare'
  | 'hyper_drive'
  | 'quantum_lattice';

export interface OrbStyleOption {
  id: OrbStyleId;
  name: string;
  category: 'HUD' | 'Reactor' | 'Cosmic' | 'Neural' | 'Tactical';
  description: string;
  glowColor: string;
  accentColor: string;
}

export type VoiceProfileId = 'MAYRA' | 'JARVIS' | 'NATASHA' | 'FRIDAY';

export interface VoiceProfile {
  id: VoiceProfileId;
  name: string;
  lang: string;
  pitch: number;
  rate: number;
  description: string;
  personality: string;
  avatarIcon: string;
}

export type AIProviderId =
  | 'gemini_built_in'
  | 'gemini_custom'
  | 'openrouter'
  | 'groq'
  | 'custom';

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  model: string;
  apiKey?: string;
  customEndpoint?: string;
  temperature: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionExecuted?: ActionCommand;
  isSpoken?: boolean;
}

export interface ActionCommand {
  type:
    | 'OPEN_APP'
    | 'SET_BRIGHTNESS'
    | 'SET_VOLUME'
    | 'TOGGLE_TORCH'
    | 'CREATE_REMINDER'
    | 'CREATE_ALARM'
    | 'CALL_CONTACT'
    | 'SEND_MESSAGE'
    | 'CREATOR_TASK'
    | 'DEVICE_INFO'
    | 'WEATHER_CHECK'
    | 'ACCESSIBILITY_NAV'
    | 'CLIPBOARD_COPY'
    | 'SCREEN_UNDERSTAND'
    | 'DRIVE_VIEW'
    | 'DRIVE_SEARCH';
  [key: string]: any;
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  starred?: boolean;
  owners?: Array<{ displayName: string; emailAddress: string; photoLink?: string }>;
}

export interface ReminderItem {
  id: string;
  title: string;
  time: string; // HH:MM
  date: string; // YYYY-MM-DD
  repeat: 'none' | 'daily' | 'weekly';
  category: 'general' | 'youtube' | 'shorts' | 'reels' | 'stories' | 'call';
  isSpoken: boolean;
  isCompleted: boolean;
  createdAt: number;
}

export interface AlarmItem {
  id: string;
  label: string;
  time: string; // HH:MM
  enabled: boolean;
  repeatDays: string[];
}

export interface DeviceTelemetry {
  batteryLevel: number;
  isCharging: boolean;
  brightness: number;
  volume: number;
  torchOn: boolean;
  wifiOn: boolean;
  bluetoothOn: boolean;
  mobileDataOn: boolean;
  hotspotOn: boolean;
  airplaneMode: boolean;
  batterySaver: boolean;
  screenAwake: boolean;
  ramUsagePercent: number;
  storageUsedGB: number;
  storageTotalGB: number;
  cpuTemp: number;
  city: string;
}

export interface NotificationItem {
  id: string;
  app: 'YouTube' | 'WhatsApp' | 'Instagram' | 'System' | 'Downloads' | 'Calls';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  isImportant: boolean;
  announced: boolean;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  role: 'USER' | 'MAYRA' | 'SYSTEM';
  message: string;
  status?: 'LISTENING' | 'THINKING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  meta?: any;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'apk' | 'download';
  size: string;
  date: string;
  path: string;
  isDownloaded?: boolean;
}

export interface CreatorTask {
  id: string;
  platform: 'youtube' | 'shorts' | 'reels' | 'stories';
  title: string;
  scheduledTime: string;
  status: 'pending' | 'ready' | 'uploaded';
  notes?: string;
}

export interface AppPermission {
  id: string;
  name: string;
  icon: string;
  description: string;
  whyNeeded: string;
  granted: boolean;
  isCritical: boolean;
}
