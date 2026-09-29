import React, { useState, useEffect, useRef } from 'react';
import {
  ActionCommand,
  AIProviderConfig,
  AlarmItem,
  AppPermission,
  ChatMessage,
  CreatorTask,
  DashboardLayout,
  DeviceTelemetry,
  FileItem,
  NotificationItem,
  OrbPosition,
  OrbSize,
  OrbState,
  OrbStyleId,
  ReminderItem,
  TerminalLog,
  VoiceProfileId,
} from './types/assistant';
import { voiceService } from './services/voiceService';
import { deviceService } from './services/deviceService';

// Dashboard Layouts
import { HoloCoreLayout } from './components/dashboard/layouts/HoloCoreLayout';
import { TacticalGridLayout } from './components/dashboard/layouts/TacticalGridLayout';
import { AndroidIslandLayout } from './components/dashboard/layouts/AndroidIslandLayout';
import { TelemetryMonitorLayout } from './components/dashboard/layouts/TelemetryMonitorLayout';

// Dedicated Views
import { ChatView } from './components/views/ChatView';
import { VoiceCockpitView } from './components/views/VoiceCockpitView';
import { OrbLabView } from './components/views/OrbLabView';
import { RemindersView } from './components/views/RemindersView';
import { DeviceControlView } from './components/views/DeviceControlView';
import { ScreenUnderstandView } from './components/views/ScreenUnderstandView';
import { NotificationsView } from './components/views/NotificationsView';
import { FileManagerView } from './components/views/FileManagerView';
import { CreatorAssistantView } from './components/views/CreatorAssistantView';
import { VoiceProfilesView } from './components/views/VoiceProfilesView';
import { AIProvidersView } from './components/views/AIProvidersView';
import { PermissionsView } from './components/views/PermissionsView';
import { SettingsView } from './components/views/SettingsView';
import { TerminalView } from './components/views/TerminalView';
import { AboutView } from './components/views/AboutView';
import { GoogleDriveView } from './components/views/GoogleDriveView';

