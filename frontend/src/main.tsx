import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import {
  ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Box,
  Container, Paper, TextField, Button as MuiButton, Card, CardContent, Chip,
  Stack, Alert, MenuItem, Grid2 as Grid, Divider, Avatar, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, LinearProgress, IconButton, Tooltip,
  Snackbar, Tabs, Tab
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  GraduationCap, Trophy, Award, Clock, CheckCircle2, AlertCircle, FileText,
  UploadCloud, Send, LogOut, ArrowLeft, Plus, Sparkles, BookOpen, Users,
  School, Calendar, Eye, EyeOff, Trash2, Megaphone, Check, Lock, ChevronRight,
  X, User as UserIcon, KeyRound, MessageSquare, ExternalLink, Download, Paperclip
} from "lucide-react";
import "./style.css";

const api = axios.create({ baseURL: "/api/v1" });
api.interceptors.request.use(c => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = "Bearer " + t;
  return c;
});
api.interceptors.response.use(
  r => r,
  e => {
    if (e.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(e);
  }
);

const theme = createTheme({
  palette: {
    primary: { main: "#4f46e5", light: "#818cf8", dark: "#3730a3" },
    secondary: { main: "#06b6d4", light: "#67e8f9", dark: "#0e7490" },
    success: { main: "#10b981", light: "#6ee7b7", dark: "#047857" },
    warning: { main: "#f59e0b", light: "#fcd34d", dark: "#b45309" },
    error: { main: "#ef4444", light: "#fca5a5", dark: "#b91c1c" },
    background: { default: "#f8fafc", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#64748b" }
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    h4: { fontWeight: 800, letterSpacing: "-0.03em" },
    h5: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 700, letterSpacing: "-0.01em" },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 700 }
  },
  components: {
    MuiButton: {
      defaultProps: { variant: "contained", disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 20px",
          transition: "all 0.2s ease-in-out"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid #e2e8f0"
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#ffffff",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#94a3b8"
          }
        }
      }
    }
  }
});

type User = { role: string; full_name: string; student_id?: string; username?: string; class_name?: string; must_change_password?: boolean };

const ALLOWED_EXTENSIONS = [
  ".pdf", ".docx", ".doc", ".txt", ".xlsx", ".xls", ".csv",
  ".pptx", ".ppt", ".zip", ".tar.gz", ".rar", ".json", ".xml",
  ".py", ".jpg", ".jpeg", ".png", ".gif", ".webp"
];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

function checkFilesValidity(fileList: File[]): { ok: boolean; error?: string } {
  for (const f of fileList) {
    const lower = f.name.toLowerCase();
    const isTarGz = lower.endsWith(".tar.gz");
    const ext = isTarGz ? ".tar.gz" : ("." + lower.split(".").pop());
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        ok: false,
        error: `Ruxsat etilmagan fayl formati ('${f.name}'). Faqat ruxsat etilgan kengaytmalar: .pdf, .docx, .doc, .txt, .xlsx, .xls, .csv, .pptx, .ppt, .zip, .tar.gz, .rar, .json, .xml, .py, .jpg, .jpeg, .png, .gif, .webp`
      };
    }
    if (f.size > MAX_FILE_SIZE_BYTES) {
      const mb = (f.size / (1024 * 1024)).toFixed(1);
      return {
        ok: false,
        error: `Fayl hajmi 15MB dan oshmasligi kerak! "${f.name}" faylining hajmi: ${mb} MB.`
      };
    }
  }
  return { ok: true };
}

function fireConfetti() {
  confetti({
    particleCount: 90,
    spread: 75,
    origin: { y: 0.6 }
  });
}

function FeedbackButton({
  loading,
  success,
  successText = "Bajarildi!",
  defaultText,
  icon: Icon = Plus,
  variant = "contained",
  color = "primary",
  fullWidth = false,
  onClick,
  type = "button",
  disabled = false,
  size = "medium",
  sx = {}
}: any) {
  return (
    <motion.div whileTap={{ scale: 0.97 }} style={{ width: fullWidth ? "100%" : "auto" }}>
      <MuiButton
        type={type}
        size={size}
        variant={success ? "contained" : variant}
        color={success ? "success" : color}
        fullWidth={fullWidth}
        onClick={onClick}
        disabled={loading || disabled}
        sx={{
          minHeight: 44,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          bgcolor: success ? "#10b981 !important" : undefined,
          color: success ? "#ffffff !important" : undefined,
          boxShadow: success ? "0 8px 16px -2px rgba(16, 185, 129, 0.35) !important" : undefined,
          ...sx
        }}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <CircularProgress size={18} color="inherit" />
              <span>Bajarilmoqda...</span>
            </motion.span>
          ) : success ? (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.5, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <Check size={20} strokeWidth={3} />
              <span>{successText}</span>
            </motion.span>
          ) : (
            <motion.span
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              {Icon && <Icon size={18} />}
              <span>{defaultText}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </MuiButton>
    </motion.div>
  );
}

