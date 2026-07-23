import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Clock,
  Instagram,
  Settings as SettingsIcon,
  Play,
  Trash2,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Video,
  Info,
  ChevronDown,
  ChevronUp,
  ListOrdered,
  Plus,
  Upload,
  Copy,
  ExternalLink,
  Download,
  UserPlus,
  Sun,
  Moon,
  X,
  Layers,
  ListPlus,
  FileVideo,
  Zap,
  Users,
  TrendingUp,
  Eye,
  BarChart3,
  ArrowUpRight,
  Lock,
  Key,
  ShieldCheck,
  LogOut
} from "lucide-react";
import { Reel, Settings, LogEntry, QueueState, SavedAccount, AccountMetrics } from "./types";

export const getStoredPassword = () => localStorage.getItem("reels_app_password") || "";

export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const pwd = getStoredPassword();
  const headers = new Headers(options.headers || {});
  if (pwd) {
    headers.set("x-app-password", pwd);
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 && !url.includes("/api/auth/login") && !url.includes("/api/auth/status")) {
    window.dispatchEvent(new Event("auth_unauthorized"));
  }
  return res;
};

export interface BulkReelItem {
  id: string;
  videoUrl: string;
  fileName: string;
  title: string;
  caption: string;
  isGeneratingCaption?: boolean;
}

interface GeminiIdea {
  title: string;
  videoDescription: string;
  caption: string;
  suggestedTimeOffsetHours: number;
}

const VIDEO_PRESETS = [
  {
    name: "💻 Programação / Dev Setup",
    url: "https://assets.mixkit.co/videos/preview/mixkit-web-developer-working-on-his-computer-34283-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=60"
  },
  {
    name: "✈️ Trabalho Remoto / Nômade",
    url: "https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-computer-keyboard-close-up-11750-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&auto=format&fit=crop&q=60"
  },
  {
    name: "☕ Café & Foco Estético",
    url: "https://assets.mixkit.co/videos/preview/mixkit-coffee-cup-on-a-wooden-table-with-laptop-42231-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=400&auto=format&fit=crop&q=60"
  },
  {
    name: "📱 Smartphone / Redes Sociais",
    url: "https://assets.mixkit.co/videos/preview/mixkit-holding-a-smartphone-with-a-vertical-screen-41716-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=60"
  }
];

export function getAccountAvatar(username?: string, name?: string, customAvatar?: string): string {
  if (customAvatar && customAvatar.trim()) {
    return customAvatar.trim();
  }

  const u = (username || "").trim().replace(/^@/, "");
  const n = (name || "").trim();

  if (u === "todas_as_contas" || username === "all" || u === "all") {
    return `https://ui-avatars.com/api/?name=Todas+as+Contas&background=4F46E5&color=fff&size=200&bold=true`;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(n || u || "IG")}&background=E1306C&color=fff&size=200&bold=true`;
}

function AccountAvatar({
  username,
  name,
  customAvatar,
  className = "w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
}: {
  username?: string;
  name?: string;
  customAvatar?: string;
  className?: string;
}) {
  const primarySrc = getAccountAvatar(username, name, customAvatar);
  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || username || "IG")}&background=E1306C&color=fff&size=200&bold=true`;
  const [imgSrc, setImgSrc] = useState(primarySrc);

  useEffect(() => {
    setImgSrc(getAccountAvatar(username, name, customAvatar));
  }, [username, name, customAvatar]);

  return (
    <img
      src={imgSrc}
      alt={name || username || "Instagram Account"}
      referrerPolicy="no-referrer"
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
      className={className}
    />
  );
}

function AccountSelectDropdown({
  value,
  onChange,
  savedAccounts,
  className = "w-full"
}: {
  value: string;
  onChange: (id: string) => void;
  savedAccounts: SavedAccount[];
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedAccount = savedAccounts.find(a => a.id === value) || savedAccounts[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition flex items-center justify-between gap-2 cursor-pointer shadow-xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedAccount ? (
            <>
              <AccountAvatar
                username={selectedAccount.username}
                name={selectedAccount.name}
                customAvatar={selectedAccount.profilePictureUrl}
                className="w-6 h-6 rounded-full object-cover border border-indigo-200 dark:border-indigo-800 shrink-0"
              />
              <span className="truncate font-bold text-slate-900 dark:text-slate-100">
                @{selectedAccount.username.replace(/^@/, '')} <span className="text-slate-500 dark:text-slate-400 font-normal">({selectedAccount.name})</span>
              </span>
            </>
          ) : (
            <span className="text-slate-400">Selecione uma conta</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-64 overflow-y-auto p-1.5 space-y-1"
          >
            {savedAccounts.map((acc) => {
              const isSelected = acc.id === selectedAccount?.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    onChange(acc.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold border border-indigo-100 dark:border-indigo-900/40"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <AccountAvatar
                    username={acc.username}
                    name={acc.name}
                    customAvatar={acc.profilePictureUrl}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate text-slate-900 dark:text-slate-100">
                      @{acc.username.replace(/^@/, '')}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {acc.name}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-auto" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const MOCK_ACCOUNTS: any[] = [];

function VideoThumbnailWithDuration({
  src,
  poster,
  className = "w-20 sm:w-24 shrink-0 aspect-[9/16] bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group flex items-center justify-center shadow-sm"
}: {
  src?: string;
  poster?: string;
  className?: string;
}) {
  const [durationText, setDurationText] = useState<string>("0:00");
  const [hasError, setHasError] = useState(false);
  const [generatedPoster, setGeneratedPoster] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const cleanSrc = useMemo(() => {
    if (!src) return "";
    return src.trim();
  }, [src]);

  useEffect(() => {
    setHasError(false);
    setDurationText("0:00");
    setGeneratedPoster(null);

    const video = videoRef.current;
    if (!video || !cleanSrc) return;

    let isCancelled = false;

    const checkAndFormatDuration = () => {
      if (isCancelled || !video) return;
      if (video.duration && isFinite(video.duration) && !isNaN(video.duration) && video.duration > 0) {
        const m = Math.floor(video.duration / 60);
        const s = Math.floor(video.duration % 60);
        setDurationText(`${m}:${s < 10 ? "0" : ""}${s}`);
      }
    };

    const tryExtractCanvasFrame = () => {
      if (isCancelled || !video) return;
      checkAndFormatDuration();
      if (!poster && video.videoWidth > 0 && video.videoHeight > 0) {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            if (dataUrl && dataUrl.length > 200) {
              setGeneratedPoster(dataUrl);
            }
          }
        } catch (err) {
          // Cross-origin restriction fallback
        }
      }
    };

    const handleLoadedMetadata = () => {
      checkAndFormatDuration();
      try {
        if (video.currentTime === 0) {
          video.currentTime = 0.1;
        }
      } catch (e) {}
    };

    const handleSeeked = () => {
      tryExtractCanvasFrame();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadeddata", tryExtractCanvasFrame);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("canplay", tryExtractCanvasFrame);
    video.addEventListener("durationchange", checkAndFormatDuration);

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }
    if (video.readyState >= 2) {
      tryExtractCanvasFrame();
    }

    return () => {
      isCancelled = true;
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", tryExtractCanvasFrame);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("canplay", tryExtractCanvasFrame);
      video.removeEventListener("durationchange", checkAndFormatDuration);
    };
  }, [cleanSrc, poster]);

  const activePoster = poster || generatedPoster;

  return (
    <div
      className={className}
      style={{ aspectRatio: "9/16" }}
      onMouseEnter={() => {
        if (videoRef.current && !hasError) {
          videoRef.current.play().catch(() => {});
        }
      }}
      onMouseLeave={() => {
        if (videoRef.current && !hasError) {
          videoRef.current.pause();
          try {
            videoRef.current.currentTime = 0.1;
          } catch (e) {}
        }
      }}
    >
      {/* 1. Show image poster if available */}
      {activePoster && (
        <img
          src={activePoster}
          alt="Preview 9:16"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      {/* 2. Video element for frame decoding & hover preview */}
      {cleanSrc && !hasError && (
        <video
          ref={videoRef}
          src={cleanSrc}
          poster={activePoster || undefined}
          preload="auto"
          muted
          playsInline
          loop
          className={`w-full h-full object-cover relative z-10 transition-opacity duration-200 ${
            activePoster ? "opacity-90 group-hover:opacity-100" : "opacity-100"
          }`}
          onError={(e) => {
            const v = e.currentTarget;
            if (v.error && v.error.code !== 0 && !activePoster) {
              setHasError(true);
            }
          }}
        />
      )}

      {/* 3. Fallback box if no cleanSrc or error and no active poster */}
      {(!cleanSrc || (hasError && !activePoster)) && (
        <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-black flex flex-col items-center justify-center text-slate-300 text-[10px] p-2 text-center relative overflow-hidden z-0">
          <div className="absolute inset-0 bg-indigo-500/10 blur-xl"></div>
          <div className="w-8 h-14 rounded-lg border border-indigo-500/40 bg-indigo-900/30 flex flex-col items-center justify-center p-1 mb-1 shadow-inner relative z-10">
            <Play className="h-4 w-4 text-indigo-400 fill-indigo-400/30" />
            <span className="text-[7px] font-extrabold text-indigo-300 mt-0.5 uppercase">REELS</span>
          </div>
          <span className="font-extrabold text-[9px] text-slate-200 relative z-10">Reel 9:16</span>
        </div>
      )}

      {/* Overlay with video duration badge & play icon */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-1.5 pointer-events-none z-20">
        <span className="text-[9px] font-extrabold text-white bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded flex items-center gap-1 shadow-xs border border-white/10">
          <Play className="h-2 w-2 fill-white text-white" /> {durationText !== "0:00" ? durationText : "0:15"}
        </span>
      </div>
    </div>
  );
}

function LockScreen({ onLoginSuccess }: { onLoginSuccess: (pwd: string) => void }) {
  const [inputPassword, setInputPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPassword.trim()) return;
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: inputPassword.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("reels_app_password", inputPassword.trim());
        onLoginSuccess(inputPassword.trim());
      } else {
        setErrorMsg(data.error || "Senha de acesso incorreta.");
      }
    } catch (err) {
      setErrorMsg("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 via-purple-950/20 to-slate-950 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10 text-center"
      >
        <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight mb-2">
          Acesso Protegido
        </h2>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          Este Agendador de Reels está protegido por senha de segurança. Digite sua senha para entrar.
        </p>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-semibold text-rose-400 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Key className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="Digite sua senha secreta..."
              required
              autoFocus
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 px-6 rounded-2xl text-sm shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Entrar no Sistema</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function PasswordSecurityCard() {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd && newPwd !== confirmPwd) {
      setStatusMsg({ type: 'error', text: 'A confirmação de senha não coincide.' });
      return;
    }
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await authenticatedFetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPwd.trim(),
          newPassword: newPwd.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (newPwd.trim()) {
          localStorage.setItem("reels_app_password", newPwd.trim());
        } else {
          localStorage.removeItem("reels_app_password");
        }
        setStatusMsg({ type: 'success', text: data.message });
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
      } else {
        setStatusMsg({ type: 'error', text: data.error || "Erro ao atualizar senha." });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: "Erro ao se comunicar com o servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Proteção por Senha de Acesso
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Defina uma senha secreta para que somente você possa acessar o painel online no Render.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSavePassword} className="space-y-3 pt-1">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Senha Atual (se já configurou anteriormente)
          </label>
          <input
            type="password"
            value={currentPwd}
            onChange={(e) => setCurrentPwd(e.target.value)}
            placeholder="Senha atual (deixe em branco se for a primeira vez)"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nova Senha de Acesso
            </label>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="Digite a nova senha..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Repita a nova senha..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-tight">
          * Para remover a proteção por senha, deixe a "Nova Senha" em branco e clique em Salvar.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          <span>Salvar Senha de Proteção</span>
        </button>
      </form>
    </div>
  );
}

export default function App() {
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Auth states
  const [requirePassword, setRequirePassword] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/status");
      if (res.ok) {
        const data = await res.json();
        if (data.requirePassword) {
          setRequirePassword(true);
          const storedPwd = getStoredPassword();
          if (!storedPwd) {
            setIsAuthenticated(false);
          } else {
            const loginRes = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password: storedPwd }),
            });
            const loginData = await loginRes.json();
            if (loginRes.ok && loginData.success) {
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
              localStorage.removeItem("reels_app_password");
            }
          }
        } else {
          setRequirePassword(false);
          setIsAuthenticated(true);
        }
      }
    } catch (err) {
      console.error("Error checking auth status:", err);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      localStorage.removeItem("reels_app_password");
    };
    window.addEventListener("auth_unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth_unauthorized", handleUnauthorized);
  }, []);

  // App States
  const [reels, setReels] = useState<Reel[]>([]);
  const [settings, setSettings] = useState<Settings>({
    instagramAccountId: "",
    facebookAccessToken: "",
    sandboxMode: true,
    intervalHours: 1,
    autoScheduleEnabled: true,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSidebarAccountDropdown, setShowSidebarAccountDropdown] = useState(false);
  const [showHeaderAccountDropdown, setShowHeaderAccountDropdown] = useState(false);
  const [showCardAccountDropdown, setShowCardAccountDropdown] = useState(false);

  // Add Account Modal States
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newAccUsername, setNewAccUsername] = useState("");
  const [newAccId, setNewAccId] = useState("");
  const [newAccToken, setNewAccToken] = useState("");
  const [newAccSandbox, setNewAccSandbox] = useState(true);
  const [newAccAvatar, setNewAccAvatar] = useState("");

  // Form States
  const [singleTargetAccountId, setSingleTargetAccountId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newThumbnailUrl, setNewThumbnailUrl] = useState("");
  const [scheduledMinutesOffset, setScheduledMinutesOffset] = useState<number>(20);
  const [customScheduleMode, setCustomScheduleMode] = useState<"preset" | "custom_datetime">("preset");
  const [customDateTime, setCustomDateTime] = useState<string>("");
  const [captionContext, setCaptionContext] = useState("");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoInputType, setVideoInputType] = useState<"upload" | "url">("upload");

  // Schedule Mode: "single" | "bulk"
  const [scheduleMode, setScheduleMode] = useState<"single" | "bulk">("single");

  // Bulk Scheduling States
  const [bulkItems, setBulkItems] = useState<BulkReelItem[]>([]);
  const [bulkInputType, setBulkInputType] = useState<"files" | "urls" | "presets">("files");
  const [bulkUrlsText, setBulkUrlsText] = useState("");
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [bulkUploadError, setBulkUploadError] = useState<string | null>(null);

  // Bulk Scheduling Options
  const [bulkStartMode, setBulkStartMode] = useState<"now" | "preset_20" | "preset_60" | "tomorrow_9am" | "tomorrow_6pm" | "custom">("now");
  const [bulkCustomStartDateTime, setBulkCustomStartDateTime] = useState<string>("");
  const [bulkIntervalMinutes, setBulkIntervalMinutes] = useState<number>(30);
  const [bulkTargetAccountId, setBulkTargetAccountId] = useState<string>("");
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [isGeneratingBulkCaptions, setIsGeneratingBulkCaptions] = useState(false);

  // Helper to calculate start Date object for bulk scheduling
  const getBulkStartDate = (): Date => {
    const now = new Date();
    if (bulkStartMode === "now") {
      return now;
    } else if (bulkStartMode === "preset_20") {
      return new Date(now.getTime() + 20 * 60 * 1000);
    } else if (bulkStartMode === "preset_60") {
      return new Date(now.getTime() + 60 * 60 * 1000);
    } else if (bulkStartMode === "tomorrow_9am") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return tomorrow;
    } else if (bulkStartMode === "tomorrow_6pm") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);
      return tomorrow;
    } else if (bulkStartMode === "custom" && bulkCustomStartDateTime) {
      const d = new Date(bulkCustomStartDateTime);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date(now.getTime() + 20 * 60 * 1000);
  };

  // Calculate scheduled date for index i in bulk items
  const getBulkItemScheduledDate = (index: number): Date => {
    const startDate = getBulkStartDate();
    return new Date(startDate.getTime() + index * bulkIntervalMinutes * 60 * 1000);
  };

  // Format date helper for bulk preview badges
  const formatBulkDateBadge = (date: Date): string => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