// Icons
import {
  LayoutDashboard,
  MessageSquare,
  Mic,
  Sparkles,
  Bell,
  Sliders,
  ScanEye,
  Folder,
  HardDrive,
  Video,
  Volume2,
  Cpu,
  ShieldCheck,
  Terminal,
  Settings,
  Info,
  Menu,
  X,
  Flashlight,
  Bot,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  // Navigation & Layout State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout>('holo-core');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Orb & Voice State
  const [orbState, setOrbState] = useState<OrbState>('IDLE');
  const [orbStyleId, setOrbStyleId] = useState<OrbStyleId>('arc_reactor');
  const [orbSize, setOrbSize] = useState<OrbSize>('lg');
  const [orbPosition, setOrbPosition] = useState<OrbPosition>('center');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [lastReply, setLastReply] = useState('');
  const [currentInput, setCurrentInput] = useState('');

  // Settings State
  const [assistantName, setAssistantName] = useState('MAYRA');
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const [clapEnabled, setClapEnabled] = useState(true);
  const [language, setLanguage] = useState('Hinglish');
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfileId>('MAYRA');
  const [privacyMode, setPrivacyMode] = useState(false);

  // Confirmation Modal for Sensitive Actions
  const [pendingAction, setPendingAction] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  // Flashlight full-screen overlay state
  const [screenTorch, setScreenTorch] = useState(false);

  // Device Telemetry
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>({
    batteryLevel: 85,
    isCharging: false,
    brightness: 80,
    volume: 75,
    torchOn: false,
    wifiOn: true,
    bluetoothOn: true,
    mobileDataOn: true,
    hotspotOn: false,
    airplaneMode: false,
    batterySaver: false,
    screenAwake: false,
    ramUsagePercent: 58,
    storageUsedGB: 46,
    storageTotalGB: 128,
    cpuTemp: 32,
    city: 'New Delhi',
  });

  // AI Provider Config
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>({
    id: 'gemini_built_in',
    name: 'Gemini AI',
    model: 'gemini-3.8-flash',
    temperature: 0.75,
  });

  // Chat History
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        'नमस्ते! मैं MAYRA हूँ, आपकी Android AI पर्सनल असिस्टेंट। आप मुझसे कोई भी सवाल पूछ सकते हैं या फोन कमांड दे सकते हैं (जैसे: "YouTube खोलो", "Battery कितनी है?", या "Mood खराब है")। बताइए, आज क्या काम है? 😄',
      timestamp: '09:00 AM',
    },
  ]);

  // Reminders
  const [reminders, setReminders] = useState<ReminderItem[]>([
    {
      id: 'rem-1',
      title: 'YouTube Short Upload — 2026 AI Tools',
      time: '19:00',
      date: new Date().toISOString().split('T')[0],
      repeat: 'daily',
      category: 'shorts',
      isSpoken: false,
      isCompleted: false,
      createdAt: Date.now(),
    },
    {
      id: 'rem-2',
      title: 'कल सुबह की चाय और Daily Planning',
      time: '07:30',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      repeat: 'none',
      category: 'general',
      isSpoken: false,
      isCompleted: false,
      createdAt: Date.now(),
    },
  ]);

  // Alarms
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    {
      id: 'alm-1',
      label: 'Morning Wake Up',
      time: '07:00',
      enabled: true,
      repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    },
    {
      id: 'alm-2',
      label: 'Evening Workout',
      time: '18:00',
      enabled: false,
      repeatDays: ['Daily'],
    },
  ]);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      app: 'YouTube',
      title: 'Tech Channel Update',
      message: 'आपकी पिछली वीडियो पर 15 नए comments आए हैं।',
      time: '10 mins ago',
      isRead: false,
      isImportant: true,
      announced: false,
    },
    {
      id: 'notif-2',
      app: 'WhatsApp',
      title: 'Rahul Sharma',
      message: 'भाई शाम को मिलना है?',
      time: '25 mins ago',
      isRead: false,
      isImportant: true,
      announced: false,
    },
    {
      id: 'notif-3',
      app: 'Downloads',
      title: 'Download Complete',
      message: 'Android_SDK_v34_Platform.zip download complete.',
      time: '1 hour ago',
      isRead: true,
      isImportant: false,
      announced: true,
    },
  ]);

  // Terminal Logs
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    {
      id: 'log-1',
      timestamp: '09:00:12',
      role: 'SYSTEM',
      message: 'MAYRA AI Kernel 4.8.0 initialized on Android Web Runtime.',
      status: 'COMPLETED',
    },
    {
      id: 'log-2',
      timestamp: '09:00:15',
      role: 'SYSTEM',
      message: 'Acoustic mic listener and triple-clap detectors armed.',
      status: 'COMPLETED',
    },
  ]);

  // Creator Tasks
  const [creatorTasks, setCreatorTasks] = useState<CreatorTask[]>([
    {
      id: 'ct-1',
      platform: 'shorts',
      title: 'Android Secret Gesture That Saves 2 Hours',
      scheduledTime: '19:00',
      status: 'ready',
    },
    {
      id: 'ct-2',
      platform: 'youtube',
      title: 'How I Built MAYRA AI in 2026 (Full Tutorial)',
      scheduledTime: '15:00',
      status: 'pending',
    },
  ]);

  // Files
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: 'f-1',
      name: 'YouTube_Video_Final_1080p.mp4',
      type: 'video',
      size: '245 MB',
      date: 'Today',
      path: '/storage/emulated/0/DCIM/Camera',
      isDownloaded: false,
    },
    {
      id: 'f-2',
      name: 'Mayra_Voice_Samples.wav',
      type: 'audio',
      size: '12 MB',
      date: 'Yesterday',
      path: '/storage/emulated/0/Music',
      isDownloaded: false,
    },
    {
      id: 'f-3',
      name: 'Channel_Analytics_Sept.pdf',
      type: 'document',
      size: '4.2 MB',
      date: '28 Sept',
      path: '/storage/emulated/0/Documents',
      isDownloaded: false,
    },
    {
      id: 'f-4',
      name: 'AI_Studio_Companion.apk',
      type: 'download',
      size: '64 MB',
      date: 'Today',
      path: '/storage/emulated/0/Download',
      isDownloaded: true,
    },
  ]);

  // Permissions
  const [permissions, setPermissions] = useState<AppPermission[]>([
    {
      id: 'p-mic',
      name: 'Microphone & Audio Input',
      icon: 'Mic',
      description: 'Allows speech recognition, continuous wake word and triple clap detection.',
      whyNeeded: 'MAYRA needs your mic to hear questions and commands hands-free.',
      granted: true,
      isCritical: true,
    },
    {
      id: 'p-notif',
      name: 'Notifications & Alerts',
      icon: 'Bell',
      description: 'Allows speaking reminders and alarms to ring.',
      whyNeeded: 'To notify you when YouTube videos are scheduled or battery is full.',
      granted: true,
      isCritical: true,
    },
    {
      id: 'p-acc',
      name: 'Accessibility Service',
      icon: 'Accessibility',
      description: 'Automates safe Android gestures like Back, Home, and Scroll.',
      whyNeeded: 'Enables MAYRA to navigate apps and tap elements upon your command.',
      granted: true,
      isCritical: true,
    },
    {
      id: 'p-contacts',
      name: 'Contacts Access',
      icon: 'Users',
      description: 'Allows looking up contacts like Rahul or Maa to place calls or WhatsApp messages.',
      whyNeeded: 'Resolves names to phone numbers before dialing.',
      granted: true,
      isCritical: false,
    },
    {
      id: 'p-phone',
      name: 'Phone & Dialer',
      icon: 'Phone',
      description: 'Launches dialer intents for direct phone calls.',
      whyNeeded: 'Required for commands like "Rahul को call करो".',
      granted: true,
      isCritical: false,
    },
    {
      id: 'p-files',
      name: 'Storage & Files',
      icon: 'Folder',
      description: 'Reads scoped downloads and media for announcements.',
      whyNeeded: 'Alerts you when video downloads finish.',
      granted: true,
      isCritical: false,
    },
    {
      id: 'p-loc',
      name: 'Location GPS',
      icon: 'MapPin',
      description: 'Provides live atmospheric radar data for your city.',
      whyNeeded: 'Answers "यहाँ मौसम कैसा है" accurately.',
      granted: true,
      isCritical: false,
    },
    {
      id: 'p-bt',
      name: 'Bluetooth Telemetry',
      icon: 'Bluetooth',
      description: 'Monitors wireless headphones and accessories.',
      whyNeeded: 'Toggles wireless audio connections.',
      granted: false,
      isCritical: false,
    },
    {
      id: 'p-fg',
      name: 'Foreground Service',
      icon: 'Activity',
      description: 'Keeps wake word listener active without battery drain.',
      whyNeeded: 'Ensures MAYRA responds even when screen is locked.',
      granted: true,
      isCritical: true,
    },
    {
      id: 'p-alarm',
      name: 'Exact Alarm Scheduler',
      icon: 'AlarmClock',
      description: 'Schedules precise millisecond alarms.',
      whyNeeded: 'Wakes you up exactly at requested alarm time.',
      granted: true,
      isCritical: true,
    },
  ]);

  // Log Helper
  const logTerminal = (
    role: 'USER' | 'MAYRA' | 'SYSTEM',
    message: string,
    status?: 'LISTENING' | 'THINKING' | 'EXECUTING' | 'COMPLETED' | 'FAILED'
  ) => {
    const newLog: TerminalLog = {
      id: 'log-' + Date.now() + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      role,
      message,
      status,
    };
    setTerminalLogs((prev) => [newLog, ...prev].slice(0, 80));
  };

  // Sync Live Battery & Storage
  useEffect(() => {
    deviceService.getBatteryTelemetry().then((bat) => {
      setTelemetry((prev) => ({ ...prev, batteryLevel: bat.level, isCharging: bat.charging }));
    });
    deviceService.getStorageEstimate().then((st) => {
      setTelemetry((prev) => ({ ...prev, storageUsedGB: st.usedGB, storageTotalGB: st.totalGB }));
    });
  }, []);

  const executePromptRef = useRef<(prompt: string) => void>(() => {});

  // Initialize Speech Recognition & Triple Clap Detection
  useEffect(() => {
    voiceService.initRecognition(
      (text, isFinal) => {
        setVoiceTranscript(text);
        if (isFinal && text.trim()) {
          executePromptRef.current(text.trim());
        }
      },
      () => {
        // Wake Word Detected Callback
        logTerminal('SYSTEM', 'Wake Word "Hey Mayra" detected via microphone.', 'COMPLETED');
        handleWakeTrigger('हाँ बताइए, मैं सुन रही हूँ! 😄');
      },
      () => {
        setIsListening(false);
        if (orbState === 'LISTENING') setOrbState('IDLE');
      }
    );

    voiceService.startMicAudioAnalysis(
      (level) => setAudioLevel(level),
      () => {
        // Triple Clap Detected!
        logTerminal('SYSTEM', 'Triple Clap gesture detected via audio peaks.', 'COMPLETED');
        handleWakeTrigger('हाँ! 3 claps पहचान लिए। बताइए क्या मदद करूँ? 😄');
      }
    );

    return () => {
      voiceService.stopListening();
      voiceService.stopMicAudioAnalysis();
    };
  }, []);

  const handleWakeTrigger = (greetingText: string) => {
    setOrbState('SPEAKING');
    voiceService.speak(greetingText, voiceProfile, {
      onEnd: () => {
        setOrbState('LISTENING');
        setIsListening(true);
        voiceService.startListening('hi-IN');
      },
    });
    logTerminal('MAYRA', greetingText, 'COMPLETED');
  };

  const handleToggleVoice = () => {
    if (isListening) {
      const currentBuff = voiceTranscript.trim();
      voiceService.stopListening();
      setIsListening(false);
      setOrbState('IDLE');
      logTerminal('SYSTEM', 'Microphone listener disarmed by user.', 'COMPLETED');
      // If user had spoken something, process it immediately!
      if (currentBuff) {
        handleExecutePrompt(currentBuff);
      }
    } else {
      setIsListening(true);
      setOrbState('LISTENING');
      setVoiceTranscript('');
      voiceService.startListening('hi-IN');
      logTerminal('SYSTEM', 'Microphone listener armed for Hindi/English speech.', 'LISTENING');
    }
  };

  // Safe Action Engine Executor
  const executeSafeAction = (action: ActionCommand) => {
    logTerminal('SYSTEM', `Action Engine evaluating: ${action.type}`, 'EXECUTING');

    switch (action.type) {
      case 'OPEN_APP': {
        const app = action.app || 'youtube';
        const query = action.query;
        const res = deviceService.launchAndroidApp(app, query);
        logTerminal('SYSTEM', `Launched Android App Intent: ${app} (${res.intentUri})`, 'COMPLETED');
        setOrbState('SUCCESS');
        setTimeout(() => setOrbState('IDLE'), 2000);
        break;
      }

      case 'SET_BRIGHTNESS': {
        const val = Math.min(100, Math.max(10, action.value || 50));
        setTelemetry((prev) => ({ ...prev, brightness: val }));
        logTerminal('SYSTEM', `Display luminance adjusted to ${val}%`, 'COMPLETED');
        setOrbState('SUCCESS');
        setTimeout(() => setOrbState('IDLE'), 2000);
        break;
      }

      case 'SET_VOLUME': {
        const val = Math.min(100, Math.max(0, action.value || 70));
        setTelemetry((prev) => ({ ...prev, volume: val }));
        voiceService.playSciFiBeep(440 + val * 3, 0.08);
        logTerminal('SYSTEM', `Master volume set to ${val}%`, 'COMPLETED');
        setOrbState('SUCCESS');
        setTimeout(() => setOrbState('IDLE'), 2000);
        break;
      }

      case 'TOGGLE_TORCH': {
        const nextState =
          action.state === 'toggle' ? !telemetry.torchOn : action.state === 'on';
        setTelemetry((prev) => ({ ...prev, torchOn: nextState }));
        deviceService.toggleTorch(nextState);
        setScreenTorch(nextState);
        logTerminal('SYSTEM', `Torch flashlight state: ${nextState ? 'ON' : 'OFF'}`, 'COMPLETED');
        setOrbState('SUCCESS');
        setTimeout(() => setOrbState('IDLE'), 2000);
        break;
      }

      case 'CREATE_REMINDER': {
        const newRem: ReminderItem = {
          id: 'rem-' + Date.now(),
          title: action.title || 'Task Reminder',
          time: action.time || '18:00',
          date: action.date || new Date().toISOString().split('T')[0],
          repeat: action.repeat || 'none',
          category: action.category || 'general',
          isSpoken: false,
          isCompleted: false,
          createdAt: Date.now(),
        };
        setReminders((prev) => [newRem, ...prev]);
        logTerminal('SYSTEM', `Reminder saved: ${newRem.title} at ${newRem.time}`, 'COMPLETED');
        setOrbState('SUCCESS');
        setTimeout(() => setOrbState('IDLE'), 2000);
        break;
      }

      case 'CREATE_ALARM': {
        const newAlm: AlarmItem = {
          id: 'alm-' + Date.now(),
          label: action.label || 'Alarm',
          time: action.time || '07:00',
          enabled: true,
          repeatDays: ['Daily'],
        };
        setAlarms((prev) => [newAlm, ...prev]);
        logTerminal('SYSTEM', `Alarm set for ${newAlm.time}`, 'COMPLETED');
        setOrbState('SUCCESS');
        setTimeout(() => setOrbState('IDLE'), 2000);
        break;
      }

      case 'CALL_CONTACT': {
        // Confirmation dialog for calls!
        setPendingAction({
          title: 'Confirm Phone Call',
          description: `क्या आप ${action.name || 'इस contact'} को कॉल मिलाना चाहते हैं?`,
          onConfirm: () => {
            deviceService.launchCallIntent(action.phone || '9876543210');
            logTerminal('SYSTEM', `Call intent placed to ${action.name}`, 'COMPLETED');
            setPendingAction(null);
          },
        });
        break;
      }

      case 'SEND_MESSAGE': {
        // Confirmation dialog for messages!
        const promptQuestion = `${action.contact || 'Contact'} को यह message भेजूँ — '${action.message}'?`;
        voiceService.speak(promptQuestion, voiceProfile);
        setPendingAction({
          title: 'Confirm WhatsApp / SMS Message',
          description: promptQuestion,
          onConfirm: () => {
            deviceService.launchMessageIntent(action.contact || '', action.message || '');
            logTerminal('SYSTEM', `Message intent routed for ${action.contact}`, 'COMPLETED');
            setPendingAction(null);
          },
        });
        break;
      }

      case 'CREATOR_TASK': {
        const newTask: CreatorTask = {
          id: 'ct-' + Date.now(),
          platform: action.platform || 'youtube',
          title: action.title || 'Creator Video Upload',
          scheduledTime: action.time || '19:00',
          status: 'pending',
        };
        setCreatorTasks((prev) => [newTask, ...prev]);
        logTerminal('SYSTEM', `Creator radar task scheduled: ${newTask.title}`, 'COMPLETED');
        setOrbState('SUCCESS');
        setTimeout(() => setOrbState('IDLE'), 2000);
        break;
      }

      case 'CLIPBOARD_COPY': {
        if (action.text) {
          deviceService.copyToClipboard(action.text);
          logTerminal('SYSTEM', `Copied to clipboard: ${action.text.slice(0, 30)}...`, 'COMPLETED');
        }
        break;
      }

      case 'ACCESSIBILITY_NAV': {
        if (action.command === 'back') window.history.back();
        if (action.command === 'scroll_down') window.scrollBy({ top: 350, behavior: 'smooth' });
        logTerminal('SYSTEM', `Accessibility gesture: ${action.command}`, 'COMPLETED');
        break;
      }

      case 'DRIVE_VIEW':
      case 'DRIVE_SEARCH': {
        setActiveTab('google_drive');
        logTerminal('SYSTEM', 'Switched view to Google Drive Cloud Matrix', 'COMPLETED');
        setOrbState('SUCCESS');
        setTimeout(() => setOrbState('IDLE'), 2000);
        break;
      }

      default:
        logTerminal('SYSTEM', `Action acknowledged: ${action.type}`, 'COMPLETED');
    }
  };

  // Submit Prompt to Gemini Brain
  const handleExecutePrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: promptText.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    logTerminal('USER', promptText.trim());
    setCurrentInput('');
    setVoiceTranscript('');
    setOrbState('THINKING');

    try {
      // Build conversation context
      const chatHistory = [...messages, userMsg].slice(-8).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          userLocation: telemetry.city,
          deviceState: telemetry,
          customApiKey: aiConfig.id === 'gemini_custom' ? aiConfig.apiKey : undefined,
          provider: aiConfig.id,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || 'मैं अभी समझ नहीं पाई। फिर से कहेंगे?';
      setLastReply(reply);

      const assistantMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        actionExecuted: data.action,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      logTerminal('MAYRA', reply, 'COMPLETED');

      // Speak reply through voice
      setOrbState('SPEAKING');
      voiceService.speak(reply, voiceProfile, {
        onEnd: () => {
          setOrbState('IDLE');
        },
      });

      // If action is requested, trigger action engine
      if (data.action) {
        executeSafeAction(data.action);
      }
    } catch (err: any) {
      console.warn('Network or brain error, activating local neural fallback:', err);
      // Client-side quick command resolver
      const lower = promptText.toLowerCase();
      let fallbackReply = 'हाँ जी, मैं सुन रही हूँ। कहिए क्या हुक्म है? 😄';
      let localAction: any = null;

      if (lower.includes('youtube')) {
        localAction = { type: 'OPEN_APP', app: 'youtube' };
        fallbackReply = 'YouTube खोल रही हूँ। 🚀';
      } else if (lower.includes('whatsapp')) {
        localAction = { type: 'OPEN_APP', app: 'whatsapp' };
        fallbackReply = 'WhatsApp खोल रही हूँ। 💬';
      } else if (lower.includes('torch') || lower.includes('flashlight') || lower.includes('टॉर्च')) {
        const off = lower.includes('off') || lower.includes('band') || lower.includes('बंद');
        localAction = { type: 'TOGGLE_TORCH', state: off ? 'off' : 'on' };
        fallbackReply = off ? 'Torch बंद कर दी गई है। 🔦' : 'Torch चालू कर दी गई है। 🔦';
      } else if (lower.includes('battery') || lower.includes('बैटरी')) {
        localAction = { type: 'DEVICE_INFO', metric: 'battery' };
        fallbackReply = `फ़ोन में अभी ${telemetry.batteryLevel}% बैटरी है। 👍`;
      } else if (lower.includes('brightness') || lower.includes('ब्राइटनेस')) {
        const match = lower.match(/\d+/);
        const val = match ? parseInt(match[0], 10) : 60;
        localAction = { type: 'SET_BRIGHTNESS', value: val };
        fallbackReply = `Brightness ${val}% कर दी गई है। ☀️`;
      } else if (lower.includes('mood') || lower.includes('मूड')) {
        fallbackReply = 'अरे भाई 😄 पहले ये बताओ, चाय पी है या tension का software चल रहा है? बताओ क्या बात है।';
      } else if (lower.includes('capital') || lower.includes('राजधानी')) {
        fallbackReply = 'India की capital New Delhi है। 😄';
      } else if (lower.includes('drive') || lower.includes('ड्राइव')) {
        localAction = { type: 'DRIVE_VIEW' };
        fallbackReply = 'Google Drive खोल रही हूँ। 📁';
      }

      setLastReply(fallbackReply);
      const assistantMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        actionExecuted: localAction,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      logTerminal('MAYRA', fallbackReply, 'COMPLETED');
      setOrbState('SPEAKING');
      voiceService.speak(fallbackReply, voiceProfile, {
        onEnd: () => setOrbState('IDLE'),
      });
      if (localAction) {
        executeSafeAction(localAction);
      }
    }
  };

  executePromptRef.current = handleExecutePrompt;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim()) {
      handleExecutePrompt(currentInput.trim());
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'chat', label: 'AI Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'voice', label: 'Voice Cockpit', icon: <Mic className="w-4 h-4" /> },
    { id: 'orb_lab', label: 'AI Orb Lab', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'reminders', label: 'Reminders & Alarms', icon: <Bell className="w-4 h-4" /> },
    { id: 'device', label: 'Device Control', icon: <Sliders className="w-4 h-4" /> },
    { id: 'screen', label: 'Screen Vision OCR', icon: <ScanEye className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'files', label: 'File Manager', icon: <Folder className="w-4 h-4" /> },
    { id: 'google_drive', label: 'Google Drive', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'creator', label: 'Creator Assistant', icon: <Video className="w-4 h-4" /> },
    { id: 'voice_profiles', label: 'Voice Personas', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'providers', label: 'AI Providers', icon: <Cpu className="w-4 h-4" /> },
    { id: 'permissions', label: 'Permissions', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'terminal', label: 'Kernel Terminal', icon: <Terminal className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'about', label: 'About MAYRA', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 flex flex-col font-sans scanline-effect relative">
      {/* Real Screen Brightness Overlay Filter */}
      <div
        className="fixed inset-0 pointer-events-none z-40 transition-opacity duration-300"
        style={{
          backgroundColor: '#000000',
          opacity: (100 - telemetry.brightness) / 100 * 0.7,
        }}
      />

      {/* Screen Torch Flashlight Mode Overlay */}
      {screenTorch && (
        <div
          onClick={() => {
            setScreenTorch(false);
            setTelemetry((prev) => ({ ...prev, torchOn: false }));
            deviceService.toggleTorch(false);
          }}
          className="fixed inset-0 z-50 bg-white cursor-pointer flex flex-col items-center justify-center text-gray-900 font-mono"
        >
          <Flashlight className="w-16 h-16 animate-bounce" />
          <h1 className="text-2xl font-bold mt-4">TORCH FLASHLIGHT ACTIVE</h1>
          <p className="text-xs text-gray-600 mt-1">Tap anywhere to turn off flashlight</p>
        </div>
      )}

      {/* Sensitive Action Confirmation Dialog */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl border border-cyan-500/50 bg-gray-950 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-cyan-400">
              <AlertCircle className="w-6 h-6 animate-pulse" />
              <h3 className="text-base font-bold font-mono">{pendingAction.title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {pendingAction.description}
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-cyan-950">
              <button
                onClick={() => setPendingAction(null)}
                className="px-4 py-2 rounded-xl border border-gray-800 text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel (रद्द करें)
              </button>
              <button
                onClick={pendingAction.onConfirm}
                className="px-5 py-2 rounded-xl bg-cyan-500 text-gray-950 font-bold font-mono text-xs hover:bg-cyan-400"
              >
                Confirm (हाँ, भेजें)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-cyan-500/20 bg-gray-950/90 backdrop-blur-xl px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Assistant Identity */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-400/60 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-gray-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black font-mono tracking-wider text-white">
                  MAYRA <span className="text-cyan-400 font-light">AI</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-900 font-mono font-bold">
                  v4.8
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                <span>Android JARVIS Core</span>
                <span>&bull;</span>
                <span className="text-cyan-300">Hindi/English</span>
              </div>
            </div>
          </div>

          {/* Quick Dashboard Layout Selector (Visible when on Dashboard) */}
          {activeTab === 'dashboard' && (
            <div className="hidden md:flex items-center gap-1 bg-gray-900/80 p-1 rounded-xl border border-cyan-950 text-xs font-mono">
              <span className="text-[10px] text-slate-500 uppercase px-2 font-bold">Layout:</span>
              {(
                [
                  { id: 'holo-core', label: 'Holo-Core' },
                  { id: 'tactical-grid', label: 'Tactical' },
                  { id: 'android-island', label: 'Island Deck' },
                  { id: 'telemetry-monitor', label: 'Creator Radar' },
                ] as const
              ).map((l) => (
                <button
                  key={l.id}
                  onClick={() => setDashboardLayout(l.id)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    dashboardLayout === l.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}

          {/* Right Action Icons & Mobile Drawer Trigger */}
          <div className="flex items-center gap-2">
            {/* Quick Mic Cockpit Button */}
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs transition ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice Assistant</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-cyan-900 text-slate-300 hover:text-white hover:border-cyan-500/40 transition"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Pills Bar for quick switching */}
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-cyan-950/60 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
          {navItems.slice(0, 8).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-gray-900/60'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-200 px-2 py-1 whitespace-nowrap"
          >
            More &gt;
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className="w-72 bg-gray-950 border-l border-cyan-500/30 h-full p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
              <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                MAYRA AI NAVIGATION
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-mono transition text-left ${
                    activeTab === item.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                      : 'text-slate-300 hover:bg-gray-900/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Status inside Drawer */}
            <div className="pt-4 border-t border-cyan-950 text-[11px] font-mono text-slate-500 space-y-1">
              <div>BATTERY: {telemetry.batteryLevel}% ({telemetry.isCharging ? 'Charging' : 'Discharging'})</div>
              <div>ORB PRESET: {orbStyleId}</div>
              <div>VOICE PROFILE: {voiceProfile}</div>
              <div>AI ENGINE: {aiConfig.model}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20">
        {activeTab === 'dashboard' && (
          <>
            {dashboardLayout === 'holo-core' && (
              <HoloCoreLayout
                orbState={orbState}
                orbStyleId={orbStyleId}
                audioLevel={audioLevel}
                onOrbClick={handleToggleVoice}
                telemetry={telemetry}
                reminders={reminders}
                notifications={notifications}
                terminalLogs={terminalLogs}
                onToggleReminder={(id) => {
                  setReminders((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r))
                  );
                }}
                onMarkNotificationRead={(id) => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
                  );
                }}
                onClearNotifications={() => setNotifications([])}
                onClearTerminal={() => setTerminalLogs([])}
                onExecutePrompt={handleExecutePrompt}
                torchOn={telemetry.torchOn}
                onToggleTorch={() => {
                  const next = !telemetry.torchOn;
                  setTelemetry((prev) => ({ ...prev, torchOn: next }));
                  deviceService.toggleTorch(next);
                  setScreenTorch(next);
                }}
                onOpenScreenUnderstand={() => setActiveTab('screen')}
                currentInput={currentInput}
                setCurrentInput={setCurrentInput}
                onSubmitInput={handleFormSubmit}
                isListening={isListening}
                onToggleVoice={handleToggleVoice}
              />
            )}

            {dashboardLayout === 'tactical-grid' && (
              <TacticalGridLayout
                orbState={orbState}
                orbStyleId={orbStyleId}
                audioLevel={audioLevel}
                onOrbClick={handleToggleVoice}
                telemetry={telemetry}
                reminders={reminders}
                notifications={notifications}
                terminalLogs={terminalLogs}
                onToggleReminder={(id) => {
                  setReminders((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r))
                  );
                }}
                onMarkNotificationRead={(id) => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
                  );
                }}
                onClearNotifications={() => setNotifications([])}
                onClearTerminal={() => setTerminalLogs([])}
                onExecutePrompt={handleExecutePrompt}
                torchOn={telemetry.torchOn}
                onToggleTorch={() => {
                  const next = !telemetry.torchOn;
                  setTelemetry((prev) => ({ ...prev, torchOn: next }));
                  deviceService.toggleTorch(next);
                  setScreenTorch(next);
                }}
                onOpenScreenUnderstand={() => setActiveTab('screen')}
                currentInput={currentInput}
                setCurrentInput={setCurrentInput}
                onSubmitInput={handleFormSubmit}
                isListening={isListening}
                onToggleVoice={handleToggleVoice}
              />
            )}

            {dashboardLayout === 'android-island' && (
              <AndroidIslandLayout
                orbState={orbState}
                orbStyleId={orbStyleId}
                audioLevel={audioLevel}
                onOrbClick={handleToggleVoice}
                telemetry={telemetry}
                reminders={reminders}
                notifications={notifications}
                terminalLogs={terminalLogs}
                onToggleReminder={(id) => {
                  setReminders((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r))
                  );
                }}
                onMarkNotificationRead={(id) => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
                  );
                }}
                onClearNotifications={() => setNotifications([])}
                onClearTerminal={() => setTerminalLogs([])}
                onExecutePrompt={handleExecutePrompt}
                torchOn={telemetry.torchOn}
                onToggleTorch={() => {
                  const next = !telemetry.torchOn;
                  setTelemetry((prev) => ({ ...prev, torchOn: next }));
                  deviceService.toggleTorch(next);
                  setScreenTorch(next);
                }}
                onOpenScreenUnderstand={() => setActiveTab('screen')}
                currentInput={currentInput}
                setCurrentInput={setCurrentInput}
                onSubmitInput={handleFormSubmit}
                isListening={isListening}
                onToggleVoice={handleToggleVoice}
              />
            )}

            {dashboardLayout === 'telemetry-monitor' && (
              <TelemetryMonitorLayout
                orbState={orbState}
                orbStyleId={orbStyleId}
                audioLevel={audioLevel}
                onOrbClick={handleToggleVoice}
                telemetry={telemetry}
                reminders={reminders}
                notifications={notifications}
                terminalLogs={terminalLogs}
                onToggleReminder={(id) => {
                  setReminders((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r))
                  );
                }}
                onMarkNotificationRead={(id) => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
                  );
                }}
                onClearNotifications={() => setNotifications([])}
                onClearTerminal={() => setTerminalLogs([])}
                onExecutePrompt={handleExecutePrompt}
                torchOn={telemetry.torchOn}
                onToggleTorch={() => {
                  const next = !telemetry.torchOn;
                  setTelemetry((prev) => ({ ...prev, torchOn: next }));
                  deviceService.toggleTorch(next);
                  setScreenTorch(next);
                }}
                onOpenScreenUnderstand={() => setActiveTab('screen')}
                currentInput={currentInput}
                setCurrentInput={setCurrentInput}
                onSubmitInput={handleFormSubmit}
                isListening={isListening}
                onToggleVoice={handleToggleVoice}
              />
            )}
          </>
        )}

        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            currentInput={currentInput}
            setCurrentInput={setCurrentInput}
            onSubmit={handleFormSubmit}
            isListening={isListening}
            onToggleVoice={handleToggleVoice}
            onClearHistory={() => setMessages([])}
            orbState={orbState}
            onExecutePrompt={handleExecutePrompt}
          />
        )}

        {activeTab === 'voice' && (
          <VoiceCockpitView
            orbState={orbState}
            orbStyleId={orbStyleId}
            audioLevel={audioLevel}
            isListening={isListening}
            transcript={voiceTranscript}
            lastReply={lastReply}
            onToggleListening={handleToggleVoice}
            voiceProfile={voiceProfile}
            wakeWordEnabled={wakeWordEnabled}
            onToggleWakeWord={() => {
              const next = !wakeWordEnabled;
              setWakeWordEnabled(next);
              voiceService.setWakeWordEnabled(next);
            }}
            clapEnabled={clapEnabled}
            onToggleClap={() => {
              const next = !clapEnabled;
              setClapEnabled(next);
              voiceService.setClapDetectionEnabled(next);
            }}
            onExecutePrompt={handleExecutePrompt}
          />
        )}

        {activeTab === 'orb_lab' && (
          <OrbLabView
            currentStyleId={orbStyleId}
            onSelectStyle={(id) => setOrbStyleId(id)}
            currentSize={orbSize}
            onSelectSize={(sz) => setOrbSize(sz)}
            currentPosition={orbPosition}
            onSelectPosition={(pos) => setOrbPosition(pos)}
            audioLevel={audioLevel}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersView
            reminders={reminders}
            alarms={alarms}
            onAddReminder={(r) => {
              const item: ReminderItem = {
                ...r,
                id: 'rem-' + Date.now(),
                createdAt: Date.now(),
              };
              setReminders((prev) => [item, ...prev]);
            }}
            onToggleReminderComplete={(id) => {
              setReminders((prev) =>
                prev.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r))
              );
            }}
            onDeleteReminder={(id) => {
              setReminders((prev) => prev.filter((r) => r.id !== id));
            }}
            onAddAlarm={(a) => {
              const item: AlarmItem = {
                ...a,
                id: 'alm-' + Date.now(),
              };
              setAlarms((prev) => [item, ...prev]);
            }}
            onToggleAlarm={(id) => {
              setAlarms((prev) =>
                prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
              );
            }}
            onDeleteAlarm={(id) => {
              setAlarms((prev) => prev.filter((a) => a.id !== id));
            }}
            onTestAlarmSound={() => {
              voiceService.playAlarmChime();
            }}
          />
        )}

        {activeTab === 'device' && (
          <DeviceControlView
            telemetry={telemetry}
            onUpdateBrightness={(val) => setTelemetry((prev) => ({ ...prev, brightness: val }))}
            onUpdateVolume={(val) => setTelemetry((prev) => ({ ...prev, volume: val }))}
            torchOn={telemetry.torchOn}
            onToggleTorch={() => {
              const next = !telemetry.torchOn;
              setTelemetry((prev) => ({ ...prev, torchOn: next }));
              deviceService.toggleTorch(next);
              setScreenTorch(next);
            }}
            onToggleWifi={() => setTelemetry((prev) => ({ ...prev, wifiOn: !prev.wifiOn }))}
            onToggleBluetooth={() =>
              setTelemetry((prev) => ({ ...prev, bluetoothOn: !prev.bluetoothOn }))
            }
            onToggleBatterySaver={() =>
              setTelemetry((prev) => ({ ...prev, batterySaver: !prev.batterySaver }))
            }
            onToggleWakeLock={() => {
              const next = !telemetry.screenAwake;
              deviceService.requestWakeLock(next);
              setTelemetry((prev) => ({ ...prev, screenAwake: next }));
            }}
            onLogAction={(name, status, msg) => logTerminal('SYSTEM', `${name}: ${msg}`, status)}
          />
        )}

        {activeTab === 'screen' && (
          <ScreenUnderstandView
            onLogAction={(name, status, msg) => logTerminal('SYSTEM', `${name}: ${msg}`, status)}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsView
            notifications={notifications}
            onMarkAsRead={(id) => {
              setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
              );
            }}
            onClearAll={() => setNotifications([])}
            onDeleteNotification={(id) => {
              setNotifications((prev) => prev.filter((n) => n.id !== id));
            }}
          />
        )}

        {activeTab === 'files' && (
          <FileManagerView
            files={files}
            onDeleteFile={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
            onRenameFile={(id, newName) =>
              setFiles((prev) =>
                prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
              )
            }
          />
        )}

        {activeTab === 'google_drive' && (
          <GoogleDriveView
            onSpeak={(txt) => voiceService.speak(txt, voiceProfile)}
            onLogTerminal={logTerminal}
          />
        )}

        {activeTab === 'creator' && (
          <CreatorAssistantView
            tasks={creatorTasks}
            onAddTask={(task) => {
              const newTask: CreatorTask = {
                ...task,
                id: 'ct-' + Date.now(),
              };
              setCreatorTasks((prev) => [newTask, ...prev]);
            }}
            onUpdateStatus={(id, status) => {
              setCreatorTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...t, status } : t))
              );
            }}
            onExecutePrompt={handleExecutePrompt}
          />
        )}

        {activeTab === 'voice_profiles' && (
          <VoiceProfilesView
            currentProfile={voiceProfile}
            onSelectProfile={(p) => setVoiceProfile(p)}
          />
        )}

        {activeTab === 'providers' && (
          <AIProvidersView
            currentConfig={aiConfig}
            onUpdateConfig={(cfg) => setAiConfig(cfg)}
          />
        )}

        {activeTab === 'permissions' && (
          <PermissionsView
            permissions={permissions}
            onTogglePermission={(id) => {
              setPermissions((prev) =>
                prev.map((p) => (p.id === id ? { ...p, granted: !p.granted } : p))
              );
            }}
          />
        )}

        {activeTab === 'terminal' && (
          <TerminalView logs={terminalLogs} onClear={() => setTerminalLogs([])} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            assistantName={assistantName}
            setAssistantName={setAssistantName}
            wakeWordEnabled={wakeWordEnabled}
            setWakeWordEnabled={(val) => {
              setWakeWordEnabled(val);
              voiceService.setWakeWordEnabled(val);
            }}
            clapEnabled={clapEnabled}
            setClapEnabled={(val) => {
              setClapEnabled(val);
              voiceService.setClapDetectionEnabled(val);
            }}
            language={language}
            setLanguage={setLanguage}
            privacyMode={privacyMode}
            setPrivacyMode={setPrivacyMode}
          />
        )}

        {activeTab === 'about' && <AboutView />}
      </main>
    </div>
  );
}