// User Profile Modal (Password change & Contact Admin)
function ProfileModal({
  open,
  onClose,
  user,
  onLogout
}: {
  open: boolean;
  onClose: () => void;
  user?: User;
  onLogout?: () => void;
}) {
  const [tabIndex, setTabIndex] = useState(0);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; severity: "success" | "error" } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (newPassword.length < 8) {
      setMsg({ text: "Yangi parol kamida 8 ta belgidan iborat bo‘lishi kerak", severity: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ text: "Yangi parollar bir xil emas", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        old_password: oldPassword.trim() || undefined,
        new_password: newPassword
      });
      setMsg({ text: "Parol muvaffaqiyatli yangilandi! 🎉", severity: "success" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      fireConfetti();
    } catch (e: any) {
      setMsg({ text: e.response?.data?.detail || "Parolni o‘zgartirishda xatolik yuz berdi", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" sx={{ "& .MuiDialog-paper": { m: { xs: 1.5, sm: 2 } } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
            <UserIcon size={20} color="#fff" />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800}>Mening Profilim</Typography>
            <Typography variant="caption" color="text.secondary">Foydalanuvchi sozlamalari</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        <Tabs
          value={tabIndex}
          onChange={(_, val) => { setTabIndex(val); setMsg(null); }}
          variant="fullWidth"
          sx={{ mb: 2.5, "& .MuiTab-root": { fontWeight: 700, fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
        >
          <Tab icon={<UserIcon size={16} />} iconPosition="start" label="Ma’lumotlar" />
          <Tab icon={<KeyRound size={16} />} iconPosition="start" label="Parolni o‘zgartirish" />
          <Tab icon={<MessageSquare size={16} />} iconPosition="start" label="Bog‘lanish" />
        </Tabs>

        {/* Tab 0: User Info */}
        {tabIndex === 0 && (
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#f8fafc" }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">F.I.Sh:</Typography>
                  <Typography variant="body1" fontWeight={700}>{user?.full_name}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">Rol:</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      size="small"
                      label={user?.role === "admin" ? "Tizim Administratori" : "O‘quvchi"}
                      color={user?.role === "admin" ? "warning" : "primary"}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                </Box>
                {user?.role === "student" && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">O‘quvchi kodi (ID):</Typography>
                      <Typography variant="body1" fontWeight={800} color="primary.main">{user?.student_id}</Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Sinfi:</Typography>
                      <Typography variant="body1" fontWeight={700}>{user?.class_name || "—"}</Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </Paper>

            <MuiButton
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<LogOut size={18} />}
              onClick={() => { onClose(); onLogout?.(); }}
              sx={{ height: 44, borderRadius: "12px" }}
            >
              Tizimdan chiqish
            </MuiButton>
          </Stack>
        )}

        {/* Tab 1: Password Change */}
        {tabIndex === 1 && (
          <Box component="form" onSubmit={handlePasswordChange} sx={{ display: "grid", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Profilingiz xavfsizligi uchun kuchli paroldan foydalaning (kamida 8 ta belgi).
            </Typography>

            <TextField
              fullWidth
              size="small"
              label="Amaldagi parol (agar bor bo‘lsa)"
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={() => setShowOld(!showOld)} edge="end">
                    {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                )
              }}
            />

            <TextField
              required
              fullWidth
              size="small"
              label="Yangi parol"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              helperText="Kamida 8 ta belgi"
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={() => setShowNew(!showNew)} edge="end">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                )
              }}
            />

            <TextField
              required
              fullWidth
              size="small"
              label="Yangi parolni tasdiqlang"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={() => setShowConfirm(!showConfirm)} edge="end">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                )
              }}
            />

            {msg && (
              <Alert severity={msg.severity} sx={{ borderRadius: "12px" }}>
                {msg.text}
              </Alert>
            )}

            <MuiButton type="submit" disabled={loading} sx={{ height: 44, mt: 1 }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : "Parolni yangilash"}
            </MuiButton>
          </Box>
        )}

        {/* Tab 2: Contact Admin */}
        {tabIndex === 2 && (
          <Stack spacing={2.5}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#f8fafc" }}>
              <Typography variant="subtitle1" fontWeight={800} color="primary.main" sx={{ mb: 1 }}>
                Texnik yordam va Ma’muriyat
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Agar tizimdan foydalanishda savollaringiz, parolingizni unutganingiz yoki texnik xatoliklar yuzaga kelsa, bevosita administrator bilan bog‘lanishingiz mumkin.
              </Typography>

              <Stack spacing={1.5}>
                <Paper sx={{ p: 1.5, bgcolor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <Typography variant="caption" color="text.secondary">Telegram aloqa:</Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ mt: 0.2 }}>
                    <a href="https://t.me/cybertron_admin" target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span>@cybertron_admin</span>
                      <ExternalLink size={15} />
                    </a>
                  </Typography>
                </Paper>

                <Paper sx={{ p: 1.5, bgcolor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <Typography variant="caption" color="text.secondary">Maktab ma’muriyati:</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.2 }}>
                    NIS Baholash & Topshiriqlar bo‘limi
                  </Typography>
                </Paper>
              </Stack>
            </Paper>

            <MuiButton
              component="a"
              href="https://t.me/cybertron_admin"
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              color="primary"
              startIcon={<Send size={18} />}
              fullWidth
              sx={{ height: 44 }}
            >
              Telegram orqali xabar yozish
            </MuiButton>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <MuiButton color="inherit" onClick={onClose}>Yopish</MuiButton>
      </DialogActions>
    </Dialog>
  );
}

function Shell({
  children, title, subtitle, onLogout, tab, setTab, user
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onLogout?: () => void;
  tab?: string;
  setTab?: (t: string) => void;
  user?: User;
}) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          color: "text.primary"
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: { xs: 60, sm: 70 }, gap: { xs: 1, sm: 2 } }}>
            {/* Logo and Brand Title */}
            <Stack direction="row" alignItems="center" spacing={1.2} sx={{ flexGrow: 1, minWidth: 0 }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: { xs: 36, sm: 42 },
                  height: { xs: 36, sm: 42 },
                  boxShadow: "0 8px 16px -4px rgba(79, 70, 229, 0.4)"
                }}
              >
                <GraduationCap size={22} color="#ffffff" />
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" fontWeight={800} noWrap sx={{ lineHeight: 1.2, fontSize: { xs: "0.95rem", sm: "1.2rem" } }}>
                  NIS <span style={{ color: "#4f46e5" }}>DEADline</span> System
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                  Topshiriq & Baholash Portali
                </Typography>
              </Box>
            </Stack>

            {/* Navigation Tabs (Mobile & Desktop) */}
            {setTab && (
              <Box sx={{ bgcolor: "#f1f5f9", p: "3px", borderRadius: "14px", display: "flex", gap: "2px" }}>
                <MuiButton
                  size="small"
                  variant={tab === "main" ? "contained" : "text"}
                  color={tab === "main" ? "primary" : "inherit"}
                  startIcon={<FileText size={15} />}
                  onClick={() => setTab("main")}
                  sx={{
                    borderRadius: "10px",
                    px: { xs: 1.2, sm: 2 },
                    py: 0.6,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    bgcolor: tab === "main" ? "primary.main" : "transparent",
                    color: tab === "main" ? "#ffffff" : "text.secondary"
                  }}
                >
                  Vazifalar
                </MuiButton>
                <MuiButton
                  size="small"
                  variant={tab === "dashboard" ? "contained" : "text"}
                  color={tab === "dashboard" ? "primary" : "inherit"}
                  startIcon={<Trophy size={15} />}
                  onClick={() => { setTab("dashboard"); fireConfetti(); }}
                  sx={{
                    borderRadius: "10px",
                    px: { xs: 1.2, sm: 2 },
                    py: 0.6,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    bgcolor: tab === "dashboard" ? "primary.main" : "transparent",
                    color: tab === "dashboard" ? "#ffffff" : "text.secondary"
                  }}
                >
                  Natijalar
                </MuiButton>
              </Box>
            )}

            {/* Profile Avatar / Chip Button */}
            {user && (
              <Tooltip title="Mening profilim va sozlamalar">
                <Chip
                  avatar={
                    <Avatar sx={{ bgcolor: user.role === "admin" ? "#f59e0b" : "#4f46e5", color: "#fff", width: 28, height: 28 }}>
                      {user.full_name[0]}
                    </Avatar>
                  }
                  label={user.role === "admin" ? "Admin" : (user.student_id || "Profil")}
                  onClick={() => setProfileOpen(true)}
                  clickable
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    borderColor: "#cbd5e1",
                    height: 36,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#f1f5f9", borderColor: "primary.main" }
                  }}
                />
              </Tooltip>
            )}

            {onLogout && (
              <Tooltip title="Tizimdan chiqish">
                <IconButton
                  onClick={onLogout}
                  size="small"
                  sx={{
                    color: "text.secondary",
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    width: 36,
                    height: 36,
                    "&:hover": { color: "error.main", bgcolor: "#fef2f2" }
                  }}
                >
                  <LogOut size={16} />
                </IconButton>
              </Tooltip>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3, fontSize: { xs: "0.9rem", sm: "1.05rem" } }}>
              {subtitle}
            </Typography>
          )}
        </motion.div>
        {children}
      </Container>

      {/* Global Profile Modal */}
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        onLogout={onLogout}
      />
    </Box>
  );
}

function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [i, setI] = useState(""), [p, setP] = useState(""), [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState(""), [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const r = await api.post("/auth/login", { identity: i, password: p });
      localStorage.setItem("token", r.data.access_token);
      onLogin(r.data.user);
      nav("/");
    } catch (e: any) {
      setErr(e.response?.data?.detail || "Kirish amalga oshmadi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-background" sx={{ p: { xs: 2, sm: 3 } }}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Paper className="auth-card" elevation={0} sx={{ p: { xs: 3, sm: 4 }, width: "100%", maxWidth: 450 }}>
          <Stack alignItems="center" textAlign="center" spacing={1.5} sx={{ mb: 3.5 }}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 58,
                height: 58,
                boxShadow: "0 12px 24px -6px rgba(79, 70, 229, 0.4)"
              }}
            >
              <GraduationCap size={32} color="#ffffff" />
            </Avatar>
            <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
              NIS <span style={{ color: "#4f46e5" }}>DEADline</span> System
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Topshiriq & Baholash portaliga kirish
            </Typography>
          </Stack>

          <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2.2 }}>
            <TextField
              required
              fullWidth
              label="O‘quvchi ID yoki login"
              placeholder="nis@001 yoki cybertron"
              value={i}
              onChange={e => setI(e.target.value)}
            />
            <TextField
              required
              fullWidth
              label="Parol"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={p}
              onChange={e => setP(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" aria-label="parolni ko‘rsatish">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                )
              }}
            />
            {err && <Alert severity="error" sx={{ borderRadius: "12px" }}>{err}</Alert>}
            <MuiButton type="submit" size="large" disabled={loading} sx={{ height: 48 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Tizimga kirish"}
            </MuiButton>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">YOKI</Typography>
          </Divider>

          <MuiButton
            variant="outlined"
            fullWidth
            onClick={() => nav("/register")}
            sx={{
              height: 46,
              color: "text.primary",
              borderColor: "#e2e8f0",
              "&:hover": { borderColor: "primary.main", bgcolor: "#f8fafc" }
            }}
          >
            O‘quvchi sifatida ro‘yxatdan o‘tish
          </MuiButton>
        </Paper>
      </motion.div>
    </Box>
  );
}