// Helper function to upload files in chunks (4MB per chunk) to bypass proxy/server size limits
async function uploadFileInChunks(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ videoUrl: string; fileName: string }> {
  const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
  const uploadId = "up-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);

  let lastResult: { videoUrl?: string; fileName?: string } = {};

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunkBlob = file.slice(start, end);

    const formData = new FormData();
    formData.append("chunk", chunkBlob, file.name);
    formData.append("uploadId", uploadId);
    formData.append("chunkIndex", i.toString());
    formData.append("totalChunks", totalChunks.toString());
    formData.append("fileName", file.name);

    let attempts = 0;
    let res: Response | null = null;
    let data: any = null;

    while (attempts < 3) {
      try {
        res = await fetch("/api/upload-chunk", {
          method: "POST",
          body: formData,
        });
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { error: "Erro de formato na resposta do servidor." };
        }
        if (res.ok && !data?.error) break;
      } catch (e) {
        // network retry
      }
      attempts++;
      if (attempts < 3) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    if (!res || !res.ok || data?.error) {
      throw new Error(data?.error || `Falha ao enviar o arquivo "${file.name}" (parte ${i + 1}/${totalChunks}).`);
    }

    if (onProgress) {
      const pct = Math.round(((i + 1) / totalChunks) * 100);
      onProgress(pct);
    }

    if (data && (data.completed || data.videoUrl)) {
      lastResult = { videoUrl: data.videoUrl, fileName: data.fileName || file.name };
    }
  }

  // If auto-assembly didn't complete during chunk iteration, request explicit finish merge
  if (!lastResult.videoUrl) {
    try {
      const finishRes = await fetch("/api/upload-chunk/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          totalChunks,
          fileName: file.name
        })
      });
      if (finishRes.ok) {
        const finishData = await finishRes.json();
        if (finishData.completed && finishData.videoUrl) {
          lastResult = { videoUrl: finishData.videoUrl, fileName: finishData.fileName || file.name };
        }
      } else {
        const finishErr = await finishRes.json().catch(() => null);
        if (finishErr?.error) {
          throw new Error(finishErr.error);
        }
      }
    } catch (e: any) {
      if (e.message && !e.message.includes("fetch")) {
        throw e;
      }
    }
  }

  if (!lastResult.videoUrl) {
    throw new Error(`Erro ao concluir a junção do arquivo de vídeo "${file.name}".`);
  }

  return lastResult as { videoUrl: string; fileName: string };
}

  // Upload multiple video files sequentially in chunks
  const handleBulkFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingBulk(true);
    setBulkUploadError(null);
    setBulkUploadProgress({ current: 1, total: files.length });

    const newItems: BulkReelItem[] = [];
    const errorList: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setBulkUploadProgress({ current: i + 1, total: files.length });

      if (!file.type.startsWith("video/")) {
        errorList.push(`"${file.name}" não é um arquivo de vídeo válido.`);
        continue;
      }

      try {
        const result = await uploadFileInChunks(file);
        const rawName = result.fileName || file.name;
        const cleanTitle = rawName
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .trim();

        newItems.push({
          id: "bulk-item-" + Date.now() + "-" + i + "-" + Math.random(),
          videoUrl: result.videoUrl,
          fileName: rawName,
          title: cleanTitle ? (cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)) : `Vídeo ${bulkItems.length + newItems.length + 1}`,
          caption: "",
        });
      } catch (err: any) {
        console.error("Error uploading file in bulk:", file.name, err);
        errorList.push(err.message || `"${file.name}": Erro de conexão com o servidor.`);
      }
    }

    if (newItems.length > 0) {
      setBulkItems((prev) => [...prev, ...newItems]);
    }

    if (errorList.length > 0) {
      setBulkUploadError(errorList.join(" | "));
    }

    setIsUploadingBulk(false);
    setBulkUploadProgress(null);
    e.target.value = "";
  };

  // Parse bulk URLs from textarea
  const handleAddBulkUrls = () => {
    if (!bulkUrlsText.trim()) return;
    const lines = bulkUrlsText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && (l.startsWith("http://") || l.startsWith("https://")));

    if (lines.length === 0) {
      alert("Por favor, insira pelo menos uma URL válida de vídeo (começando com http:// ou https://).");
      return;
    }

    const newItems: BulkReelItem[] = lines.map((url, idx) => {
      return {
        id: "bulk-url-" + Date.now() + "-" + idx + "-" + Math.random(),
        videoUrl: url,
        fileName: `Video_URL_${bulkItems.length + idx + 1}.mp4`,
        title: `Reel #${bulkItems.length + idx + 1}`,
        caption: "",
      };
    });

    setBulkItems((prev) => [...prev, ...newItems]);
    setBulkUrlsText("");
  };

  // Add all preset model videos to bulk
  const handleAddAllPresetsToBulk = () => {
    const newItems: BulkReelItem[] = VIDEO_PRESETS.map((preset, idx) => ({
      id: "bulk-preset-" + Date.now() + "-" + idx,
      videoUrl: preset.url,
      fileName: preset.name,
      title: preset.name.replace(/^[^\wáéíóúâêîôûãõç]+/i, "").trim(),
      caption: `🔥 Confira esse conteúdo incrível sobre ${preset.name}!\n\n💬 Curtiu? Deixe seu comentário e siga a página para mais!\n\n#reels #viral #instagram #conteudo`,
    }));
    setBulkItems((prev) => [...prev, ...newItems]);
  };

  // Generate captions for all bulk items using Gemini
  const handleBulkGenerateCaptions = async () => {
    if (bulkItems.length === 0) return;
    setIsGeneratingBulkCaptions(true);

    try {
      const updated = [...bulkItems];
      for (let i = 0; i < updated.length; i++) {
        if (!updated[i].caption || updated[i].caption.trim() === "") {
          try {
            const res = await fetch("/api/gemini/generate-caption", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: updated[i].title,
                context: "Gere legenda atraente em português para Instagram Reels.",
              }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.caption) {
                updated[i] = { ...updated[i], caption: data.caption };
                setBulkItems([...updated]);
              }
            }
          } catch (e) {
            console.error("Error generating bulk caption for item", i, e);
          }
        }
      }
    } finally {
      setIsGeneratingBulkCaptions(false);
    }
  };

  // Submit bulk items to backend
  const handleSubmitBulkReels = async () => {
    if (bulkItems.length === 0) {
      alert("Adicione pelo menos um vídeo para agendar em lote.");
      return;
    }

    setIsSubmittingBulk(true);

    const targetAccId = bulkTargetAccountId || settings.instagramAccountId || savedAccounts[0]?.id;
    const matchedAcc = savedAccounts.find((a) => a.id === targetAccId) || savedAccounts[0];

    const payloadItems = bulkItems.map((item, idx) => {
      const scheduledDate = getBulkItemScheduledDate(idx);
      return {
        title: item.title || `Reel em Lote #${idx + 1}`,
        videoUrl: item.videoUrl,
        caption: item.caption,
        scheduledTime: scheduledDate.toISOString(),
        accountId: matchedAcc?.id,
        accountName: matchedAcc?.name,
        accountUsername: matchedAcc?.username,
        accountAvatar: matchedAcc?.profilePictureUrl,
      };
    });

    try {
      const res = await fetch("/api/reels/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payloadItems }),
      });

      if (res.ok) {
        setBulkItems([]);
        setBulkUrlsText("");
        setScheduleMode("single");
        fetchState();
      } else {
        const data = await res.json();
        alert("Erro ao agendar em lote: " + (data.error || "Tente novamente."));
      }
    } catch (err) {
      console.error("Error submitting bulk reels:", err);
      alert("Erro de conexão ao enviar agendamentos em lote.");
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // Helper for formatting interval display
  const formatIntervalText = (intervalHours: number) => {
    if (intervalHours < 1) {
      const mins = Math.round(intervalHours * 60);
      return `${mins} minuto${mins > 1 ? "s" : ""}`;
    }
    return `${intervalHours} hora${intervalHours > 1 ? "s" : ""}`;
  };

  // Live Clock State for real-time countdown (updates every 1s)
  const [nowTime, setNowTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute real-time countdown to the next scheduled post
  const getNextPostCountdown = () => {
    if (!settings.autoScheduleEnabled) {
      return {
        statusText: "AUTOMAÇÃO PAUSADA",
        timeText: "Pausada",
        subText: "Fila de envios desativada",
        progressPercent: 0,
        reel: null,
      };
    }

    const pending = reels.filter((r) => r.status === "scheduled");
    if (pending.length === 0) {
      return {
        statusText: "PRÓXIMO POST SAI EM:",
        timeText: "Fila Vazia",
        subText: "Nenhum Reel agendado",
        progressPercent: 0,
        reel: null,
      };
    }

    // Sort scheduled reels by scheduledTime ascending
    const sorted = [...pending].sort(
      (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
    const nextReel = sorted[0];
    const targetTime = new Date(nextReel.scheduledTime).getTime();
    const diffMs = targetTime - nowTime;

    if (diffMs <= 0) {
      return {
        statusText: "PRÓXIMO POST SAI EM:",
        timeText: "Postando agora... 🚀",
        subText: nextReel.title || "Publicando vídeo...",
        progressPercent: 100,
        reel: nextReel,
      };
    }

    const totalSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    let formattedTime = "";
    if (hours > 0) {
      formattedTime = `${hours}h ${mins < 10 ? "0" : ""}${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
    } else if (mins > 0) {
      formattedTime = `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
    } else {
      formattedTime = `${secs}s`;
    }

    // Calculate progress percentage relative to interval
    const intervalMs = (settings.intervalHours || 1) * 60 * 60 * 1000;
    const elapsedMs = intervalMs - diffMs;
    const progressPercent = Math.min(
      100,
      Math.max(5, Math.floor((elapsedMs / intervalMs) * 100))
    );

    return {
      statusText: "PRÓXIMO POST SAI EM:",
      timeText: formattedTime,
      subText: nextReel.title,
      progressPercent,
      reel: nextReel,
    };
  };

  const countdownInfo = getNextPostCountdown();

  // UI States
  const [showSettings, setShowSettings] = useState(false);
  const [expandedCaptionId, setExpandedCaptionId] = useState<string | null>(null);
  const [copiedReelId, setCopiedReelId] = useState<string | null>(null);
  const [activeManualPostId, setActiveManualPostId] = useState<string | null>(null);

  // Gemini states
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [nicheInput, setNicheInput] = useState("Marketing Digital");
  const [suggestedIdeas, setSuggestedIdeas] = useState<GeminiIdea[]>([]);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  // Active Instagram account logo & profile info
  const [igAccountInfo, setIgAccountInfo] = useState<{
    username: string;
    name: string;
    profilePictureUrl: string;
  } | null>(null);

  // Active Account Page Metrics (Seguidores, Ganhos Hoje, Views)
  const [accountMetrics, setAccountMetrics] = useState<AccountMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isPublishingReelId, setIsPublishingReelId] = useState<string | null>(null);

  // Active or Fallback Saved Accounts list
  const savedAccounts = Array.isArray(settings.savedAccounts)
    ? settings.savedAccounts.map(acc => ({
        ...acc,
        profilePictureUrl: getAccountAvatar(acc.username, acc.name, acc.profilePictureUrl)
      }))
    : [
        {
          id: "17841444327391481",
          username: "favelanareal",
          name: "Favela na Real",
          profilePictureUrl: getAccountAvatar("favelanareal", "Favela na Real"),
          sandboxMode: true
        }
      ];

  const consolidatedAccount: SavedAccount = {
    id: "all",
    username: "todas_as_contas",
    name: `Visão Geral (${savedAccounts.length} Contas)`,
    profilePictureUrl: getAccountAvatar("todas_as_contas", `Visão Geral (${savedAccounts.length} Contas)`),
    sandboxMode: true
  };

  const allAccountsList = [consolidatedAccount, ...savedAccounts];

  const activeAccountId = settings.instagramAccountId || "all";

  const fetchAccountMetrics = async (accId: string) => {
    if (!accId) return;
    setIsLoadingMetrics(true);
    try {
      const res = await fetch(`/api/accounts/${accId}/insights`);
      if (res.ok) {
        const data = await res.json();
        setAccountMetrics(data);
      }
    } catch (err) {
      console.error("Error fetching account metrics:", err);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const handleResetBaseline = async () => {
    if (!activeAccountId) return;
    setIsLoadingMetrics(true);
    try {
      const res = await fetch(`/api/accounts/${activeAccountId}/reset-baseline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await fetchAccountMetrics(activeAccountId);
      }
    } catch (err) {
      console.error("Error resetting baseline:", err);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (activeAccountId) {
      fetchAccountMetrics(activeAccountId);
    }
  }, [activeAccountId]);

  const formatNumberPt = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "M";
    }
    return num.toLocaleString("pt-BR");
  };

  // Load state from backend
  const fetchState = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch("/api/state");
      if (res.ok) {
        const text = await res.text();
        try {
          const data: QueueState = JSON.parse(text);
          if (data && Array.isArray(data.reels)) {
            setReels(data.reels);
            setSettings(data.settings);
            setLogs(data.logs);
          }
        } catch (jsonErr) {
          console.warn("fetchState received invalid JSON:", text.substring(0, 100));
        }
      }
    } catch (err) {
      console.error("Failed to fetch state:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Poll state every 3 seconds to keep logs/status in sync
  useEffect(() => {
    fetchState();
    const interval = setInterval(() => {
      fetchState(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch or mock Instagram Account Info (Logo, Name, Username)
  useEffect(() => {
    if (settings.instagramAccountId === "all" || !settings.instagramAccountId) {
      setIgAccountInfo({
        username: "todas_as_contas",
        name: `Visão Geral Consolidada (${savedAccounts.length} Contas)`,
        profilePictureUrl: getAccountAvatar("todas_as_contas", "Visão Geral")
      });
      return;
    }

    if (settings.sandboxMode) {
      const matched = savedAccounts.find(acc => acc.id === settings.instagramAccountId);
      if (matched) {
        setIgAccountInfo({
          username: matched.username,
          name: matched.name,
          profilePictureUrl: getAccountAvatar(matched.username, matched.name, matched.profilePictureUrl)
        });
      } else {
        setIgAccountInfo({
          username: "todas_as_contas",
          name: `Visão Geral Consolidada (${savedAccounts.length} Contas)`,
          profilePictureUrl: getAccountAvatar("todas_as_contas", "Visão Geral")
        });
      }
    } else if (settings.instagramAccountId && settings.facebookAccessToken) {
      let active = true;
      const fetchIgInfo = async () => {
        try {
          const res = await fetch(
            `https://graph.facebook.com/v19.0/${settings.instagramAccountId}?fields=username,name,profile_picture_url&access_token=${settings.facebookAccessToken}`
          );
          if (res.ok) {
            const data = await res.json();
            if (active && data && !data.error) {
              const realAvatar = getAccountAvatar(data.username, data.name, data.profile_picture_url);
              setIgAccountInfo({
                username: data.username || "conta_instagram",
                name: data.name || "Instagram Business",
                profilePictureUrl: realAvatar
              });
            }
          }
        } catch (err) {
          console.error("Failed to fetch Instagram profile info:", err);
        }
      };
      fetchIgInfo();
      return () => {
        active = false;
      };
    } else {
      const matched = savedAccounts.find(acc => acc.id === settings.instagramAccountId);
      if (matched) {
        setIgAccountInfo({
          username: matched.username,
          name: matched.name,
          profilePictureUrl: getAccountAvatar(matched.username, matched.name, matched.profilePictureUrl)
        });
      } else {
        setIgAccountInfo({
          username: "todas_as_contas",
          name: `Visão Geral Consolidada (${savedAccounts.length} Contas)`,
          profilePictureUrl: getAccountAvatar("todas_as_contas", "Visão Geral")
        });
      }
    }
  }, [settings.instagramAccountId, settings.facebookAccessToken, settings.sandboxMode, settings.savedAccounts, savedAccounts.length]);

  // Upload Video Helper
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check if it is a video file
    if (!file.type.startsWith("video/")) {
      setUploadError("Por favor, selecione um arquivo de vídeo válido.");
      return;
    }

    setIsUploadingVideo(true);
    setUploadError(null);

    // Generate local thumbnail preview immediately from file blob
    try {
      const blobUrl = URL.createObjectURL(file);
      const tempVideo = document.createElement("video");
      tempVideo.src = blobUrl;
      tempVideo.muted = true;
      tempVideo.playsInline = true;
      tempVideo.onloadeddata = () => {
        try {
          tempVideo.currentTime = 0.1;
        } catch (e) {}
      };
      tempVideo.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = tempVideo.videoWidth || 360;
          canvas.height = tempVideo.videoHeight || 640;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
            const thumb = canvas.toDataURL("image/jpeg", 0.85);
            if (thumb && thumb.length > 200) {
              setNewThumbnailUrl(thumb);
            }
          }
        } catch (e) {
          console.warn("Could not extract local thumbnail", e);
        } finally {
          URL.revokeObjectURL(blobUrl);
        }
      };
    } catch (e) {}

    try {
      const result = await uploadFileInChunks(file);
      setNewVideoUrl(result.videoUrl);
      setUploadedFileName(result.fileName || file.name);
    } catch (err: any) {
      console.error("Error uploading video:", err);
      setUploadError(err.message || "Erro de conexão com o servidor de upload.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Publish specific reel immediately ("Postar Agora")
  const handlePublishImmediately = async (id: string) => {
    if (isPublishingReelId) return;
    setIsPublishingReelId(id);
    try {
      const res = await fetch(`/api/reels/${id}/publish`, { method: "POST" });
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { error: "Resposta inesperada do servidor." };
      }

      if (res.ok) {
        alert("🎉 Reel publicado com SUCESSO no Instagram!");
      } else {
        alert("❌ Erro ao publicar: " + (data.error || "Verifique suas credenciais e os logs do console."));
      }
      fetchState();
    } catch (err) {
      console.error("Error publishing immediately:", err);
      alert("Erro ao conectar com o servidor para publicar.");
    } finally {
      setIsPublishingReelId(null);
    }
  };

  // Create Scheduled Reel
  const handleAddReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (!newVideoUrl) {
      alert(
        videoInputType === "upload"
          ? "Por favor, envie um arquivo de vídeo do seu computador."
          : "Por favor, insira a URL direta de um vídeo público."
      );
      return;
    }

    // Calculate future scheduled time based on minutes offset or explicit custom datetime
    let scheduledDate = new Date();
    const isPublishNow = customScheduleMode === "preset" && scheduledMinutesOffset === 0;

    if (customScheduleMode === "custom_datetime" && customDateTime) {
      scheduledDate = new Date(customDateTime);
    } else if (!isPublishNow) {
      scheduledDate.setMinutes(scheduledDate.getMinutes() + scheduledMinutesOffset);
    }

    const targetAccId = singleTargetAccountId || settings.instagramAccountId;
    const activeAcc = savedAccounts.find(a => a.id === targetAccId) || savedAccounts[0];

    try {
      const matchingPreset = VIDEO_PRESETS.find(p => p.url === newVideoUrl);
      const finalThumbnailUrl = newThumbnailUrl || matchingPreset?.thumbnail || undefined;

      const res = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          videoUrl: newVideoUrl,
          thumbnailUrl: finalThumbnailUrl,
          caption: newCaption,
          scheduledTime: scheduledDate.toISOString(),
          publishNow: isPublishNow,
          accountId: targetAccId || activeAcc?.id,
          accountName: activeAcc?.name || igAccountInfo?.name || "Conta Instagram",
          accountUsername: activeAcc?.username || igAccountInfo?.username || "instagram",
          accountAvatar: activeAcc?.profilePictureUrl || igAccountInfo?.profilePictureUrl || getAccountAvatar("instagram", "Conta"),
        }),
      });

      if (res.ok) {
        // Reset Form
        setNewTitle("");
        setNewCaption("");
        setCaptionContext("");
        setScheduledMinutesOffset(20);
        setCustomScheduleMode("preset");
        setCustomDateTime("");
        setUploadedFileName("");
        setNewVideoUrl("");
        setNewThumbnailUrl("");
        fetchState();
      }
    } catch (err) {
      console.error("Error scheduling reel:", err);
    }
  };

  // Delete Reel
  const handleDeleteReel = async (id: string) => {
    try {
      const res = await fetch(`/api/reels/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error("Error deleting reel:", err);
    }
  };

  // Update Settings
  const handleSaveSettings = async (updatedSettings: Partial<Settings>) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error("Error updating settings:", err);
    }
  };

  const handleSelectSavedAccount = (account: SavedAccount) => {
    const isAll = account.id === "all";
    const avatar = isAll
      ? getAccountAvatar("todas_as_contas", "Visão Geral")
      : getAccountAvatar(account.username, account.name, account.profilePictureUrl);

    const newAccountId = account.id;
    const newFbToken = account.facebookAccessToken || "";
    const newSandbox = account.sandboxMode !== undefined ? account.sandboxMode : true;

    setSettings(prev => ({
      ...prev,
      instagramAccountId: newAccountId,
      facebookAccessToken: newFbToken,
      sandboxMode: newSandbox,
    }));

    if (isAll) {
      setIgAccountInfo({
        username: "todas_as_contas",
        name: `Visão Geral Consolidada (${savedAccounts.length} Contas)`,
        profilePictureUrl: avatar
      });
    } else {
      setIgAccountInfo({
        username: account.username,
        name: account.name,
        profilePictureUrl: avatar
      });
    }

    setShowSidebarAccountDropdown(false);
    setShowHeaderAccountDropdown(false);
    setShowCardAccountDropdown(false);

    handleSaveSettings({
      instagramAccountId: newAccountId,
      facebookAccessToken: newFbToken,
      sandboxMode: newSandbox,
    });

    fetchAccountMetrics(newAccountId);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccUsername) return;

    const generatedId = newAccId.trim() || ("178414" + Math.floor(1000000000 + Math.random() * 9000000000));
    const usernameClean = newAccUsername.trim().replace(/^@/, "");
    const accName = newAccName.trim() || `@${usernameClean}`;
    const avatar = getAccountAvatar(usernameClean, accName, newAccAvatar);

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: generatedId,
          username: usernameClean,
          name: accName,
          profilePictureUrl: avatar,
          facebookAccessToken: newAccToken.trim(),
          sandboxMode: newAccSandbox,
          makeActive: true
        })
      });

      if (res.ok) {
        setShowAddAccountModal(false);
        setNewAccName("");
        setNewAccUsername("");
        setNewAccId("");
        setNewAccToken("");
        setNewAccSandbox(true);
        setNewAccAvatar("");
        fetchState();
      }
    } catch (err) {
      console.error("Error saving account:", err);
    }
  };

  const handleDeleteSavedAccount = async (e: React.MouseEvent, accountId: string, accountUsername?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const nameStr = accountUsername ? `@${accountUsername}` : "esta conta";
    if (!window.confirm(`Tem certeza de que deseja remover ${nameStr} das contas salvas?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/accounts/${accountId}`, { method: "DELETE" });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  };

  // Trigger Immediate Publication
  const handleTriggerNow = async () => {
    try {
      const res = await fetch("/api/scheduler/trigger", { method: "POST" });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error("Error forcing publication:", err);
    }
  };

  // Clear system logs
  const handleClearLogs = async () => {
    try {
      const res = await fetch("/api/scheduler/clear-logs", { method: "POST" });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error("Error clearing logs:", err);
    }
  };

  // Use Gemini to generate high-converting captions
  const handleGenerateCaption = async () => {
    if (!newTitle) {
      alert("Por favor, digite o título do vídeo primeiro para orientar a Inteligência Artificial.");
      return;
    }
    setIsGeneratingCaption(true);
    setGeminiError(null);
    try {
      const res = await fetch("/api/gemini/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          context: captionContext,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewCaption(data.caption);
      } else {
        setGeminiError(data.error || "Ocorreu um erro ao gerar a legenda.");
      }
    } catch (err) {
      setGeminiError("Falha na conexão com o servidor de Inteligência Artificial.");
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  // Use Gemini to suggest 4 smart creative ideas
  const handleGenerateIdeas = async () => {
    if (!nicheInput.trim()) return;
    setIsGeneratingIdeas(true);
    setSuggestedIdeas([]);
    setGeminiError(null);
    try {
      const res = await fetch("/api/gemini/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: nicheInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuggestedIdeas(data);
      } else {
        setGeminiError(data.error || "Não foi possível gerar sugestões.");
      }
    } catch (err) {
      setGeminiError("Falha na conexão com o servidor de Inteligência Artificial.");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  // Auto-schedule an AI Suggested Idea
  const handleScheduleIdea = (idea: GeminiIdea) => {
    const scheduledDate = new Date();
    scheduledDate.setHours(scheduledDate.getHours() + idea.suggestedTimeOffsetHours);

    // Populate and trigger form submit simulation
    setNewTitle(idea.title);
    setNewCaption(idea.caption);
    setScheduledMinutesOffset(idea.suggestedTimeOffsetHours * 60);
    setCustomScheduleMode("preset");
    setCaptionContext(idea.videoDescription);
    
    // Smooth scroll to top form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Format date correctly
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + " - " + d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  // Stats calculations
  const filteredReels = activeAccountId === "all"
    ? reels
    : reels.filter(r => !r.accountId || r.accountId === activeAccountId);

  const nextScheduledReel = filteredReels.find(r => r.status === "scheduled");
  const nextPostText = nextScheduledReel 
    ? new Date(nextScheduledReel.scheduledTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "Fila Vazia";

  const publishedCount = filteredReels.filter(r => r.status === "published").length;
  const scheduledCount = filteredReels.filter(r => r.status === "scheduled").length;

  if (requirePassword && !isAuthenticated) {
    return (
      <LockScreen
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          fetchState();
        }}
      />
    );
  }

  return (
    <div id="app" className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Click-outside backdrop overlay to close account dropdowns */}
      {(showSidebarAccountDropdown || showHeaderAccountDropdown || showCardAccountDropdown) && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
          onClick={() => {
            setShowSidebarAccountDropdown(false);
            setShowHeaderAccountDropdown(false);
            setShowCardAccountDropdown(false);
          }}
        />
      )}

      {/* Sidebar navigation */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col shrink-0 sticky top-0 h-screen z-50">
        {/* Brand logo & active profile wrapper with click-to-change account selection */}
        <div className="relative z-50">
          <button 
            onClick={() => {
              setShowSidebarAccountDropdown(!showSidebarAccountDropdown);
              setShowHeaderAccountDropdown(false);
              setShowCardAccountDropdown(false);
            }}
            className="w-full text-left focus:outline-none cursor-pointer"
          >
            <div className="p-6 flex items-center gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition rounded-t-2xl">
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-indigo-100 dark:shadow-none shadow-lg flex items-center justify-center text-white font-bold shrink-0">
                <Instagram className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">ReelFlow</span>
                  <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
                </div>
                <span className="text-[10px] block text-slate-400 font-medium">by InstaReels</span>
              </div>
            </div>
          </button>

          {igAccountInfo && (
            <div className="mx-4 mb-4">
              <button 
                onClick={() => {
                  setShowSidebarAccountDropdown(!showSidebarAccountDropdown);
                  setShowHeaderAccountDropdown(false);
                  setShowCardAccountDropdown(false);
                }}
                className="w-full p-3 bg-indigo-50/40 dark:bg-indigo-950/40 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/70 active:scale-[0.98] border border-indigo-100/50 dark:border-indigo-900/50 rounded-2xl flex items-center gap-3 shadow-xs transition text-left cursor-pointer"
              >
                <AccountAvatar 
                  username={igAccountInfo.username} 
                  name={igAccountInfo.name} 
                  customAvatar={igAccountInfo.profilePictureUrl} 
                  className="w-10 h-10 rounded-full object-cover border border-indigo-200 dark:border-indigo-800 shadow-xs" 
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate leading-tight">{igAccountInfo.name}</p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">@{igAccountInfo.username}</p>
                </div>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 animate-pulse" title="Mudar de Conta" />
              </button>
            </div>
          )}

          {/* Account Selection Floating Menu */}
          <AnimatePresence>
            {showSidebarAccountDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute left-4 right-4 top-[95%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden p-2 space-y-1"
              >
                <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Contas e Visão Geral ({allAccountsList.length})</span>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {allAccountsList.map((acc) => {
                    const isActive = activeAccountId === acc.id;
                    const isAll = acc.id === "all";
                    return (
                      <div
                        key={acc.id}
                        onClick={() => handleSelectSavedAccount(acc)}
                        className={`w-full p-2.5 rounded-xl flex items-center gap-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group ${
                          isActive ? "bg-indigo-50/80 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-800/60" : ""
                        } ${isAll ? "border-b border-slate-100 dark:border-slate-800 mb-1" : ""}`}
                      >
                        <AccountAvatar 
                          username={acc.username} 
                          name={acc.name} 
                          customAvatar={acc.profilePictureUrl} 
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0" 
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[11px] text-slate-950 dark:text-slate-100 truncate leading-tight flex items-center gap-1">
                            {acc.name}
                            {isAll && (
                              <span className="text-[9px] bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold px-1.5 py-0.5 rounded-md">
                                Soma
                              </span>
                            )}
                          </p>
                          <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">@{acc.username}</p>
                        </div>
                        {isActive ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : !isAll && savedAccounts.length > 1 ? (
                          <button
                            onClick={(e) => handleDeleteSavedAccount(e, acc.id, acc.username)}
                            title="Remover conta"
                            className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                  <button
                    onClick={() => {
                      setShowSidebarAccountDropdown(false);
                      setShowHeaderAccountDropdown(false);
                      setShowAddAccountModal(true);
                    }}
                    className="w-full p-2 text-center text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Adicionar Nova Conta
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-xl font-medium text-sm transition">
            <Calendar className="w-4 h-4" />
            Agendador
          </a>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition text-left cursor-pointer ${
              showSettings ? "bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            Configurações
          </button>
          <a href="#logs-section" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm transition">
            <FileText className="w-4 h-4" />
            Logs de Execução
          </a>
        </nav>

        {/* Action summary badge at the bottom of sidebar */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 dark:from-indigo-900 dark:to-purple-950 rounded-2xl p-4 text-white shadow-md shadow-indigo-100 dark:shadow-none border border-indigo-400/20">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-extrabold opacity-90 uppercase tracking-widest text-indigo-100 flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-300 animate-pulse shrink-0" />
                {countdownInfo.statusText}
              </p>
            </div>

            <p className="text-lg font-black tracking-tight text-white drop-shadow-xs">
              {countdownInfo.timeText}
            </p>

            {countdownInfo.reel && (
              <p className="text-[10.5px] text-indigo-100/90 truncate font-medium mt-1">
                📌 {countdownInfo.reel.title}
              </p>
            )}

            <div className="mt-3 h-2 w-full bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className="bg-gradient-to-r from-amber-400 via-teal-300 to-emerald-400 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${countdownInfo.progressPercent}%` }}
              />
            </div>
            
            <p className="text-[9.5px] text-indigo-200/80 mt-2 font-medium flex items-center justify-between">
              <span>Intervalo: {formatIntervalText(settings.intervalHours)}</span>
              <span>{reels.filter(r => r.status === "scheduled").length} na fila</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col relative z-40">
        {/* Top Header */}
        <header id="header" className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="lg:hidden bg-indigo-600 text-white p-1.5 rounded-lg inline-flex"><Instagram className="h-4 w-4" /></span>
                  Agendador Automático de Reels
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Publique e engaje seu público com consistência a cada {formatIntervalText(settings.intervalHours)}</p>
              </div>

              {igAccountInfo && (
                <div className="relative z-50">
                  <button 
                    onClick={() => {
                      setShowHeaderAccountDropdown(!showHeaderAccountDropdown);
                      setShowSidebarAccountDropdown(false);
                      setShowCardAccountDropdown(false);
                    }}
                    className="flex items-center gap-2.5 bg-indigo-50/50 dark:bg-indigo-950/50 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/80 active:scale-[0.98] border border-indigo-100/50 dark:border-indigo-900/50 px-3 py-1.5 rounded-2xl self-start md:self-center shadow-xs text-left cursor-pointer transition"
                  >
                    <AccountAvatar 
                      username={igAccountInfo.username} 
                      name={igAccountInfo.name} 
                      customAvatar={igAccountInfo.profilePictureUrl} 
                      className="w-8 h-8 rounded-full object-cover border border-indigo-200 dark:border-indigo-800 shrink-0"
                    />
                    <div className="text-left">
                      <div className="flex items-center gap-1">
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-none">{igAccountInfo.name}</p>
                        <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
                      </div>
                      <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold leading-none mt-1">@{igAccountInfo.username}</p>
                    </div>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse ml-1" title="Instagram Conectado" />
                  </button>
                  
                  {/* Floating Header Dropdown */}
                  <AnimatePresence>
                    {showHeaderAccountDropdown && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[100] overflow-hidden p-2 space-y-1"
                      >
                        <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>Contas e Visão Geral ({allAccountsList.length})</span>
                        </div>
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                          {allAccountsList.map((acc) => {
                            const isActive = activeAccountId === acc.id;
                            const isAll = acc.id === "all";
                            return (
                              <div
                                key={acc.id}
                                onClick={() => handleSelectSavedAccount(acc)}
                                className={`w-full p-2 rounded-xl flex items-center gap-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group ${
                                  isActive ? "bg-indigo-50/80 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-800/60" : ""
                                } ${isAll ? "border-b border-slate-100 dark:border-slate-800 pb-2 mb-1" : ""}`}
                              >
                                <AccountAvatar 
                                  username={acc.username} 
                                  name={acc.name} 
                                  customAvatar={acc.profilePictureUrl} 
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0" 
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-[10.5px] text-slate-950 dark:text-slate-100 truncate leading-tight flex items-center gap-1">
                                    {acc.name}
                                    {isAll && (
                                      <span className="text-[9px] bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold px-1.5 py-0.5 rounded-md">
                                        Soma
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">@{acc.username}</p>
                                </div>
                                {isActive ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                ) : !isAll && savedAccounts.length > 1 ? (
                                  <button
                                    onClick={(e) => handleDeleteSavedAccount(e, acc.id, acc.username)}
                                    title="Remover conta"
                                    className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                        <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                          <button
                            onClick={() => {
                              setShowSidebarAccountDropdown(false);
                              setShowHeaderAccountDropdown(false);
                              setShowAddAccountModal(true);
                            }}
                            className="w-full p-2 text-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            Adicionar Nova Conta
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Quick status controls */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Connection mode chip */}
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 border ${
                settings.sandboxMode 
                  ? "bg-amber-50 border-amber-200 text-amber-700" 
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}>
                <Sliders className="h-3.5 w-3.5 text-amber-600" />
                {settings.sandboxMode ? "Sandbox (Testes)" : "API Real"}
              </span>

              {/* Fila ativada status */}
              <button
                onClick={() => handleSaveSettings({ autoScheduleEnabled: !settings.autoScheduleEnabled })}
                className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 border transition hover:opacity-90 ${
                  settings.autoScheduleEnabled 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                    : "bg-rose-50 border-rose-200 text-rose-700"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${settings.autoScheduleEnabled ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                {settings.autoScheduleEnabled ? "Fila Ativa" : "Fila Pausada"}
              </button>

              {/* Quick manual dispatch */}
              <button
                onClick={handleTriggerNow}
                title="Disparar verificação de agendamento agora mesmo"
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-xs text-white font-semibold py-1.5 px-4 rounded-xl transition duration-200 flex items-center gap-1.5 shadow-sm shadow-indigo-100"
              >
                <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
                Publicar Próximo ⚡
              </button>

              {/* Dark Mode Toggler */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-xs"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="hidden sm:inline">Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span className="hidden sm:inline">Escuro</span>
                  </>
                )}
              </button>

              {/* Settings toggler */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  showSettings 
                    ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400" 
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300"
                }`}
              >
                <SettingsIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Settings Panel Accordion */}
        <AnimatePresence>
          {showSettings && (
            <motion.section
              id="settings-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
            >
              <div className="max-w-7xl mx-auto px-6 py-6 grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Parâmetros de Integração
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Instagram Business Account ID
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 17841401234567890"
                        value={settings.instagramAccountId}
                        onChange={(e) => handleSaveSettings({ instagramAccountId: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Obtido através do Painel de Aplicativos do Meta for Developers.
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Meta Page Access Token (Token de Acesso)
                      </label>
                      <input
                        type="password"
                        placeholder="EAAW..."
                        value={settings.facebookAccessToken}
                        onChange={(e) => handleSaveSettings({ facebookAccessToken: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Precisa das permissões: <code className="text-indigo-600 dark:text-indigo-400 font-mono">instagram_basic</code>, <code className="text-indigo-600 dark:text-indigo-400 font-mono">instagram_content_publish</code> e <code className="text-indigo-600 dark:text-indigo-400 font-mono">pages_read_engagement</code>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Mecanismo de Publicação
                  </h2>
                  <div className="space-y-3">
                    {/* Sandbox mode toggle */}
                    <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <input
                        type="checkbox"
                        id="sandbox"
                        checked={settings.sandboxMode}
                        onChange={(e) => handleSaveSettings({ sandboxMode: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                      />
                      <div>
                        <label htmlFor="sandbox" className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 cursor-pointer">
                          Ativar Modo Sandbox (Simulação)
                        </label>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Permite agendar e simular publicações instantâneas de forma perfeita sem precisar configurar as credenciais oficiais. Recomendado para testar.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Intervalo Automático
                        </label>
                        <select
                          value={settings.intervalHours}
                          onChange={(e) => handleSaveSettings({ intervalHours: Number(e.target.value) })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value={0.083}>A cada 5 minutos (Rápido)</option>
                          <option value={0.25}>A cada 15 minutos</option>
                          <option value={0.333}>A cada 20 minutos (Recomendado)</option>
                          <option value={0.5}>A cada 30 minutos</option>
                          <option value={1}>De 1 em 1 hora (Padrão)</option>
                          <option value={2}>De 2 em 2 horas</option>
                          <option value={6}>De 6 em 6 horas</option>
                          <option value={12}>De 12 em 12 horas</option>
                          <option value={24}>A cada 24 horas</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Status do Agendador
                        </label>
                        <div className="flex items-center h-9">
                          <button
                            onClick={() => handleSaveSettings({ autoScheduleEnabled: !settings.autoScheduleEnabled })}
                            className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition ${
                              settings.autoScheduleEnabled
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                            }`}
                          >
                            {settings.autoScheduleEnabled ? "Desativar Publicador" : "Ativar Publicador"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Security Protection Card */}
                <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <PasswordSecurityCard />
                </div>

                {/* Integration Help Guide (Full width or span inside the same container) */}
                  <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-4 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-950">
                    <Info className="h-5 w-5 text-indigo-600 shrink-0" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      Checklist e Diagnóstico: Como Ativar o Agendador Automático Real
                    </h3>
                  </div>

                  {/* Checklist Section */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      📋 Requisitos Obrigatórios da Meta (Facebook/Instagram)
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>Sim, você está totalmente certo!</strong> Para o agendador automático real funcionar, o Instagram <strong>exige obrigatoriamente</strong> que sua conta esteja vinculada a uma Página do Facebook. Sem esse vínculo, o Facebook bloqueia o acesso da API. Verifique os 5 requisitos abaixo:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                      <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 text-indigo-600 rounded cursor-default" readOnly />
                        <div>
                          <p className="font-bold text-slate-900 text-[11px]">1. Conta do Instagram Profissional</p>
                          <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                            Sua conta do Instagram deve ser de tipo <strong>Comercial/Business</strong> ou <strong>Criador de Conteúdo</strong>. Contas pessoais comuns não possuem acesso à API.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 text-indigo-600 rounded cursor-default" readOnly />
                        <div>
                          <p className="font-bold text-slate-900 text-[11px]">2. Vinculado a uma Página do Facebook</p>
                          <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                            A conta profissional do Instagram <strong>deve estar conectada diretamente</strong> a uma Página do Facebook da qual você seja o Administrador.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 text-indigo-600 rounded cursor-default" readOnly />
                        <div>
                          <p className="font-bold text-slate-900 text-[11px]">3. Tipo de Aplicativo na Meta: Empresa</p>
                          <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                            Ao criar o app no <span className="font-semibold text-indigo-600">developers.facebook.com</span>, o tipo do aplicativo deve ser configurado como <strong>Empresa (Business)</strong>. O tipo "Consumidor" não libera a API do Instagram.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 text-indigo-600 rounded cursor-default" readOnly />
                        <div>
                          <p className="font-bold text-slate-900 text-[11px]">4. Desativar Bloqueador de Popups</p>
                          <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                            Se o pop-up de login/autorização não abrir, seu navegador está bloqueando! Procure o ícone de bloqueio na barra de endereço (perto da URL) e clique em <strong>"Sempre permitir pop-ups"</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Solução de permissões no Explorer */}
                  <div className="grid md:grid-cols-4 gap-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 p-5">
                    {/* Passo 1 */}
                    <div className="space-y-2 bg-white p-3.5 rounded-xl border border-indigo-100/40 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-650 text-white font-bold text-xs shrink-0">
                          1
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">Mudar "Meta App" (CRÍTICO)</h4>
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed">
                        No topo do Explorer, mude o dropdown <strong className="text-indigo-950">Meta App</strong> de <em>"Graph API Explorer"</em> para o <strong>seu aplicativo criado</strong>. Se deixar o padrão, o Facebook força a permissão obsoleta <code className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded font-mono text-[9px]">pages_show_list</code> e bloqueia o login!
                      </p>
                    </div>

                    {/* Passo 2 */}
                    <div className="space-y-2 bg-white p-3.5 rounded-xl border border-indigo-100/40 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-650 text-white font-bold text-xs shrink-0">
                          2
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">Limpar Tudo (Clear All)</h4>
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed">
                        Na coluna lateral direita, logo abaixo de <strong>Permissions</strong>, clique no botão <strong className="text-indigo-950">"Clear All"</strong> (ou clique no "X" ao lado de cada permissão) para limpar qualquer escopo antigo ou padrão salvo.
                      </p>
                    </div>

                    {/* Passo 3 */}
                    <div className="space-y-2 bg-white p-3.5 rounded-xl border border-indigo-100/40 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-650 text-white font-bold text-xs shrink-0">
                          3
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">Adicionar Escopos Atuais</h4>
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed">
                        No campo de busca <em>Add a permission</em>, pesquise e selecione <strong>apenas</strong> estas três:
                      </p>
                      <div className="flex flex-wrap gap-1 my-1">
                        <code className="text-[9px] bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 text-indigo-750 font-mono">instagram_basic</code>
                        <code className="text-[9px] bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 text-indigo-750 font-mono">instagram_content_publish</code>
                        <code className="text-[9px] bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 text-indigo-750 font-mono">pages_read_engagement</code>
                      </div>
                      <p className="text-[9.5px] text-slate-500">
                        Garanta que <strong>User or Page</strong> está como <strong className="text-indigo-950">User Token</strong>.
                      </p>
                    </div>

                    {/* Passo 4 */}
                    <div className="space-y-2 bg-white p-3.5 rounded-xl border border-indigo-100/40 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-650 text-white font-bold text-xs shrink-0">
                          4
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">Gerar Token e Consultar</h4>
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed">
                        Clique em <strong className="text-indigo-950">Generate Access Token</strong>. O pop-up abrirá limpo e funcional! Faça login e depois mude o método para <code>GET</code> e consulte:
                      </p>
                      <code className="block text-[9px] bg-slate-900 text-emerald-400 p-1.5 rounded font-mono mt-1 select-all overflow-x-auto whitespace-nowrap">
                        me/accounts?fields=name,access_token,instagram_business_account
                      </code>
                    </div>
                  </div>

                  {/* Alerta de Retorno Vazio ou Páginas Faltando */}
                  <div className="mt-4 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-900 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-xs text-amber-950">
                        <span>⚠️ O resultado deu "data": [ ] vazio?</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Se o JSON retornou sem nenhuma página, significa que o seu Token do Usuário não tem permissões ativas para ler as suas páginas do Facebook. Para resolver:
                      </p>
                      <ul className="text-[10.5px] list-disc list-inside space-y-1 text-amber-800">
                        <li>Clique no botão azul <strong className="text-amber-950">Generate Access Token</strong> novamente.</li>
                        <li>No pop-up do Facebook, clique em <strong className="text-amber-950">"Editar configurações"</strong> (Edit settings) em vez de "Continuar".</li>
                        <li>Marque <strong>todas</strong> as caixas de seleção da sua Página do Facebook e da sua Conta do Instagram Comercial.</li>
                        <li>Clique em Avançar/Concluir e depois em <strong className="text-amber-950">Enviar (Submit)</strong> no Explorer.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-xs text-indigo-950">
                        <span>💡 Algumas páginas não apareceram na lista?</span>
                      </div>
                      <p className="text-[11px] text-indigo-800 leading-relaxed">
                        Se você tem várias páginas e algumas ficaram de fora da resposta JSON, o Facebook está usando uma autorização cacheada que não incluiu as novas páginas. Para resetar e liberar todas:
                      </p>
                      <ul className="text-[10.5px] list-disc list-inside space-y-1 text-indigo-800">
                        <li>Acesse as Configurações de <strong className="text-indigo-950">Integrações comerciais</strong> no seu Facebook pessoal: <a href="https://www.facebook.com/settings?tab=business_tools" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-indigo-950 text-indigo-900 hover:text-indigo-950">facebook.com/settings?tab=business_tools</a></li>
                        <li>Encontre o seu aplicativo (ex: <strong className="text-indigo-950">Meu Agendador de Reels</strong>) na lista e clique em <strong className="text-indigo-950">Remover</strong>.</li>
                        <li>Volte para o Graph API Explorer, clique em <strong className="text-indigo-950">Generate Access Token</strong> novamente.</li>
                        <li>Agora o Facebook mostrará o assistente de login do zero! Clique em <strong className="text-indigo-950">Editar configurações</strong> e selecione <strong>absolutamente todas as páginas e contas</strong> que você quer usar.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-teal-50 border border-teal-100 text-teal-900 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-xs text-teal-950">
                        <span>💼 Seus Instagrams estão em Portfólios Empresariais?</span>
                      </div>
                      <p className="text-[11px] text-teal-800 leading-relaxed">
                        Se suas contas estão dentro de <strong>Portfólios empresariais</strong> (Meta Business Suite/Business Manager), a API do Facebook restringe o acesso por segurança. Siga estes passos para liberar:
                      </p>
                      <ul className="text-[10.5px] list-disc list-inside space-y-1 text-teal-800">
                        <li><strong>Adicione a permissão necessária:</strong> No campo de buscas <em>Add a permission</em> no Explorer, procure e selecione <strong className="text-teal-950">business_management</strong>. Depois, clique em <strong className="text-teal-950">Generate Access Token</strong> e autorize o pop-up.</li>
                        <li><strong>Verifique os Ativos do Negócio:</strong> Acesse as Configurações do seu Portfólio no Meta Business Suite, vá em <strong>Usuários &gt; Pessoas</strong>, selecione seu nome e garanta que você mesmo tem acesso explícito com <strong className="text-teal-950">Controle total (Gerenciar)</strong> às Páginas e Contas do Instagram correspondentes.</li>
                        <li><strong>Associe ao Aplicativo:</strong> No Business Suite, certifique-se de que o seu aplicativo de desenvolvedor está adicionado e associado como parceiro ou ativo autorizado a gerenciar o conteúdo da página do negócio.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Main Content Layout */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8 overflow-y-auto">
          
          {/* Instagram Account Insights Cards (Above Dashboard Queue Cards) */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-800/40 relative z-20">
            {/* Background ambient glow wrapper clipped inside rounded corners */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="absolute -left-12 -top-12 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
            </div>

            {/* Header bar with account avatar & title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/10 relative z-50">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={igAccountInfo?.profilePictureUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60"}
                    alt={igAccountInfo?.name || "Instagram Account"}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400/60 shadow-md shrink-0"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-gradient-to-tr from-pink-500 to-amber-400 rounded-full border-2 border-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      {igAccountInfo?.name || "Conta do Instagram"}
                    </h2>
                    {accountMetrics?.source === "live_api" ? (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        API Graph Instagram
                      </span>
                    ) : (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-300" />
                        Métricas da Página
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-indigo-200/80 font-medium mt-0.5">
                    @{igAccountInfo?.username || "instagram"} • Selecione uma conta para ver seus dados
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCardAccountDropdown(!showCardAccountDropdown);
                      setShowHeaderAccountDropdown(false);
                      setShowSidebarAccountDropdown(false);
                    }}
                    className="bg-indigo-600/70 hover:bg-indigo-600 active:scale-95 text-xs text-white font-bold py-2 px-3.5 rounded-xl border border-indigo-400/40 transition flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Users className="h-3.5 w-3.5 text-indigo-200" />
                    <span>Mudar Conta ({allAccountsList.length})</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-indigo-200 transition-transform ${showCardAccountDropdown ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showCardAccountDropdown && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-[100] space-y-1"
                      >
                        <div className="px-3 py-1.5 text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider">
                          Selecione a Conta ou Visão Geral
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-1">
                          {allAccountsList.map((acc) => {
                            const isActive = activeAccountId === acc.id;
                            const isAll = acc.id === "all";
                            return (
                              <button
                                key={acc.id}
                                type="button"
                                onClick={() => handleSelectSavedAccount(acc)}
                                className={`w-full p-2.5 rounded-xl flex items-center gap-2.5 text-left transition cursor-pointer ${
                                  isActive ? "bg-indigo-600/60 text-white font-bold border border-indigo-500/50" : "hover:bg-slate-800 text-slate-200"
                                }`}
                              >
                                <AccountAvatar username={acc.username} name={acc.name} customAvatar={acc.profilePictureUrl} className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-xs truncate flex items-center gap-1">
                                    {acc.name}
                                    {isAll && <span className="text-[9px] bg-indigo-500/30 text-indigo-300 font-extrabold px-1 rounded">Soma</span>}
                                  </p>
                                  <p className="text-[10px] text-indigo-300 truncate">@{acc.username}</p>
                                </div>
                                {isActive && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Refresh button */}
                <button
                  onClick={() => activeAccountId && fetchAccountMetrics(activeAccountId)}
                  disabled={isLoadingMetrics}
                  className="bg-white/10 hover:bg-white/20 active:scale-95 text-xs text-white font-bold py-2 px-3.5 rounded-xl border border-white/15 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Atualizar métricas da conta"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-indigo-300 ${isLoadingMetrics ? "animate-spin" : ""}`} />
                  {isLoadingMetrics ? "Atualizando..." : "Atualizar Métricas 🔄"}
                </button>
              </div>
            </div>

            {/* 3 Metric Cards requested by user */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
              {/* Card 1: Quantos Seguidores Tem */}
              <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:border-indigo-400/40 transition">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-extrabold text-indigo-200/90 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-pink-400" />
                    Seguidores Totais
                  </p>
                  <span className="text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" /> Conta
                  </span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">
                  {isLoadingMetrics ? (
                    <span className="animate-pulse text-indigo-300">...</span>
                  ) : (
                    formatNumberPt(accountMetrics?.followersCount || 0)
                  )}
                </p>
                <p className="text-[10.5px] text-indigo-200/70 mt-1.5 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                  Seguidores ativos na conta
                </p>
              </div>

              {/* Card 2: Quantos Seguidores Ganhou Hoje */}
              <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:border-emerald-400/40 transition">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-extrabold text-emerald-200/90 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4 text-emerald-400" />
                    Ganhou Hoje
                  </p>
                  <button
                    onClick={handleResetBaseline}
                    title="Resetar linha de base para a quantidade atual de hoje"
                    className="text-[10px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition"
                  >
                    <RefreshCw className="h-2.5 w-2.5" /> Zerar Hoje
                  </button>
                </div>
                <p className="text-3xl font-black text-emerald-400 tracking-tight">
                  {isLoadingMetrics ? (
                    <span className="animate-pulse text-emerald-300">...</span>
                  ) : (
                    `+${formatNumberPt(accountMetrics?.followersGainedToday || 0)}`
                  )}
                </p>
                <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-indigo-200/70 font-medium">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-400 shrink-0" />
                    Crescimento real do dia
                  </span>
                  {accountMetrics?.startOfTodayFollowers !== undefined && (
                    <span className="text-[9.5px] text-emerald-300/80 font-mono" title="Número de seguidores registrados no início do dia">
                      Base: {formatNumberPt(accountMetrics.startOfTodayFollowers)}
                    </span>
                  )}
                </div>
              </div>

              {/* Card 3: Quantos Views teve Essa Semana */}
              <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:border-purple-400/40 transition">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-extrabold text-purple-200/90 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-purple-400" />
                    Views essa Semana
                  </p>
                  <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <BarChart3 className="h-3 w-3" /> 7 dias
                  </span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">
                  {isLoadingMetrics ? (
                    <span className="animate-pulse text-purple-300">...</span>
                  ) : (
                    formatNumberPt(accountMetrics?.viewsThisWeek || 0)
                  )}
                </p>
                <p className="text-[10.5px] text-indigo-200/70 mt-1.5 flex items-center gap-1 font-medium">
                  <Play className="h-3 w-3 text-purple-400 shrink-0" />
                  Visualizações nos Reels esta semana
                </p>
              </div>
            </div>
          </div>

          {/* Main Stats Row from Sleek Interface theme */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
              <p className="text-slate-400 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                Próximo Post em
              </p>
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">{nextPostText}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
              <p className="text-slate-400 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Postados
              </p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {publishedCount} <span className="text-base font-normal text-slate-400">reels</span>
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
              <p className="text-slate-400 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ListOrdered className="h-3.5 w-3.5 text-violet-500" />
                Aguardando Fila
              </p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {scheduledCount} <span className="text-base font-normal text-slate-400">reels</span>
              </p>
            </div>
          </div>

          {/* Grid Layout content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Carregando dados da fila do servidor...</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Form to add and creative AI tools */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* Form layout */}
                <div id="add-reel-card" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Agendar Reels</h2>
                    </div>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex items-center justify-between gap-1.5 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                    <button
                      type="button"
                      onClick={() => setScheduleMode("single")}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        scheduleMode === "single"
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <Video className="h-4 w-4" />
                      Vídeo Único
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleMode("bulk")}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        scheduleMode === "bulk"
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <Layers className="h-4 w-4" />
                      Vários Vídeos (Em Lote)
                      <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase">
                        Em Lote
                      </span>
                    </button>
                  </div>

                  {scheduleMode === "single" ? (
                    <form onSubmit={handleAddReel} className="space-y-5">
                    {/* Target Instagram Account */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Conta de Destino do Instagram 📲
                      </label>
                      <AccountSelectDropdown
                        value={singleTargetAccountId || settings.instagramAccountId}
                        onChange={(id) => setSingleTargetAccountId(id)}
                        savedAccounts={savedAccounts}
                      />
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Título ou Tema do Reel
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Como criar Hooks customizados no React"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-850 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>

                    {/* Video Upload Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Vídeo do Reel 🎬
                        </label>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => setVideoInputType("upload")}
                            className={`px-2.5 py-1 text-[10px] rounded-md font-bold transition ${
                              videoInputType === "upload"
                                ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            }`}
                          >
                            Enviar Arquivo 💾
                          </button>
                          <button
                            type="button"
                            onClick={() => setVideoInputType("url")}
                            className={`px-2.5 py-1 text-[10px] rounded-md font-bold transition ${
                              videoInputType === "url"
                                ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            }`}
                          >
                            Colar Link/URL 🔗
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {videoInputType === "upload" ? (
                          <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 cursor-pointer group transition">
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoUpload}
                              className="sr-only"
                              disabled={isUploadingVideo}
                            />
                            
                            <div className="flex flex-col items-center text-center space-y-2">
                              {isUploadingVideo ? (
                                <>
                                  <RefreshCw className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Enviando vídeo para o servidor...</span>
                                  <span className="text-[10px] text-slate-400">Por favor, aguarde</span>
                                </>
                              ) : uploadedFileName ? (
                                <div className="flex items-center gap-4 text-left w-full p-1">
                                  <div className="w-24 sm:w-28 shrink-0">
                                    <VideoThumbnailWithDuration src={newVideoUrl} poster={newThumbnailUrl} className="w-full rounded-xl overflow-hidden shadow-md border border-slate-700/60 relative" />
                                  </div>
                                  <div className="flex-1 space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                                      <Video className="h-4 w-4 text-emerald-500 shrink-0" />
                                      <span className="line-clamp-1">{uploadedFileName}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">
                                        Thumb 9:16 & Vídeo OK! ✨
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400">Passe o mouse na capa 9:16 para pré-visualizar</p>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setUploadedFileName("");
                                        setNewVideoUrl("");
                                      }}
                                      className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                                    >
                                      Substituir vídeo
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <Upload className="h-8 w-8 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:scale-110 transition duration-300" />
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Clique para enviar vídeo</span>
                                  <span className="text-[10px] text-slate-400">Formatos suportados: MP4, MOV, AVI (máx. 2 GB)</span>
                                </>
                              )}
                            </div>
                          </label>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="url"
                              placeholder="https://exemplo.com/seu-video-direto.mp4"
                              value={newVideoUrl}
                              onChange={(e) => {
                                setNewVideoUrl(e.target.value);
                                setUploadedFileName("");
                              }}
                              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                            <p className="text-[9.5px] text-slate-500 dark:text-slate-400 leading-normal">
                              🔗 <strong>Dica de Ouro:</strong> Links de nuvens públicas (Dropbox, Google Drive compartilhado, Supabase ou Pexels/Mixkit) são aceitos aqui. Se preferir, use a aba <strong>"Enviar Arquivo"</strong> para enviar diretamente do seu PC; o servidor cuidará de todo o resto automaticamente!
                            </p>
                            {newVideoUrl && (
                              <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center gap-3">
                                <div className="w-20 sm:w-24 shrink-0">
                                  <VideoThumbnailWithDuration src={newVideoUrl} poster={newThumbnailUrl} className="w-full rounded-lg overflow-hidden shadow-md border border-slate-700/60 relative" />
                                </div>
                                <div className="space-y-1 text-left flex-1">
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20 inline-block">
                                    Prévia Thumb 9:16 ✨
                                  </span>
                                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1">Vídeo via Link/URL</p>
                                  <p className="text-[10px] text-slate-400">Passe o mouse sobre a capa 9:16 para reproduzir</p>
                                </div>
                              </div>
                            )}

                            {/* Optional Custom Thumbnail URL */}
                            <div className="pt-1">
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                Capa / Thumbnail 9:16 (Opcional - URL da Imagem de Capa)
                              </label>
                              <input
                                type="url"
                                placeholder="https://exemplo.com/sua-capa-9-16.jpg (Opcional)"
                                value={newThumbnailUrl}
                                onChange={(e) => setNewThumbnailUrl(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                              />
                            </div>
                          </div>
                        )}

                        {uploadError && (
                          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/50 rounded-xl text-[10px] text-rose-600 dark:text-rose-400 flex items-start gap-1.5 font-semibold">
                            <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <p>{uploadError}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Caption Context / Assistant */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Legenda do Post
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateCaption}
                          disabled={isGeneratingCaption || !newTitle}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 disabled:text-slate-400 disabled:pointer-events-none flex items-center gap-1 font-bold transition"
                        >
                          <Sparkles className={`h-3.5 w-3.5 ${isGeneratingCaption ? "animate-spin text-indigo-600" : ""}`} />
                          {isGeneratingCaption ? "Gerando..." : "Gerar com IA ✨"}
                        </button>
                      </div>

                      {/* Context input */}
                      <input
                        type="text"
                        placeholder="Deseja focar em algo na legenda? (Opcional)"
                        value={captionContext}
                        onChange={(e) => setCaptionContext(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition mb-2 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />

                      <textarea
                        placeholder="Adicione a legenda que aparecerá no Reels..."
                        value={newCaption}
                        onChange={(e) => setNewCaption(e.target.value)}
                        rows={5}
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-relaxed"
                      />
                    </div>

                    {/* Schedule Time Selector starting from Publicar Agora */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        <span>Horário da Publicação</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold lowercase">
                          {customScheduleMode === "custom_datetime" && customDateTime
                            ? `para ${new Date(customDateTime).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`
                            : scheduledMinutesOffset === 0
                            ? "imediatamente (🚀 Publicar Agora)"
                            : `em ${scheduledMinutesOffset < 60 ? `${scheduledMinutesOffset} minutos` : `${scheduledMinutesOffset / 60} ${scheduledMinutesOffset === 60 ? "hora" : "horas"}`}`}
                        </span>
                      </div>

                      {/* Preset Options Grid */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { label: "🚀 Publicar Agora", mins: 0 },
                          { label: "⚡ 20 Min", mins: 20 },
                          { label: "30 Min", mins: 30 },
                          { label: "1 Hora", mins: 60 },
                          { label: "2 Horas", mins: 120 },
                          { label: "4 Horas", mins: 240 },
                          { label: "6 Horas", mins: 360 },
                          { label: "12 Horas", mins: 720 },
                          { label: "24 Horas", mins: 1440 },
                        ].map((preset) => {
                          const isSelected = customScheduleMode === "preset" && scheduledMinutesOffset === preset.mins;
                          return (
                            <button
                              key={preset.mins}
                              type="button"
                              onClick={() => {
                                setScheduledMinutesOffset(preset.mins);
                                setCustomScheduleMode("preset");
                              }}
                              className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition cursor-pointer text-center ${
                                isSelected
                                  ? preset.mins === 0
                                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-600 shadow-xs"
                                    : "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Datetime Option */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (customScheduleMode === "preset") {
                              setCustomScheduleMode("custom_datetime");
                              if (!customDateTime) {
                                const now = new Date();
                                now.setMinutes(now.getMinutes() + 20);
                                const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                setCustomDateTime(iso);
                              }
                            } else {
                              setCustomScheduleMode("preset");
                            }
                          }}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          {customScheduleMode === "custom_datetime" ? "← Voltar para opções rápidas" : "Escolher Data e Hora exata..."}
                        </button>

                        {customScheduleMode === "custom_datetime" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2"
                          >
                            <input
                              type="datetime-local"
                              required
                              value={customDateTime}
                              onChange={(e) => setCustomDateTime(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Submit Single Reel Button */}
                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={isUploadingVideo}
                        className={`w-full text-white text-xs font-extrabold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 ${
                          customScheduleMode === "preset" && scheduledMinutesOffset === 0
                            ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:opacity-95 shadow-emerald-100 dark:shadow-none"
                            : "bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-95 shadow-indigo-100 dark:shadow-none"
                        }`}
                      >
                        {customScheduleMode === "preset" && scheduledMinutesOffset === 0 ? (
                          <>
                            <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
                            Publicar Reel Agora no Instagram 🚀
                          </>
                        ) : (
                          <>
                            <Calendar className="h-4 w-4" />
                            Agendar Reel na Fila 📅
                          </>
                        )}
                      </button>
                    </div>

                    </form>
                  ) : (
                    /* BULK / BATCH SCHEDULING MODE */
                    <div className="space-y-6">
                      
                      {/* Step 1: Input method tabs for Bulk */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            1. Adicionar Vídeos ao Lote 📦
                          </label>
                          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            <button
                              type="button"
                              onClick={() => setBulkInputType("files")}
                              className={`px-2 py-1 text-[10px] rounded-md font-bold transition cursor-pointer ${
                                bulkInputType === "files"
                                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              📁 Arquivos
                            </button>
                            <button
                              type="button"
                              onClick={() => setBulkInputType("urls")}
                              className={`px-2 py-1 text-[10px] rounded-md font-bold transition cursor-pointer ${
                                bulkInputType === "urls"
                                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              🔗 Várias URLs
                            </button>
                            <button
                              type="button"
                              onClick={() => setBulkInputType("presets")}
                              className={`px-2 py-1 text-[10px] rounded-md font-bold transition cursor-pointer ${
                                bulkInputType === "presets"
                                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              ✨ Modelos
                            </button>
                          </div>
                        </div>

                        {bulkInputType === "files" && (
                          <div className="space-y-2">
                            <div className="relative border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-500 rounded-2xl p-5 transition text-center bg-indigo-50/30 dark:bg-indigo-950/20 group">
                              <input
                                type="file"
                                multiple
                                accept="video/*"
                                onChange={handleBulkFilesUpload}
                                disabled={isUploadingBulk}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="flex flex-col items-center justify-center gap-2">
                                {isUploadingBulk ? (
                                  <>
                                    <RefreshCw className="h-7 w-7 text-indigo-600 dark:text-indigo-400 animate-spin" />
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                      {bulkUploadProgress
                                        ? `Enviando vídeo ${bulkUploadProgress.current} de ${bulkUploadProgress.total}...`
                                        : "Processando vídeos em lote..."}
                                    </p>
                                    {bulkUploadProgress && (
                                      <div className="w-48 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1">
                                        <div
                                          className="bg-indigo-600 h-full transition-all duration-300"
                                          style={{ width: `${(bulkUploadProgress.current / bulkUploadProgress.total) * 100}%` }}
                                        />
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-7 w-7 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition" />
                                    <div>
                                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                                        Clique ou Arraste Vários Arquivos de Vídeo de Uma Vez
                                      </p>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        Selecione 2, 5, 10 ou mais vídeos no seu computador (MP4, MOV - até 2 GB por vídeo)
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {bulkUploadError && (
                              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                                {bulkUploadError}
                              </p>
                            )}
                          </div>
                        )}

                        {bulkInputType === "urls" && (
                          <div className="space-y-2">
                            <textarea
                              rows={3}
                              placeholder="Cole várias URLs de vídeos MP4 (uma URL por linha):&#10;https://site.com/video1.mp4&#10;https://site.com/video2.mp4"
                              value={bulkUrlsText}
                              onChange={(e) => setBulkUrlsText(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={handleAddBulkUrls}
                              className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
                            >
                              Adicionar URLs ao Lote
                            </button>
                          </div>
                        )}

                        {bulkInputType === "presets" && (
                          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col gap-2">
                            <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                              Adicionar os 4 vídeos demonstrativos ao mesmo tempo:
                            </p>
                            <button
                              type="button"
                              onClick={handleAddAllPresetsToBulk}
                              className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Carregar 4 Vídeos Modelos no Lote
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Step 2: Bulk Scheduling Options */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                          <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            2. Opções de Agendamento em Lote
                          </h3>
                        </div>

                        {/* Target Account */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                            Conta de Destino do Instagram:
                          </label>
                          <AccountSelectDropdown
                            value={bulkTargetAccountId || settings.instagramAccountId}
                            onChange={(id) => setBulkTargetAccountId(id)}
                            savedAccounts={savedAccounts}
                          />
                        </div>

                        {/* Start Time for 1st post */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                            Horário do Primeiro Post do Lote:
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 mb-2">
                            {[
                              { id: "now", label: "🚀 Agora (Primeiro Post)" },
                              { id: "preset_20", label: "Em 20 minutos" },
                              { id: "preset_60", label: "Em 1 hora" },
                              { id: "tomorrow_9am", label: "Amanhã às 09:00" },
                              { id: "tomorrow_6pm", label: "Amanhã às 18:00" },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setBulkStartMode(opt.id as any)}
                                className={`py-1.5 px-2 text-[11px] font-bold rounded-xl border transition cursor-pointer ${
                                  bulkStartMode === opt.id
                                    ? "bg-indigo-600 text-white border-indigo-600"
                                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>

                          {bulkStartMode === "custom" ? (
                            <input
                              type="datetime-local"
                              value={bulkCustomStartDateTime}
                              onChange={(e) => setBulkCustomStartDateTime(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setBulkStartMode("custom");
                                const now = new Date();
                                now.setMinutes(now.getMinutes() + 20);
                                const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                setBulkCustomStartDateTime(iso);
                              }}
                              className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                              Escolher data/hora personalizada...
                            </button>
                          )}
                        </div>

                        {/* Interval Between Each Post */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
                            <span>Intervalo entre cada Post:</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                              {bulkIntervalMinutes < 60 ? `${bulkIntervalMinutes} min` : `${bulkIntervalMinutes / 60} hora(s)`}
                            </span>
                          </label>
                          <select
                            value={bulkIntervalMinutes}
                            onChange={(e) => setBulkIntervalMinutes(Number(e.target.value))}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          >
                            <option value={15}>A cada 15 minutos</option>
                            <option value={20}>A cada 20 minutos</option>
                            <option value={30}>A cada 30 minutos (Recomendado)</option>
                            <option value={45}>A cada 45 minutos</option>
                            <option value={60}>A cada 1 hora</option>
                            <option value={120}>A cada 2 horas</option>
                            <option value={180}>A cada 3 horas</option>
                            <option value={360}>A cada 6 horas</option>
                            <option value={720}>A cada 12 horas</option>
                            <option value={1440}>A cada 24 horas (1 por dia)</option>
                          </select>
                        </div>
                      </div>

                      {/* Step 3: Bulk Items Preview List */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <ListPlus className="h-4 w-4 text-indigo-500" />
                            Lista de Reels ({bulkItems.length})
                          </h3>
                          {bulkItems.length > 0 && (
                            <button
                              type="button"
                              onClick={handleBulkGenerateCaptions}
                              disabled={isGeneratingBulkCaptions}
                              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                            >
                              <Sparkles className={`h-3.5 w-3.5 ${isGeneratingBulkCaptions ? "animate-spin" : ""}`} />
                              {isGeneratingBulkCaptions ? "Gerando Legendas..." : "Gerar Legendas IA para Todos ✨"}
                            </button>
                          )}
                        </div>

                        {bulkItems.length === 0 ? (
                          <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                            <FileVideo className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                              Nenhum vídeo adicionado ao lote
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Selecione arquivos ou cole URLs no passo 1 acima
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                            {bulkItems.map((item, idx) => {
                              const calcDate = getBulkItemScheduledDate(idx);
                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 relative flex gap-3 items-stretch"
                                >
                                  {/* Video Thumbnail Preview on Left with Duration */}
                                  <VideoThumbnailWithDuration src={item.videoUrl} />

                                  {/* Card Form Controls on Right */}
                                  <div className="flex-1 min-w-0 space-y-2 flex flex-col justify-between">
                                    {/* Item Header & Calculated Time Badge */}
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                        <Clock className="h-3 w-3" />
                                        Post #{idx + 1}: {formatBulkDateBadge(calcDate)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setBulkItems((prev) => prev.filter((i) => i.id !== item.id));
                                        }}
                                        className="text-slate-400 hover:text-rose-500 p-1 transition cursor-pointer"
                                        title="Remover vídeo do lote"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>

                                    {/* Title Input */}
                                    <div>
                                      <input
                                        type="text"
                                        placeholder={`Título do Vídeo #${idx + 1}`}
                                        value={item.title}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setBulkItems((prev) =>
                                            prev.map((i) => (i.id === item.id ? { ...i, title: val } : i))
                                          );
                                        }}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                                      />
                                    </div>

                                    {/* Caption Textarea */}
                                    <div>
                                      <textarea
                                        rows={2}
                                        placeholder="Legenda do post (opcional)..."
                                        value={item.caption}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setBulkItems((prev) =>
                                            prev.map((i) => (i.id === item.id ? { ...i, caption: val } : i))
                                          );
                                        }}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                                      />
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Submit Bulk Action Button */}
                      {bulkItems.length > 0 && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleSubmitBulkReels}
                            disabled={isSubmittingBulk}
                            className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-95 text-white text-xs font-extrabold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-100 dark:shadow-none cursor-pointer disabled:opacity-50"
                          >
                            {isSubmittingBulk ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Processando e Agendando Lote...
                              </>
                            ) : (
                              <>
                                <Layers className="h-4 w-4" />
                                Agendar {bulkItems.length} Reels em Lote na Fila 🚀
                              </>
                            )}
                          </button>
                        </div>
                      )}

                    </div>
                  )}
                </div>

                {/* AI Ideas suggestion card */}
                <div id="ai-ideas-card" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">Sugestões de Ideias com IA</h2>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Gere ideias criativas de vídeos de hora em hora</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Tema ou Nicho (Ex: Tecnologia, Moda)"
                      value={nicheInput}
                      onChange={(e) => setNicheInput(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <button
                      onClick={handleGenerateIdeas}
                      disabled={isGeneratingIdeas || !nicheInput}
                      className="bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 active:scale-95 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      {isGeneratingIdeas ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        "Sugerir"
                      )}
                    </button>
                  </div>

                  {geminiError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-xl text-[10px] text-rose-600 dark:text-rose-400 flex items-start gap-2 mb-4">
                      <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <p>{geminiError}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {suggestedIdeas.map((idea, index) => (
                      <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{idea.title}</h4>
                          <button
                            onClick={() => handleScheduleIdea(idea)}
                            className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                          >
                            <Plus className="h-2.5 w-2.5" /> Usar Ideia
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong className="text-indigo-600 dark:text-indigo-400">Descrição Visual:</strong> {idea.videoDescription}
                        </p>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>Recomendado publicar em: daqui a {idea.suggestedTimeOffsetHours} hora(s)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Scheduled Reels queue */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Reels queue list */}
                <section id="queue-card" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col shadow-sm">
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <div>
                      <h2 className="font-bold text-slate-950 dark:text-white flex items-center gap-2">
                        <ListOrdered className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        Fila de Publicação {activeAccountId === "all" ? "Consolidada" : ""} ({filteredReels.length})
                      </h2>
                      <p className="text-[10px] text-slate-400">
                        {settings.autoScheduleEnabled && countdownInfo.reel
                          ? `Próximo Reel sai em ${countdownInfo.timeText} (${countdownInfo.reel.title})`
                          : `O sistema publica automaticamente a cada ${formatIntervalText(settings.intervalHours)}`}
                      </p>
                    </div>

                    {isRefreshing && (
                      <span className="text-xs text-slate-400 flex items-center gap-1 animate-pulse">
                        <RefreshCw className="h-3 w-3 animate-spin text-slate-400" /> Sincronizando...
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-4 max-h-[700px] overflow-y-auto">
                    {filteredReels.length === 0 ? (
                      <div className="text-center py-16 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl space-y-3">
                        <Video className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
                        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed">
                          Nenhum Reel agendado na fila. Crie uma publicação ou peça sugestões à inteligência artificial!
                        </p>
                      </div>
                    ) : (
                      filteredReels.map((reel) => (
                        <div
                          key={reel.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            reel.status === "published"
                              ? "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-70"
                              : reel.status === "failed"
                              ? "bg-rose-50/50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50/40 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Video clip card with Duration */}
                            <VideoThumbnailWithDuration
                              src={reel.videoUrl}
                              poster={reel.thumbnailUrl}
                              className="w-20 h-28 sm:w-24 sm:h-32 bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative shrink-0 group flex items-center justify-center shadow-sm"
                            />

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between space-y-2">
                              <div className="space-y-1.5">
                                {/* Page / Account Header & Status Badge */}
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 bg-indigo-50/70 border border-indigo-100/80 px-2.5 py-1 rounded-xl">
                                    <AccountAvatar 
                                      username={
                                        reel.accountUsername || 
                                        savedAccounts.find(a => a.id === reel.accountId)?.username || 
                                        igAccountInfo?.username
                                      } 
                                      name={
                                        reel.accountName || 
                                        savedAccounts.find(a => a.id === reel.accountId)?.name || 
                                        igAccountInfo?.name
                                      } 
                                      customAvatar={
                                        reel.accountAvatar || 
                                        savedAccounts.find(a => a.id === reel.accountId)?.profilePictureUrl || 
                                        igAccountInfo?.profilePictureUrl
                                      } 
                                      className="w-4 h-4 rounded-full object-cover border border-indigo-200 shrink-0" 
                                    />
                                    <span className="text-[10.5px] font-bold text-slate-800 leading-none">
                                      {
                                        reel.accountName || 
                                        savedAccounts.find(a => a.id === reel.accountId)?.name || 
                                        igAccountInfo?.name || 
                                        "Favela na Real"
                                      }
                                    </span>
                                    <span className="text-[9.5px] font-semibold text-indigo-600 leading-none">
                                      @{ 
                                        (
                                          reel.accountUsername || 
                                          savedAccounts.find(a => a.id === reel.accountId)?.username || 
                                          igAccountInfo?.username || 
                                          "favelanareal"
                                        ).replace(/^@/, '') 
                                      }
                                    </span>
                                  </div>

                                  {/* Badges in sleek theme format */}
                                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                                    reel.status === "published"
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                      : reel.status === "failed"
                                      ? "bg-rose-50 border-rose-200 text-rose-700"
                                      : "bg-amber-50 border-amber-200 text-amber-700"
                                  }`}>
                                    {reel.status === "published" && "Publicado"}
                                    {reel.status === "failed" && "Falhou"}
                                    {reel.status === "scheduled" && "Pendente"}
                                  </span>
                                </div>

                                <h3 className="text-sm font-bold text-slate-900 leading-tight pt-0.5">{reel.title}</h3>

                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  <span>
                                    {reel.status === "published" ? (
                                      <>Postado em: {formatTime(reel.publishedAt || reel.scheduledTime)}</>
                                    ) : (
                                      <>Agendado para: {formatTime(reel.scheduledTime)}</>
                                    )}
                                  </span>
                                </div>

                                {/* Caption box inside the card */}
                                {reel.caption && (
                                  <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 relative">
                                    <p className={`${expandedCaptionId === reel.id ? "" : "line-clamp-2"} whitespace-pre-wrap leading-relaxed`}>
                                      {reel.caption}
                                    </p>
                                    <button
                                      onClick={() => setExpandedCaptionId(expandedCaptionId === reel.id ? null : reel.id)}
                                      className="text-[9px] text-indigo-600 hover:text-indigo-700 font-bold mt-1 block"
                                    >
                                      {expandedCaptionId === reel.id ? "Ocultar legenda" : "Legenda completa"}
                                    </button>
                                  </div>
                                )}

                                {/* Error message if failed */}
                                {reel.status === "failed" && reel.error && (
                                  <div className="space-y-2 mt-2">
                                    <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-600 flex items-start gap-1.5 leading-relaxed">
                                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-500" />
                                      <p><strong>Erro do Servidor:</strong> {reel.error}</p>
                                    </div>
                                    
                                    {(reel.error.includes("2207082") || reel.error.toLowerCase().includes("failed")) && (
                                      <div className="p-3 bg-amber-50/75 border border-amber-200/60 rounded-xl text-[10px] text-amber-900 space-y-1.5 leading-relaxed">
                                        <div className="flex items-center gap-1 font-bold text-amber-950">
                                          <span>💡 Por que isso aconteceu? (Erro de Download)</span>
                                        </div>
                                        <p className="text-amber-800">
                                          O robô do Instagram (Meta) não conseguiu baixar o vídeo diretamente do ambiente privado do AI Studio devido a restrições de rede.
                                        </p>
                                        <div className="font-bold text-amber-950 pt-0.5">Como resolvemos isso de forma automática:</div>
                                        <p className="text-amber-800">
                                          Desenvolvemos um <strong>Proxy de Nuvem Automático</strong>! Agora, quando você clica em publicar, o app faz o upload temporário do vídeo para um servidor aberto (como <em>tmpfiles.org</em> ou <em>catbox.moe</em>) em segundo plano de forma 100% transparente. O Instagram então baixa o vídeo de lá sem restrições de segurança!
                                        </p>
                                        <div className="font-bold text-amber-950 pt-0.5">Dicas de Uso:</div>
                                        <ul className="list-disc list-inside space-y-1 text-amber-800 pl-1">
                                          <li>
                                            Clique em <strong>"Publicar Agora"</strong> novamente para fazer uma nova tentativa com o proxy.
                                          </li>
                                          <li>
                                            Se preferir, use a aba <strong>"Colar Link/URL"</strong> para inserir um link de sua escolha.
                                          </li>
                                          <li>
                                            Se precisar de pressa, clique em <strong>"Manual 📱"</strong> para baixar o vídeo e copiar a legenda e postar pelo celular.
                                          </li>
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between gap-2">
                                  {reel.status !== "published" ? (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => handlePublishImmediately(reel.id)}
                                        disabled={isPublishingReelId !== null}
                                        className={`text-[10px] text-white font-bold flex items-center gap-1 py-1 px-2.5 rounded-lg transition ${
                                          isPublishingReelId === reel.id
                                            ? "bg-indigo-400 cursor-not-allowed"
                                            : "bg-indigo-650 hover:bg-indigo-700 active:scale-95 shadow-sm"
                                        }`}
                                      >
                                        <Play className="h-3 w-3" />
                                        {isPublishingReelId === reel.id ? "Enviando..." : "Postar Agora 🚀"}
                                      </button>

                                      <button
                                        onClick={() => setActiveManualPostId(activeManualPostId === reel.id ? null : reel.id)}
                                        style={{ color: "#000000" }}
                                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-black font-semibold flex items-center gap-1 py-1 px-2 rounded-lg transition"
                                      >
                                        <Instagram className="h-3 w-3 text-slate-500" />
                                        {activeManualPostId === reel.id ? "Fechar" : "Manual 📱"}
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Postado com Sucesso!
                                      </span>

                                      <a
                                        href={
                                          reel.permalink ||
                                          `https://www.instagram.com/${(
                                            reel.accountUsername ||
                                            savedAccounts.find((a) => a.id === reel.accountId)?.username ||
                                            igAccountInfo?.username ||
                                            "favelanareal"
                                          ).replace(/^@/, "")}/reels/`
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white font-extrabold flex items-center gap-1.5 py-1.5 px-3 rounded-lg shadow-xs transition active:scale-95"
                                      >
                                        <Instagram className="h-3.5 w-3.5 text-white" />
                                        <span>Ver publicação no Instagram</span>
                                        <ExternalLink className="h-3 w-3 text-white/90" />
                                      </a>
                                    </div>
                                  )}

                                  <button
                                    onClick={() => handleDeleteReel(reel.id)}
                                    className="text-[10px] hover:text-rose-600 text-slate-400 font-bold flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-rose-50 transition ml-auto"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Remover
                                  </button>
                                </div>

                                {activeManualPostId === reel.id && (
                                  <div className="mt-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs text-slate-800 space-y-3">
                                    <div className="flex items-center gap-1.5 text-indigo-950 font-bold">
                                      <Instagram className="h-4 w-4 text-indigo-600" />
                                      <h4>Assistente de Postagem Manual (Sem API)</h4>
                                    </div>
                                    <p className="text-[10px] text-slate-600 leading-relaxed">
                                      Se você não conseguir conectar a conta oficial ou prefere postar diretamente, siga estes passos simples em qualquer conta do Instagram (mesmo pessoal):
                                    </p>
                                    
                                    <div className="space-y-2 pt-1">
                                      {/* Passo 1 */}
                                      <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-indigo-100/30 shadow-sm">
                                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[9px] shrink-0 mt-0.5">
                                          1
                                        </span>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-bold text-[10px] text-slate-900">Baixar o vídeo do Reel</p>
                                          <p className="text-[9px] text-slate-500 mb-1.5">Salve o arquivo do vídeo no seu dispositivo.</p>
                                          <a 
                                            href={reel.videoUrl} 
                                            download={`reel-${reel.id}.mp4`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold px-2 py-1 rounded-lg transition"
                                          >
                                            <Download className="h-2.5 w-2.5" />
                                            Baixar Vídeo (MP4)
                                          </a>
                                        </div>
                                      </div>

                                      {/* Passo 2 */}
                                      <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-indigo-100/30 shadow-sm">
                                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[9px] shrink-0 mt-0.5">
                                          2
                                        </span>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-bold text-[10px] text-slate-900">Copiar a legenda</p>
                                          <p className="text-[9px] text-slate-500 mb-1.5">Copie o texto gerado com as hashtags sugeridas.</p>
                                          <button 
                                            type="button"
                                            onClick={() => {
                                              navigator.clipboard.writeText(reel.caption || "");
                                              setCopiedReelId(reel.id);
                                              setTimeout(() => setCopiedReelId(null), 3000);
                                            }}
                                            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-850 text-[9px] font-bold px-2 py-1 rounded-lg border border-slate-200 transition"
                                          >
                                            {copiedReelId === reel.id ? (
                                              <>
                                                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-650" />
                                                Copiado!
                                              </>
                                            ) : (
                                              <>
                                                <Copy className="h-2.5 w-2.5" />
                                                Copiar Legenda
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </div>

                                      {/* Passo 3 */}
                                      <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-indigo-100/30 shadow-sm">
                                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[9px] shrink-0 mt-0.5">
                                          3
                                        </span>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-bold text-[10px] text-slate-900">Postar no Instagram</p>
                                          <p className="text-[9px] text-slate-500 mb-1.5">Abra o Instagram, envie o vídeo baixado e cole a legenda.</p>
                                          <div className="flex flex-wrap gap-1.5">
                                            <a 
                                              href="https://www.instagram.com/reels/create/" 
                                              target="_blank" 
                                              rel="noreferrer"
                                              className="inline-flex items-center gap-1 bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 hover:opacity-90 text-white text-[9px] font-bold px-2 py-1 rounded-lg transition"
                                            >
                                              <ExternalLink className="h-2.5 w-2.5" />
                                              Abrir Instagram Reels
                                            </a>
                                            <a 
                                              href="https://business.facebook.com/creatorstudio/" 
                                              target="_blank" 
                                              rel="noreferrer"
                                              className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold px-2 py-1 rounded-lg transition"
                                            >
                                              <ExternalLink className="h-2.5 w-2.5" />
                                              Meta Creator Studio
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Marcar como postado */}
                                    <div className="flex justify-end pt-1.5 border-t border-indigo-100/50">
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          try {
                                            const res = await fetch(`/api/reels/${reel.id}`, {
                                              method: "PUT",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({ status: "published" }),
                                            });
                                            if (res.ok) {
                                              fetchState();
                                              setActiveManualPostId(null);
                                            }
                                          } catch (err) {
                                            console.error("Error updating status to published:", err);
                                          }
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 transition"
                                      >
                                        <CheckCircle2 className="h-3 w-3" />
                                        Confirmar que foi Postado! 🎉
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Server logs & output terminals */}
                <section id="logs-section" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Console do Agendador</h3>
                        <p className="text-[10px] text-slate-400">Atividades de segundo plano em tempo real</p>
                      </div>
                    </div>
                    <button
                      onClick={handleClearLogs}
                      className="text-[10px] bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 py-1 px-3 rounded-lg font-semibold transition cursor-pointer"
                    >
                      Limpar Logs
                    </button>
                  </div>

                  {/* Terminal emulator */}
                  <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-4 border border-slate-800 max-h-52 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2 text-slate-300">
                    {logs.length === 0 ? (
                      <div className="text-slate-600 italic">Sem atividades registradas no console.</div>
                    ) : (
                      logs.map((log) => {
                        let typeColor = "text-slate-400";
                        let icon = <Info className="h-3.5 w-3.5 text-slate-500 inline-block mr-1 shrink-0" />;
                        
                        if (log.type === "success") {
                          typeColor = "text-emerald-400";
                          icon = <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 inline-block mr-1 shrink-0" />;
                        } else if (log.type === "error") {
                          typeColor = "text-rose-400";
                          icon = <XCircle className="h-3.5 w-3.5 text-rose-400 inline-block mr-1 shrink-0" />;
                        } else if (log.type === "warning") {
                          typeColor = "text-amber-400";
                          icon = <AlertTriangle className="h-3.5 w-3.5 text-amber-400 inline-block mr-1 shrink-0" />;
                        }

                        return (
                          <div key={log.id} className="flex items-start gap-1">
                            <span className="text-slate-600 select-none shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className={`flex-1 ${typeColor}`}>
                              {icon}
                              {log.message}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

              </div>

            </div>
          )}
        </main>
      </div>

      {/* Modal: Adicionar Nova Conta do Instagram */}
      <AnimatePresence>
        {showAddAccountModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xs">
                    <Instagram className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Adicionar Conta do Instagram</h3>
                    <p className="text-xs text-indigo-100/80">Salve e alterne entre múltiplos perfis</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddAccountModal(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAccount} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Perfil *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Favela na Real, Minha Marca"
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Usuário do Instagram (@) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 font-semibold text-sm">@</span>
                    <input
                      type="text"
                      required
                      placeholder="minhaloja"
                      value={newAccUsername}
                      onChange={(e) => setNewAccUsername(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Instagram Business Account ID</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Opcional para Sandbox)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 17841401234567890"
                    value={newAccId}
                    onChange={(e) => setNewAccId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Meta Access Token</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Token de Acesso)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="EAAW..."
                    value={newAccToken}
                    onChange={(e) => setNewAccToken(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    URL da Foto de Perfil (Opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newAccAvatar}
                    onChange={(e) => setNewAccAvatar(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Modo Sandbox (Simulação)</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Testar publicação sem precisar de token Meta</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={newAccSandbox}
                    onChange={(e) => setNewAccSandbox(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddAccountModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 dark:shadow-none transition cursor-pointer"
                  >
                    Salvar e Ativar Conta
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