function Register() {
  const [cs, setCs] = useState<any[]>([]),
    [f, setF] = useState<any>({ full_name: "", class_id: "", password: "", confirm: "" }),
    [msg, setMsg] = useState(""), [ok, setOk] = useState(false), [loading, setLoading] = useState(false),
    [studentId, setStudentId] = useState(""),
    [studentIdDialogOpen, setStudentIdDialogOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    api.get("/classes/public").then(r => setCs(r.data));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.password !== f.confirm) return setMsg("Parollar bir xil emas");
    if (f.password.length < 8) return setMsg("Parol kamida 8 ta belgidan iborat bo‘lishi kerak");
    setLoading(true);
    setMsg("");
    try {
      const r = await api.post("/auth/register", f);
      setOk(true);
      setStudentId(r.data.student_id);
      setStudentIdDialogOpen(true);
      fireConfetti();
    } catch (e: any) {
      setOk(false);
      setMsg(e.response?.data?.detail || "Ro‘yxatdan o‘tish amalga oshmadi");
    } finally {
      setLoading(false);
    }
  };

  const closeStudentIdDialog = () => {
    setStudentIdDialogOpen(false);
    nav("/login");
  };

  return (
    <Box className="auth-background" sx={{ p: { xs: 2, sm: 3 } }}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Paper className="auth-card" elevation={0} sx={{ p: { xs: 3, sm: 4 }, width: "100%", maxWidth: 460 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <Avatar sx={{ bgcolor: "secondary.main", width: 44, height: 44 }}>
              <Users size={22} color="#ffffff" />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800}>Ro‘yxatdan o‘tish</Typography>
              <Typography variant="body2" color="text.secondary">O‘quvchi profilingizni yarating</Typography>
            </Box>
          </Stack>

          <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2 }}>
            <TextField
              required
              fullWidth
              label="F.I.Sh."
              placeholder="Ali Valiyev"
              value={f.full_name}
              onChange={e => setF({ ...f, full_name: e.target.value })}
            />
            <TextField
              required
              select
              fullWidth
              label="Sinfi"
              value={f.class_id}
              onChange={e => setF({ ...f, class_id: e.target.value })}
            >
              <MenuItem value="">Sinfni tanlang</MenuItem>
              {cs.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField
              required
              fullWidth
              label="Parol"
              type="password"
              helperText="Kamida 8 ta belgi"
              value={f.password}
              onChange={e => setF({ ...f, password: e.target.value })}
            />
            <TextField
              required
              fullWidth
              label="Parolni tasdiqlang"
              type="password"
              value={f.confirm}
              onChange={e => setF({ ...f, confirm: e.target.value })}
            />
            {msg && <Alert severity={ok ? "success" : "error"} sx={{ borderRadius: "12px" }}>{msg}</Alert>}
            <MuiButton type="submit" size="large" disabled={ok || loading} sx={{ height: 48 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Hisob yaratish"}
            </MuiButton>
          </Box>

          <MuiButton
            variant="text"
            fullWidth
            onClick={() => nav("/login")}
            startIcon={<ArrowLeft size={16} />}
            sx={{ mt: 2, color: "text.secondary" }}
          >
            Kirish sahifasiga qaytish
          </MuiButton>
        </Paper>
      </motion.div>

      <Dialog
        open={studentIdDialogOpen}
        onClose={closeStudentIdDialog}
        maxWidth="xs"
        fullWidth
        sx={{ "& .MuiDialog-paper": { m: 2 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={800}>Ro‘yxatdan o‘tdingiz</Typography>
          <IconButton aria-label="close" onClick={closeStudentIdDialog}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={2.5} alignItems="center" textAlign="center">
            <Avatar sx={{ bgcolor: "success.main", width: 64, height: 64 }}>
              <Check size={32} color="#ffffff" />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Sizning maxsus ID raqamingiz:
              </Typography>
              <Typography variant="h3" fontWeight={900} color="primary.main" sx={{ letterSpacing: 1 }}>
                {studentId}
              </Typography>
            </Box>
            <Alert severity="warning" sx={{ width: "100%", borderRadius: "12px", textAlign: "left" }}>
              Ushbu ID raqamni saqlab oling! Tizimga kirishda shu ID va parolingizdan foydalanasiz.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <MuiButton fullWidth onClick={closeStudentIdDialog}>
            Tizimga kirish
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function Countdown({ deadline }: { deadline: string }) {
  const [n, setN] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setN(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.max(0, Math.floor((new Date(deadline).getTime() - n) / 1000));
  if (!s) return <Typography component="span" color="error.main" fontWeight={700}>Muddat tugadi</Typography>;
  const days = Math.floor(s / 86400);
  const hrs = String(Math.floor((s % 86400) / 3600)).padStart(2, "0");
  const mins = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const secs = String(s % 60).padStart(2, "0");
  return (
    <Typography component="span" fontWeight={700} color="warning.dark">
      {days ? `${days} kun ` : ""}{hrs}:{mins}:{secs} qoldi
    </Typography>
  );
}

function DashboardView() {
  const results = useQuery({
    queryKey: ["dashboard-results"],
    queryFn: () => api.get("/dashboard/results").then(r => r.data)
  });

  return (
    <Stack spacing={4}>
      {/* Hero Banner */}
      <Paper
        sx={{
          p: { xs: 2.5, sm: 3.5, md: 4 },
          background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 50%, #1e1b4b 100%)",
          color: "#ffffff",
          borderRadius: "24px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.2)"
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
          <Box sx={{ maxWidth: 650 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip
                icon={<Sparkles size={14} color="#fcd34d" />}
                label="Jonli Reyting"
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 700 }}
              />
            </Stack>
            <Typography variant="h4" fontWeight={800} sx={{ color: "#fff", fontSize: { xs: "1.4rem", sm: "2rem" } }}>
              Natijalar & Shon-sharaf Doskasi
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.8 }}>
              O‘qituvchilar tomonidan baholangan va e‘lon qilingan barcha topshiriqlar bo‘yicha talabalar reytingi.
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: { xs: 60, sm: 76 },
              height: { xs: 60, sm: 76 },
              bgcolor: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              alignSelf: { xs: "flex-end", sm: "center" }
            }}
          >
            <Trophy size={36} color="#fcd34d" />
          </Avatar>
        </Stack>
      </Paper>

      {results.isLoading && (
        <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress /></Box>
      )}

      {results.data?.length === 0 && (
        <Paper variant="outlined" sx={{ p: 5, textAlign: "center", bgcolor: "#fff", borderRadius: "24px" }}>
          <Trophy size={50} color="#d2a84a" style={{ margin: "0 auto 16px" }} />
          <Typography variant="h6" fontWeight={700}>Hozircha e‘lon qilingan natijalar yo‘q</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 450, mx: "auto" }}>
            O‘qituvchi topshiriqlarni tekshirib, natijalarni e‘lon qilgach, bu yerda g‘oliblar shohsupasi va to‘liq jadval paydo bo‘ladi.
          </Typography>
        </Paper>
      )}

      {results.data?.map((a: any) => {
        const top3 = a.students.slice(0, 3).filter((s: any) => s.score !== null);
        return (
          <motion.div
            key={a.assignment_id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: "24px", bgcolor: "#ffffff" }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ sm: "center" }}
                spacing={1.5}
                sx={{ mb: 2.5 }}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Chip label={a.subject} color="primary" size="small" sx={{ fontWeight: 700 }} />
                    <Chip label={`Maks: ${a.max_score} ball`} variant="outlined" size="small" />
                  </Stack>
                  <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
                    {a.title}
                  </Typography>
                </Box>
                <Paper
                  variant="outlined"
                  sx={{
                    px: 2,
                    py: 0.8,
                    bgcolor: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    borderRadius: "14px",
                    alignSelf: { xs: "flex-start", sm: "auto" }
                  }}
                >
                  <Box textAlign="right">
                    <Typography variant="caption" color="text.secondary" display="block">O‘rtacha ball</Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main">{a.average_score} ball</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "#e0e7ff", color: "primary.main", width: 34, height: 34 }}>
                    <Award size={18} />
                  </Avatar>
                </Paper>
              </Stack>

              {/* Podium for Top 3 */}
              {top3.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {top3.map((st: any, idx: number) => {
                    const podiumClass = idx === 0 ? "podium-1" : idx === 1 ? "podium-2" : "podium-3";
                    const medal = idx === 0 ? "🥇 1-O‘rin" : idx === 1 ? "🥈 2-O‘rin" : "🥉 3-O‘rin";
                    return (
                      <Grid size={{ xs: 12, sm: 4 }} key={st.student_id}>
                        <Paper
                          className={podiumClass}
                          sx={{
                            p: 2,
                            borderRadius: "18px",
                            textAlign: "center"
                          }}
                        >
                          <Typography variant="caption" fontWeight={800} sx={{ textTransform: "uppercase" }}>
                            {medal}
                          </Typography>
                          <Typography variant="h6" fontWeight={800} noWrap sx={{ mt: 0.5, fontSize: "1rem" }}>
                            {st.student_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {st.student_id} · {st.class_name}
                          </Typography>
                          <Typography variant="h5" fontWeight={800} color="primary.main" sx={{ mt: 1 }}>
                            {st.score} <span style={{ fontSize: "0.85rem", color: "#64748b" }}>/ {a.max_score}</span>
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              )}

              {/* Leaderboard Table (Mobile-Responsive Scrollable) */}
              <TableContainer sx={{ borderRadius: "16px", border: "1px solid #f1f5f9", overflowX: "auto" }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: 60 }}>O‘rin</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>O‘quvchi</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Sinfi</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>Natija / Progress</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Taqriz</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {a.students.map((st: any, idx: number) => {
                      const hasScore = st.score !== null && st.score !== undefined;
                      const percentage = hasScore ? Math.round((st.score / a.max_score) * 100) : 0;
                      return (
                        <TableRow key={st.student_id + idx} hover sx={{ bgcolor: idx < 3 && hasScore ? "#fafcfb" : "inherit" }}>
                          <TableCell sx={{ fontWeight: 800 }}>
                            {idx === 0 ? "🥇 1" : idx === 1 ? "🥈 2" : idx === 2 ? "🥉 3" : idx + 1}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{st.student_name}</TableCell>
                          <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>{st.student_id}</TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{st.class_name}</TableCell>
                          <TableCell>
                            {hasScore ? (
                              <Box sx={{ width: "100%" }}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.3 }}>
                                  <Typography variant="body2" fontWeight={800}>{st.score} ball</Typography>
                                  <Typography variant="caption" color="text.secondary">{percentage}%</Typography>
                                </Stack>
                                <LinearProgress
                                  variant="determinate"
                                  value={percentage}
                                  sx={{
                                    height: 6,
                                    borderRadius: 4,
                                    bgcolor: "#e2e8f0",
                                    "& .MuiLinearProgress-bar": {
                                      bgcolor: percentage >= 80 ? "#10b981" : percentage >= 60 ? "#4f46e5" : "#f59e0b",
                                      borderRadius: 4
                                    }
                                  }}
                                />
                              </Box>
                            ) : st.submitted ? (
                              <Chip size="small" label="Tekshirilmoqda" variant="outlined" />
                            ) : (
                              <Chip size="small" label="Topshirmagan" color="error" variant="outlined" />
                            )}
                          </TableCell>
                          <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                            {st.feedback ? (
                              <Paper variant="outlined" sx={{ p: 0.8, bgcolor: "#f8fafc", borderRadius: "8px" }}>
                                {st.feedback}
                              </Paper>
                            ) : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </motion.div>
        );
      })}
    </Stack>
  );
}

function Student({ user }: { user: User }) {
  const [tab, setTab] = useState("main");
  const q = useQuery({ queryKey: ["assignments"], queryFn: () => api.get("/student/assignments").then(r => r.data) });
  const [selected, setSelected] = useState<any>(null),
    [comment, setComment] = useState(""),
    [files, setFiles] = useState<File[]>([]),
    [msg, setMsg] = useState("");

  const [submitBtn, setSubmitBtn] = useState({ loading: false, success: false });
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({
    open: false, message: "", severity: "success"
  });

  const detail = useQuery({
    queryKey: ["assignment", selected?.assignment_id],
    enabled: !!selected,
    queryFn: () => api.get("/assignments/" + selected.assignment_id).then(r => r.data)
  });

  useEffect(() => {
    if (detail.data) {
      setComment(detail.data.comment || "");
      setFiles([]);
    }
  }, [detail.data?.id]);

  const download = async (f: any) => {
    try {
      const r = await api.get("/files/" + f.id, { responseType: "blob" });
      const url = URL.createObjectURL(r.data), a = document.createElement("a");
      a.href = url; a.download = f.name; a.click(); URL.revokeObjectURL(url);
    } catch { setMsg("Faylni yuklab bo‘lmadi"); }
  };

  const addFiles = (next: FileList | null) => {
    if (!next) return;
    const incoming = Array.from(next);
    const validation = checkFilesValidity(incoming);
    if (!validation.ok) {
      setMsg(validation.error || "Fayl yaroqsiz");
      return;
    }
    const known = new Set([...(detail.data?.submission_files || []).map((f: any) => f.name.toLocaleLowerCase()), ...files.map(f => f.name.toLocaleLowerCase())]);
    const fresh = incoming.filter(f => !known.has(f.name.toLocaleLowerCase()));
    if (fresh.length + files.length > 5) {
      setMsg("Ko‘pi bilan 5 ta fayl yuklash mumkin");
      return;
    }
    setFiles([...files, ...fresh]);
    if (fresh.length < incoming.length) setMsg("Takrorlangan fayllar qo‘shilmadi");
    else setMsg("");
  };

  const submit = async () => {
    if (!selected || submitBtn.loading) return;
    const validation = checkFilesValidity(files);
    if (!validation.ok) {
      setMsg(validation.error || "Fayllarda xatolik");
      return;
    }
    const data = new FormData();
    if (comment.trim()) data.append("comment", comment.trim());
    files.forEach(f => data.append("files", f));
    if (!files.length && !comment.trim()) { setMsg("Izoh yoki kamida bitta fayl kiriting"); return; }
    
    setSubmitBtn({ loading: true, success: false });
    try {
      await api.post("/assignments/" + selected.assignment_id + "/submissions", data);
      setSubmitBtn({ loading: false, success: true });
      fireConfetti();
      setToast({ open: true, message: "🎉 Vazifangiz muvaffaqiyatli topshirildi!", severity: "success" });
      q.refetch();
      setTimeout(() => {
        setSelected(null);
        setSubmitBtn({ loading: false, success: false });
        setMsg("");
      }, 1200);
    } catch (e: any) {
      setSubmitBtn({ loading: false, success: false });
      setMsg(e.response?.data?.detail || "Saqlashda xatolik");
    }
  };

  const fileGrid = (items: any[], uploaded: boolean) => (
    <Grid container spacing={1.5}>
      {items.map((f: any) => (
        <Grid key={uploaded ? f.id : f.name} size={{ xs: 12, sm: 6 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: "14px",
              bgcolor: uploaded ? "#f0fdf4" : "#fefce8",
              borderColor: uploaded ? "#bbf7d0" : "#fef08a",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: uploaded ? "#dcfce7" : "#fef9c3", color: uploaded ? "success.main" : "warning.dark" }}>
                <FileText size={18} />
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} noWrap title={f.name}>{f.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {f.size ? (f.size / (1024 * 1024)).toFixed(2) + " MB · " : ""}{uploaded ? "Yuklangan" : "Yuborishga tayyor"}
                </Typography>
              </Box>
            </Stack>
            {uploaded ? (
              <MuiButton size="small" variant="text" startIcon={<Download size={14} />} onClick={() => download(f)}>
                Yuklab olish
              </MuiButton>
            ) : (
              <IconButton size="small" color="error" onClick={() => setFiles(files.filter(x => x.name !== f.name))}>
                <Trash2 size={16} />
              </IconButton>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Shell
      title={"Assalomu alaykum, " + user.full_name}
      subtitle={`O‘quvchi ID: ${user.student_id || ""} · Sinfi: ${user.class_name || ""}`}
      onLogout={() => { localStorage.clear(); location.reload(); }}
      tab={tab}
      setTab={setTab}
      user={user}
    >
      {tab === "dashboard" ? (
        <DashboardView />
      ) : (
        <>
          {/* Welcome Statistics Card */}
          <Paper
            sx={{
              p: { xs: 2.5, sm: 3 },
              mb: 3.5,
              borderRadius: "20px",
              background: "linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)",
              border: "1px solid #e0e7ff"
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 8 }}>
                <Typography variant="h5" fontWeight={800} color="primary.dark" sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
                  Mening Topshiriqlarim
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Vazifalarni vaqtida yuboring, ballaringizni tekshiring va natijalar doskasida yuqori o‘rinlarni egallang!
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Stack direction="row" spacing={1.5} justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
                  <Paper sx={{ px: 2, py: 1, textAlign: "center", borderRadius: "14px", bgcolor: "#fff", flex: { xs: 1, sm: "none" } }}>
                    <Typography variant="h5" fontWeight={800} color="primary.main">
                      {q.data?.length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Jami vazifa</Typography>
                  </Paper>
                  <Paper sx={{ px: 2, py: 1, textAlign: "center", borderRadius: "14px", bgcolor: "#fff", flex: { xs: 1, sm: "none" } }}>
                    <Typography variant="h5" fontWeight={800} color="success.main">
                      {q.data?.filter((x: any) => x.status === "graded" || x.status === "submitted").length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Topshirilgan</Typography>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {q.isLoading && <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress /></Box>}

          <Grid container spacing={2.5}>
            {q.data?.map((a: any) => {
              const isGraded = a.status === "graded";
              const sent = a.status === "submitted" || isGraded;
              const locked = a.status === "locked";
              return (
                <Grid size={{ xs: 12, md: 6 }} key={a.assignment_id}>
                  <Card
                    className="card-hover"
                    onClick={() => { setSelected(a); setComment(""); setFiles([]); setMsg(""); }}
                    sx={{
                      height: "100%",
                      cursor: "pointer",
                      borderRadius: "20px",
                      position: "relative",
                      borderLeft: "6px solid " + (isGraded ? "#10b981" : sent ? "#4f46e5" : locked ? "#94a3b8" : "#f59e0b")
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Chip
                          label={a.subject}
                          size="small"
                          sx={{ bgcolor: "#eef2ff", color: "primary.main", fontWeight: 700 }}
                        />
                        {isGraded ? (
                          <Chip
                            icon={<Trophy size={14} color="#10b981" />}
                            label={`Baho: ${a.score}/${a.max_score}`}
                            color="success"
                            size="small"
                            sx={{ fontWeight: 800 }}
                          />
                        ) : sent ? (
                          <Chip icon={<CheckCircle2 size={14} />} label="Yuborildi" color="primary" size="small" />
                        ) : locked ? (
                          <Chip icon={<Lock size={14} />} label="Yopilgan" size="small" />
                        ) : (
                          <Chip icon={<Clock size={14} />} label="Jarayonda" color="warning" size="small" />
                        )}
                      </Stack>

                      <Typography variant="h6" fontWeight={800} sx={{ mt: 1.5, fontSize: "1.1rem" }}>{a.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8, minHeight: 40 }}>
                        {a.description}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Calendar size={15} color="#64748b" />
                          <Typography variant="body2">
                            {isGraded ? (
                              <span style={{ color: "#10b981", fontWeight: 700 }}>Baholandi</span>
                            ) : sent ? (
                              <span style={{ color: "#4f46e5", fontWeight: 700 }}>Vaqtida topshirildi</span>
                            ) : locked ? (
                              <span style={{ color: "#ef4444", fontWeight: 700 }}>Muddati o‘tgan</span>
                            ) : (
                              <Countdown deadline={a.deadline} />
                            )}
                          </Typography>
                        </Stack>

                        {a.results_published && (
                          <Chip
                            icon={<Trophy size={12} />}
                            label="Natija e‘lon qilindi"
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Submission Modal */}
          <Dialog open={!!selected} onClose={() => !submitBtn.loading && setSelected(null)} fullWidth maxWidth="md" sx={{ "& .MuiDialog-paper": { m: { xs: 1.5, sm: 2 } } }}>
            <DialogTitle sx={{ pb: 1 }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
                <Box>
                  <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
                    {detail.data?.title || "Vazifa tafsilotlari"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{detail.data?.subject}</Typography>
                </Box>
                <Chip label={`Maksimal ball: ${detail.data?.max_score || 100}`} color="primary" variant="outlined" sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }} />
              </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: "#fafcfa", p: { xs: 2, sm: 3 } }}>
              {detail.isLoading ? (
                <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress /></Box>
              ) : (
                <Stack spacing={2.5}>
                  <Paper sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#fff" }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Yo‘riqnoma:</Typography>
                    <Typography variant="body1">{detail.data?.description}</Typography>
                    {detail.data?.notes && (
                      <Alert severity="info" sx={{ mt: 2, borderRadius: "12px" }}>
                        {detail.data.notes}
                      </Alert>
                    )}
                  </Paper>

                  {/* Grade Banner */}
                  {detail.data?.score !== null && detail.data?.score !== undefined && (
                    <Paper
                      sx={{
                        p: 2.5,
                        borderRadius: "18px",
                        background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                        border: "1px solid #a7f3d0"
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "#10b981", width: 44, height: 44 }}>
                          <Trophy size={24} color="#ffffff" />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={800} color="#065f46">
                            Sizning natijangiz: {detail.data.score} / {detail.data.max_score} ball
                          </Typography>
                          {detail.data.feedback && (
                            <Typography variant="body2" sx={{ mt: 0.5, color: "#047857" }}>
                              <strong>O‘qituvchi taqrizi:</strong> {detail.data.feedback}
                            </Typography>
                          )}
                          {detail.data.graded_at && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                              Baholandi: {new Date(detail.data.graded_at).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent", hour12: false })}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Paper>
                  )}

                  {/* Teacher Attachments */}
                  {detail.data?.attachments?.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                        O‘qituvchi ilova qilgan topshiriq fayllari
                      </Typography>
                      {fileGrid(detail.data.attachments, true)}
                    </Box>
                  )}

                  {/* Uploaded Files */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                      Siz yuborgan fayllar
                    </Typography>
                    {detail.data?.submission_files?.length ? (
                      fileGrid(detail.data.submission_files, true)
                    ) : (
                      <Paper variant="outlined" sx={{ p: 2.5, textAlign: "center", color: "text.secondary", borderRadius: "14px" }}>
                        Hali fayl yuklanmagan.
                      </Paper>
                    )}
                  </Box>

                  {/* Upload Area for Student */}
                  {!detail.data?.locked && !detail.data?.submitted_at && (
                    <Stack spacing={2}>
                      <Typography variant="subtitle1" fontWeight={700}>Yangi fayllar biriktirish</Typography>
                      <MuiButton
                        component="label"
                        variant="outlined"
                        fullWidth
                        sx={{
                          height: 70,
                          borderStyle: "dashed",
                          borderWidth: 2,
                          borderColor: "#cbd5e1",
                          bgcolor: "#f8fafc",
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <UploadCloud size={20} color="#4f46e5" />
                          <Typography fontWeight={700} color="primary.main">Fayllarni tanlash uchun bosing</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Formatlar: .pdf, .docx, .xlsx, .zip, .py, .jpg va h.k. (maks: 15MB)
                        </Typography>
                        <input hidden multiple type="file" onChange={e => { addFiles(e.target.files); e.currentTarget.value = ""; }} />
                      </MuiButton>

                      {files.length > 0 && fileGrid(files, false)}

                      <TextField
                        multiline
                        minRows={3}
                        label="Izoh (ixtiyoriy)"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="O‘qituvchiga qo‘shimcha izoh yoki savollaringiz..."
                      />

                      {msg && <Alert severity="error" sx={{ borderRadius: "12px" }}>{msg}</Alert>}
                    </Stack>
                  )}

                  {detail.data?.submitted_at && !detail.data?.score && (
                    <Alert severity="success" sx={{ borderRadius: "12px" }}>
                      Vazifangiz muvaffaqiyatli qabul qilingan. O‘qituvchi baholashi kutilmoqda.
                    </Alert>
                  )}
                </Stack>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
              <MuiButton color="inherit" onClick={() => setSelected(null)} disabled={submitBtn.loading}>
                Yopish
              </MuiButton>
              {!detail.data?.locked && !detail.data?.submitted_at && (
                <FeedbackButton
                  onClick={submit}
                  loading={submitBtn.loading}
                  success={submitBtn.success}
                  defaultText="Topshiriqni yuborish"
                  successText="Topshirildi! 🎉"
                  icon={Send}
                />
              )}
            </DialogActions>
          </Dialog>

          {/* Floating Toast Notification */}
          <Snackbar
            open={toast.open}
            autoHideDuration={4000}
            onClose={() => setToast({ ...toast, open: false })}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert
              onClose={() => setToast({ ...toast, open: false })}
              severity={toast.severity}
              variant="filled"
              sx={{ width: "100%", borderRadius: "14px", fontWeight: 700, boxShadow: 6 }}
            >
              {toast.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Shell>
  );
}

function Admin() {
  const [tab, setTab] = useState("main");
  const stats = useQuery({ queryKey: ["stats"], queryFn: () => api.get("/admin/stats").then(r => r.data) });
  const cs = useQuery({ queryKey: ["classes"], queryFn: () => api.get("/admin/classes").then(r => r.data) });
  const subs = useQuery({ queryKey: ["subjects"], queryFn: () => api.get("/admin/subjects").then(r => r.data) });
  const students = useQuery({ queryKey: ["students"], queryFn: () => api.get("/admin/students").then(r => r.data) });

  const [selectedClass, setSelectedClass] = useState<any>(null),
    [selectedAssignment, setSelectedAssignment] = useState<any>(null),
    [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const [scoreInput, setScoreInput] = useState<number | string>(""),
    [feedbackInput, setFeedbackInput] = useState("");

  // Assignment attachment files state
  const [taskFiles, setTaskFiles] = useState<File[]>([]);
  const [taskFileMsg, setTaskFileMsg] = useState("");
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [uploadingExtra, setUploadingExtra] = useState(false);

  // Individual Button Animation States
  const [classBtn, setClassBtn] = useState({ loading: false, success: false });
  const [subjBtn, setSubjBtn] = useState({ loading: false, success: false });
  const [taskBtn, setTaskBtn] = useState({ loading: false, success: false });
  const [gradeBtn, setGradeBtn] = useState({ loading: false, success: false });
  const [pubBtn, setPubBtn] = useState({ loading: false, success: false });

  // Floating Toast Notification
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({
    open: false, message: "", severity: "success"
  });

  const showToast = (message: string, severity: "success" | "error" | "info" = "success") => {
    setToast({ open: true, message, severity });
  };

  const overview = useQuery({
    queryKey: ["class-overview", selectedClass?.id],
    enabled: !!selectedClass,
    queryFn: () => api.get("/admin/classes/" + selectedClass.id + "/overview").then(r => r.data)
  });

  const assignmentDetails = useQuery({
    queryKey: ["admin-assignment-details", selectedAssignment?.id],
    enabled: !!selectedAssignment,
    queryFn: () => api.get("/assignments/" + selectedAssignment.id).then(r => r.data)
  });

  const recipients = useQuery({
    queryKey: ["recipients", selectedAssignment?.id, selectedClass?.id],
    enabled: !!selectedAssignment,
    queryFn: () => api.get("/admin/assignments/" + selectedAssignment.id + "/recipients", {
      params: selectedClass ? { class_id: selectedClass.id } : {}
    }).then(r => r.data)
  });

  const [cname, setCname] = useState(""), [sname, setSname] = useState(""),
    [task, setTask] = useState<any>({
      subject_id: "", title: "", description: "", notes: "", deadline: "",
      target_type: "class", class_id: "", student_id: "", max_score: 100
    });

  const set = (k: string, v: any) => setTask({ ...task, [k]: v }),
    refresh = () => { stats.refetch(); cs.refetch(); subs.refetch(); students.refetch(); };

  const handleTaskFilesAdd = (fileList: FileList | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    const check = checkFilesValidity(incoming);
    if (!check.ok) {
      setTaskFileMsg(check.error || "Fayl yaroqsiz");
      return;
    }
    if (taskFiles.length + incoming.length > 5) {
      setTaskFileMsg("Ko‘pi bilan 5 ta fayl biriktirish mumkin");
      return;
    }
    setTaskFiles([...taskFiles, ...incoming]);
    setTaskFileMsg("");
  };

  // Class Creation with Button Animation & Toast
  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cname.trim() || classBtn.loading) return;
    setClassBtn({ loading: true, success: false });
    try {
      await api.post("/admin/classes", { name: cname.trim() });
      setClassBtn({ loading: false, success: true });
      fireConfetti();
      showToast(`🎉 "${cname.trim()}" sinfi muvaffaqiyatli qo‘shildi!`, "success");
      setCname("");
      refresh();
      setTimeout(() => setClassBtn({ loading: false, success: false }), 2000);
    } catch (e: any) {
      setClassBtn({ loading: false, success: false });
      showToast(e.response?.data?.detail || "Sinf yaratishda xatolik", "error");
    }
  };

  // Subject Creation with Button Animation & Toast
  const createSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sname.trim() || subjBtn.loading) return;
    setSubjBtn({ loading: true, success: false });
    try {
      await api.post("/admin/subjects", { name: sname.trim() });
      setSubjBtn({ loading: false, success: true });
      fireConfetti();
      showToast(`🎉 "${sname.trim()}" fani muvaffaqiyatli qo‘shildi!`, "success");
      setSname("");
      refresh();
      setTimeout(() => setSubjBtn({ loading: false, success: false }), 2000);
    } catch (e: any) {
      setSubjBtn({ loading: false, success: false });
      showToast(e.response?.data?.detail || "Fan yaratishda xatolik", "error");
    }
  };

  // Task Assignment with Attachment Upload
  const assign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (taskFiles.length > 0) {
      const check = checkFilesValidity(taskFiles);
      if (!check.ok) {
        showToast(check.error || "Fayllarda xatolik", "error");
        return;
      }
    }
    setTaskBtn({ loading: true, success: false });
    try {
      const r = await api.post("/admin/assignments", {
        ...task,
        max_score: Number(task.max_score) || 100,
        deadline: new Date(task.deadline).toISOString(),
        class_id: task.target_type === "class" ? task.class_id : null,
        student_id: task.target_type === "student" ? task.student_id : null
      });

      // Upload files if any
      if (taskFiles.length > 0) {
        const formData = new FormData();
        taskFiles.forEach(f => formData.append("files", f));
        await api.post(`/admin/assignments/${r.data.id}/attachments`, formData);
      }

      setTaskBtn({ loading: false, success: true });
      fireConfetti();
      showToast(`🚀 Vazifa ${r.data.recipients} ta o‘quvchiga muvaffaqiyatli biriktirildi!`, "success");
      setTask({
        subject_id: "", title: "", description: "", notes: "", deadline: "",
        target_type: "class", class_id: "", student_id: "", max_score: 100
      });
      setTaskFiles([]);
      refresh();
      setTimeout(() => setTaskBtn({ loading: false, success: false }), 2200);
    } catch (e: any) {
      setTaskBtn({ loading: false, success: false });
      showToast(e.response?.data?.detail || "Vazifa yaratilmadi", "error");
    }
  };

  const uploadExtraFilesToAssignment = async () => {
    if (!selectedAssignment || extraFiles.length === 0 || uploadingExtra) return;
    const check = checkFilesValidity(extraFiles);
    if (!check.ok) {
      showToast(check.error || "Fayl xatosi", "error");
      return;
    }
    setUploadingExtra(true);
    try {
      const fd = new FormData();
      extraFiles.forEach(f => fd.append("files", f));
      await api.post(`/admin/assignments/${selectedAssignment.id}/attachments`, fd);
      showToast("Fayllar topshiriqqa muvaffaqiyatli biriktirildi!", "success");
      setExtraFiles([]);
      assignmentDetails.refetch();
    } catch (e: any) {
      showToast(e.response?.data?.detail || "Fayl yuklashda xatolik", "error");
    } finally {
      setUploadingExtra(false);
    }
  };

  const download = async (f: any) => {
    try {
      const r = await api.get("/files/" + f.id, { responseType: "blob" });
      const url = URL.createObjectURL(r.data), a = document.createElement("a");
      a.href = url; a.download = f.name; a.click(); URL.revokeObjectURL(url);
    } catch { showToast("Faylni yuklab bo‘lmadi", "error"); }
  };

  const removeAssignment = async () => {
    if (!selectedAssignment || !window.confirm("Bu deadline va barcha topshirishlar o‘chiriladi. Davom etasizmi?")) return;
    try {
      await api.delete("/admin/assignments/" + selectedAssignment.id);
      setSelectedSubmission(null); setSelectedAssignment(null);
      overview.refetch(); cs.refetch(); stats.refetch();
      showToast("Deadline o‘chirildi", "info");
    } catch (e: any) { showToast(e.response?.data?.detail || "O‘chirilmadi", "error"); }
  };

  const togglePublish = async () => {
    if (!selectedAssignment) return;
    setPubBtn({ loading: true, success: false });
    try {
      const r = await api.post("/admin/assignments/" + selectedAssignment.id + "/publish-results");
      setPubBtn({ loading: false, success: true });
      fireConfetti();
      showToast(r.data.message, "success");
      setSelectedAssignment({ ...selectedAssignment, results_published: r.data.results_published });
      overview.refetch();
      setTimeout(() => setPubBtn({ loading: false, success: false }), 2000);
    } catch (e: any) {
      setPubBtn({ loading: false, success: false });
      showToast(e.response?.data?.detail || "Xatolik yuz berdi", "error");
    }
  };

  const openGradeDialog = (r: any) => {
    setSelectedSubmission(r);
    setScoreInput(r.score ?? "");
    setFeedbackInput(r.feedback ?? "");
  };

  const saveGrade = async () => {
    if (!selectedSubmission || !selectedSubmission.submission_id || gradeBtn.loading) return;
    setGradeBtn({ loading: true, success: false });
    try {
      await api.post(`/admin/submissions/${selectedSubmission.submission_id}/grade`, {
        score: Number(scoreInput),
        feedback: feedbackInput
      });
      setGradeBtn({ loading: false, success: true });
      fireConfetti();
      showToast(`⭐ ${selectedSubmission.full_name}ning ishi baholandi (${scoreInput} ball)!`, "success");
      recipients.refetch();
      overview.refetch();
      setTimeout(() => {
        setSelectedSubmission(null);
        setGradeBtn({ loading: false, success: false });
      }, 1200);
    } catch (e: any) {
      setGradeBtn({ loading: false, success: false });
      showToast(e.response?.data?.detail || "Bahoni saqlashda xatolik", "error");
    }
  };

  const statCards = [
    { key: "active_students", label: "Faol O‘quvchilar", icon: <Users size={24} />, color: "#4f46e5", bg: "#eef2ff" },
    { key: "classes", label: "Sinflar Soni", icon: <School size={24} />, color: "#06b6d4", bg: "#ecfeff" },
    { key: "assignments", label: "Vazifalar", icon: <FileText size={24} />, color: "#f59e0b", bg: "#fffbeb" },
    { key: "submitted", label: "Topshirilgan", icon: <CheckCircle2 size={24} />, color: "#10b981", bg: "#ecfdf5" }
  ];

  return (
    <Shell
      title="Boshqaruv Markazi"
      subtitle="Sinflar, fanlar, topshiriqlar, fayllar, baholash va natijalar tizimi."
      onLogout={() => { localStorage.clear(); location.reload(); }}
      tab={tab}
      setTab={setTab}
      user={{ role: "admin", full_name: "Administrator" }}
    >
      {tab === "dashboard" ? (
        <DashboardView />
      ) : (
        <>
          {/* Stat Cards */}
          <Grid container spacing={2} sx={{ mb: 3.5 }}>
            {statCards.map(s => (
              <Grid size={{ xs: 6, md: 3 }} key={s.key}>
                <Paper
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: "20px",
                    border: "1px solid #e2e8f0",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-3px)", boxShadow: "0 10px 20px -3px rgba(0,0,0,0.05)" }
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                        {stats.data?.[s.key] ?? "—"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, fontWeight: 600, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                        {s.label}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: s.bg, color: s.color, width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
                      {s.icon}
                    </Avatar>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Setup & Task Creation Grid */}
          <Grid container spacing={3}>
            {/* Quick Setup */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: "20px" }}>
                <Typography variant="h6" fontWeight={800}>Tezkor Sozlamalar</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Yangi sinflar va fanlar qo‘shish
                </Typography>

                <Box component="form" onSubmit={createClass} sx={{ display: "grid", gap: 1.5, mb: 3 }}>
                  <TextField
                    size="small"
                    label="Yangi sinf nomi"
                    placeholder="Masalan: 10-A"
                    value={cname}
                    onChange={e => setCname(e.target.value)}
                    required
                  />
                  <FeedbackButton
                    type="submit"
                    loading={classBtn.loading}
                    success={classBtn.success}
                    defaultText="Sinf qo‘shish"
                    successText="Sinf qo‘shildi! 🎉"
                    icon={Plus}
                    fullWidth
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box component="form" onSubmit={createSubject} sx={{ display: "grid", gap: 1.5 }}>
                  <TextField
                    size="small"
                    label="Yangi fan nomi"
                    placeholder="Masalan: Fizika"
                    value={sname}
                    onChange={e => setSname(e.target.value)}
                    required
                  />
                  <FeedbackButton
                    type="submit"
                    loading={subjBtn.loading}
                    success={subjBtn.success}
                    defaultText="Fan qo‘shish"
                    successText="Fan qo‘shildi! 🎉"
                    icon={BookOpen}
                    fullWidth
                    color="secondary"
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Task Creation with Attachment */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: "20px" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <Plus size={22} color="#ffffff" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>Yangi Deadline Vazifa</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sinfga (hatto bo‘sh bo‘lsa ham) yoki alohida o‘quvchiga topshiriq biriktiring
                    </Typography>
                  </Box>
                </Stack>

                <Box component="form" onSubmit={assign} sx={{ display: "grid", gap: 2, mt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField required select fullWidth label="Fan" value={task.subject_id} onChange={e => set("subject_id", e.target.value)}>
                        <MenuItem value="">Fanni tanlang</MenuItem>
                        {subs.data?.filter((x: any) => x.active).map((x: any) => (
                          <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField required fullWidth type="datetime-local" label="Deadline (Toshkent vaqti)" InputLabelProps={{ shrink: true }} value={task.deadline} onChange={e => set("deadline", e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TextField required fullWidth label="Vazifa nomi" placeholder="Masalan: 3-Laboratoriya ishi" value={task.title} onChange={e => set("title", e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField required fullWidth type="number" label="Maksimal ball" value={task.max_score} onChange={e => set("max_score", e.target.value)} />
                    </Grid>
                    <Grid size={12}>
                      <TextField required fullWidth multiline minRows={3} label="Yo‘riqnoma va talablar" value={task.description} onChange={e => set("description", e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <TextField select fullWidth label="Kimga beriladi?" value={task.target_type} onChange={e => set("target_type", e.target.value)}>
                        <MenuItem value="class">Butun sinfga</MenuItem>
                        <MenuItem value="student">Alohida o‘quvchiga</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 7 }}>
                      {task.target_type === "class" ? (
                        <TextField required select fullWidth label="Sinf" value={task.class_id} onChange={e => set("class_id", e.target.value)}>
                          <MenuItem value="">Sinfni tanlang</MenuItem>
                          {cs.data?.filter((x: any) => x.active).map((x: any) => (
                            <MenuItem key={x.id} value={x.id}>{x.name} — {x.students} ta o‘quvchi</MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <TextField required select fullWidth label="O‘quvchi" value={task.student_id} onChange={e => set("student_id", e.target.value)}>
                          <MenuItem value="">O‘quvchini tanlang</MenuItem>
                          {students.data?.filter((x: any) => x.active).map((x: any) => (
                            <MenuItem key={x.id} value={x.id}>{x.full_name} ({x.student_id})</MenuItem>
                          ))}
                        </TextField>
                      )}
                    </Grid>

                    {/* Teacher File Attachments */}
                    <Grid size={12}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                        Topshiriq uchun fayl biriktirish (ixtiyoriy, maks: 15MB)
                      </Typography>
                      <MuiButton
                        component="label"
                        variant="outlined"
                        fullWidth
                        sx={{
                          height: 56,
                          borderStyle: "dashed",
                          borderWidth: 2,
                          borderColor: "#cbd5e1",
                          bgcolor: "#f8fafc"
                        }}
                        startIcon={<UploadCloud size={20} color="#4f46e5" />}
                      >
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          O‘quvchilar uchun material biriktirish (.pdf, .docx, .zip, .py va h.k.)
                        </Typography>
                        <input hidden multiple type="file" onChange={e => { handleTaskFilesAdd(e.target.files); e.currentTarget.value = ""; }} />
                      </MuiButton>

                      {taskFileMsg && <Alert severity="error" sx={{ mt: 1, borderRadius: "10px" }}>{taskFileMsg}</Alert>}

                      {taskFiles.length > 0 && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
                          {taskFiles.map(f => (
                            <Chip
                              key={f.name}
                              icon={<Paperclip size={14} />}
                              label={`${f.name} (${(f.size / (1024 * 1024)).toFixed(1)}MB)`}
                              onDelete={() => setTaskFiles(taskFiles.filter(x => x.name !== f.name))}
                              color="primary"
                              variant="outlined"
                              sx={{ my: 0.5 }}
                            />
                          ))}
                        </Stack>
                      )}
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 1 }}>
                    <FeedbackButton
                      type="submit"
                      loading={taskBtn.loading}
                      success={taskBtn.success}
                      defaultText="Vazifani e‘lon qilish"
                      successText="Vazifa biriktirildi! 🚀"
                      icon={Megaphone}
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Classes Cards */}
          <Typography variant="h5" fontWeight={800} sx={{ mt: 4.5, mb: 2 }}>Sinflar Holati</Typography>
          <Grid container spacing={2.5}>
            {cs.data?.map((c: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={c.id}>
                <Card
                  className="card-hover"
                  onClick={() => setSelectedClass(c)}
                  sx={{ cursor: "pointer", borderRadius: "20px", p: 1 }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Avatar sx={{ bgcolor: "#e0e7ff", color: "primary.main" }}>
                        <School size={20} />
                      </Avatar>
                      <Chip label={c.active ? "Faol" : "Nofaol"} color={c.active ? "success" : "default"} size="small" />
                    </Stack>
                    <Typography variant="h6" fontWeight={800} sx={{ mt: 2 }}>{c.name}</Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">{c.students} ta o‘quvchi</Typography>
                      <Chip icon={<FileText size={14} />} label={`${c.task_count || 0} vazifa`} size="small" variant="outlined" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Class Overview Modal */}
          <Dialog open={!!selectedClass} onClose={() => { setSelectedClass(null); setSelectedAssignment(null); }} fullWidth maxWidth="md" sx={{ "& .MuiDialog-paper": { m: { xs: 1.5, sm: 2 } } }}>
            <DialogTitle>
              <Typography variant="h5" fontWeight={800}>{selectedClass?.name} — Sinf faoliyati</Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
              {overview.isLoading ? (
                <Box sx={{ py: 4, textAlign: "center" }}><CircularProgress /></Box>
              ) : (
                <Stack spacing={3}>
                  <Typography variant="subtitle1" fontWeight={700}>O‘quvchilar ro‘yxati</Typography>
                  <Grid container spacing={1.5}>
                    {overview.data?.students?.map((s: any) => {
                      const color = s.state === "submitted" ? "#10b981" : s.state === "overdue" ? "#ef4444" : "#94a3b8";
                      const label = s.state === "submitted" ? "Topshirgan" : s.state === "overdue" ? "Topshirmagan" : "Jarayonda";
                      return (
                        <Grid key={s.id} size={{ xs: 12, sm: 6 }}>
                          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: "14px", borderLeft: "5px solid " + color }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography fontWeight={700}>{s.full_name}</Typography>
                                <Typography variant="caption" color="text.secondary">{s.student_id} · {s.submitted_count} topshirilgan</Typography>
                              </Box>
                              <Chip label={label} size="small" color={s.state === "submitted" ? "success" : s.state === "overdue" ? "error" : "default"} />
                            </Stack>
                          </Paper>
                        </Grid>
                      );
                    })}
                    {!overview.data?.students?.length && (
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: "center", color: "text.secondary", borderRadius: "12px" }}>
                          Bu sinfda hali o‘quvchilar yo‘q. Yangi o‘quvchi ro‘yxatdan o‘tganda unga avtomatik topshiriqlar biriktiriladi.
                        </Paper>
                      </Grid>
                    )}
                  </Grid>

                  <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 2 }}>Vazifalar</Typography>
                  <Grid container spacing={2}>
                    {overview.data?.assignments?.map((a: any) => (
                      <Grid size={{ xs: 12, sm: 6 }} key={a.id}>
                        <Card variant="outlined" onClick={() => setSelectedAssignment(a)} sx={{ cursor: "pointer", p: 1, borderRadius: "16px" }}>
                          <CardContent sx={{ py: "8px !important" }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography fontWeight={700}>{a.title}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {a.subject} · {new Date(a.deadline).toLocaleDateString("uz-UZ")}
                                </Typography>
                              </Box>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {a.results_published && <Chip label="E‘lon qilingan" size="small" color="secondary" />}
                                <Chip label={`${a.submitted_count}/${a.recipient_count}`} color="primary" size="small" />
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <MuiButton color="inherit" onClick={() => setSelectedClass(null)}>Yopish</MuiButton>
            </DialogActions>
          </Dialog>

          {/* Assignment Recipients & Teacher Attachment Management Modal */}
          <Dialog open={!!selectedAssignment} onClose={() => setSelectedAssignment(null)} fullWidth maxWidth="md" sx={{ "& .MuiDialog-paper": { m: { xs: 1.5, sm: 2 } } }}>
            <DialogTitle>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
                <Box>
                  <Typography variant="h5" fontWeight={800}>{selectedAssignment?.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Maksimal ball: {selectedAssignment?.max_score || 100}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <FeedbackButton
                    size="small"
                    color={selectedAssignment?.results_published ? "secondary" : "primary"}
                    loading={pubBtn.loading}
                    success={pubBtn.success}
                    defaultText={selectedAssignment?.results_published ? "Natijalarni yashirish" : "Natijalarni e‘lon qilish"}
                    successText="Natija e‘lon qilindi! 📢"
                    icon={Megaphone}
                    onClick={togglePublish}
                  />
                  <MuiButton color="error" size="small" variant="outlined" startIcon={<Trash2 size={16} />} onClick={removeAssignment}>
                    O‘chirish
                  </MuiButton>
                </Stack>
              </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
              {recipients.isLoading ? (
                <Box sx={{ py: 4, textAlign: "center" }}><CircularProgress /></Box>
              ) : (
                <Stack spacing={2.5}>
                  {/* Teacher Existing Attachments & Upload Extra */}
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: "16px", bgcolor: "#f8fafc" }}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1} sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight={800}>
                        Topshiriq materiallari va fayllari ({assignmentDetails.data?.attachments?.length || 0})
                      </Typography>
                      <MuiButton
                        component="label"
                        size="small"
                        variant="outlined"
                        startIcon={<Plus size={16} />}
                      >
                        Yangi fayl qo‘shish
                        <input
                          hidden
                          multiple
                          type="file"
                          onChange={e => {
                            if (e.target.files) {
                              setExtraFiles(Array.from(e.target.files));
                            }
                            e.currentTarget.value = "";
                          }}
                        />
                      </MuiButton>
                    </Stack>

                    {assignmentDetails.data?.attachments?.length > 0 ? (
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {assignmentDetails.data.attachments.map((f: any) => (
                          <Chip
                            key={f.id}
                            icon={<FileText size={14} />}
                            label={`${f.name} (${(f.size / (1024 * 1024)).toFixed(2)} MB)`}
                            onClick={() => download(f)}
                            clickable
                            color="primary"
                            variant="outlined"
                            sx={{ my: 0.5 }}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">Hali fayl biriktirilmagan.</Typography>
                    )}

                    {extraFiles.length > 0 && (
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5, p: 1, bgcolor: "#fff", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
                        <Typography variant="caption" fontWeight={700}>Tanlandi: {extraFiles.map(x => x.name).join(", ")}</Typography>
                        <MuiButton size="small" onClick={uploadExtraFilesToAssignment} disabled={uploadingExtra}>
                          {uploadingExtra ? "Yuklanmoqda..." : "Yuklash"}
                        </MuiButton>
                        <IconButton size="small" onClick={() => setExtraFiles([])}><X size={16} /></IconButton>
                      </Stack>
                    )}
                  </Paper>

                  <Typography variant="subtitle2" fontWeight={800}>O‘quvchilar topshirish holati</Typography>
                  <Stack spacing={1.5}>
                    {recipients.data?.map((r: any) => {
                      const isGraded = r.status === "graded";
                      const isSubmitted = r.status === "submitted" || isGraded;
                      return (
                        <Paper
                          key={r.student_id}
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: "16px",
                            borderLeft: "6px solid " + (isGraded ? "#10b981" : isSubmitted ? "#4f46e5" : "#ef4444")
                          }}
                        >
                          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1.5}>
                            <Box>
                              <Typography fontWeight={700}>{r.full_name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {r.student_code} · {isGraded ? `Baholandi: ${r.score}/${r.max_score}` : isSubmitted ? "Topshirgan (Kutilmoqda)" : "Topshirmagan"}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              {isGraded && (
                                <Chip
                                  icon={<Trophy size={14} color="#10b981" />}
                                  label={`${r.score} / ${r.max_score}`}
                                  color="success"
                                  sx={{ fontWeight: 800 }}
                                />
                              )}
                              {isSubmitted ? (
                                <MuiButton size="small" onClick={() => openGradeDialog(r)}>
                                  {isGraded ? "Bahoni tahrirlash" : "Baholash"}
                                </MuiButton>
                              ) : (
                                <Chip label="Topshirmagan" color="error" size="small" variant="outlined" />
                              )}
                            </Stack>
                          </Stack>
                        </Paper>
                      );
                    })}
                    {!recipients.data?.length && (
                      <Typography color="text.secondary" textAlign="center">Bu deadline uchun o‘quvchi topilmadi.</Typography>
                    )}
                  </Stack>
                </Stack>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <MuiButton color="inherit" onClick={() => setSelectedAssignment(null)}>Orqaga</MuiButton>
            </DialogActions>
          </Dialog>

          {/* Grade Submission Dialog */}
          <Dialog open={!!selectedSubmission} onClose={() => !gradeBtn.loading && setSelectedSubmission(null)} fullWidth maxWidth="sm" sx={{ "& .MuiDialog-paper": { m: { xs: 1.5, sm: 2 } } }}>
            <DialogTitle>
              <Typography variant="h6" fontWeight={800}>
                {selectedSubmission?.full_name} — Ishni Baholash
              </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2.5}>
                <Typography variant="caption" color="text.secondary">
                  Talaba ID: {selectedSubmission?.student_code} · Yuborilgan: {selectedSubmission?.submitted_at ? new Date(selectedSubmission.submitted_at).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent", hour12: false }) : "—"}
                </Typography>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: "14px" }}>
                  <Typography variant="subtitle2" color="text.secondary">O‘quvchi izohi:</Typography>
                  <Typography sx={{ mt: 0.5 }}>{selectedSubmission?.comment || "Izoh qoldirilmagan."}</Typography>
                </Paper>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Yuklangan fayllar:</Typography>
                  {selectedSubmission?.files?.length ? selectedSubmission.files.map((f: any) => (
                    <MuiButton key={f.id} variant="outlined" size="small" startIcon={<Download size={14} />} sx={{ mr: 1, mb: 1 }} onClick={() => download(f)}>
                      {f.name}
                    </MuiButton>
                  )) : <Typography variant="caption" color="text.secondary">Fayl yo‘q</Typography>}
                </Box>

                <Divider />

                <Paper sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                  <Typography variant="subtitle1" fontWeight={800} color="primary.main" sx={{ mb: 2 }}>
                    Baho va Taqriz
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      required
                      type="number"
                      label={`Ball (0 dan ${selectedSubmission?.max_score || 100} gacha)`}
                      value={scoreInput}
                      onChange={e => setScoreInput(e.target.value)}
                    />
                    <TextField
                      multiline
                      minRows={3}
                      label="O‘qituvchi taqrizi (Feedback)"
                      placeholder="Talabaning ishi bo‘yicha konstruktiv fikr-mulohazangiz..."
                      value={feedbackInput}
                      onChange={e => setFeedbackInput(e.target.value)}
                    />
                  </Stack>
                </Paper>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, justifyContent: "space-between" }}>
              <MuiButton color="inherit" onClick={() => setSelectedSubmission(null)} disabled={gradeBtn.loading}>
                Yopish
              </MuiButton>
              <FeedbackButton
                onClick={saveGrade}
                loading={gradeBtn.loading}
                success={gradeBtn.success}
                defaultText="Bahoni saqlash"
                successText="Baho saqlandi! ⭐"
                icon={Trophy}
              />
            </DialogActions>
          </Dialog>

          {/* Floating Toast Notification */}
          <Snackbar
            open={toast.open}
            autoHideDuration={4000}
            onClose={() => setToast({ ...toast, open: false })}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert
              onClose={() => setToast({ ...toast, open: false })}
              severity={toast.severity}
              variant="filled"
              sx={{ width: "100%", borderRadius: "14px", fontWeight: 700, boxShadow: 6 }}
            >
              {toast.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Shell>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    api.get("/auth/me")
      .then(r => setUser(r.data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (pathname === "/register") return <Register />;
  if (!user) return <Login onLogin={setUser} />;
  return user.role === "admin" ? <Admin /> : <Student user={user} />;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
