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
  TableContainer, TableHead, TableRow, LinearProgress, IconButton, Tooltip
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  GraduationCap, Trophy, Award, Clock, CheckCircle2, AlertCircle, FileText,
  UploadCloud, Send, LogOut, ArrowLeft, Plus, Sparkles, BookOpen, Users,
  School, Calendar, Eye, Trash2, Megaphone, Check, Lock, ChevronRight
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
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.2)"
          }
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

type User = { role: string; full_name: string; student_id?: string; class_name?: string };

function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 }
  });
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
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          color: "text.primary"
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 70, gap: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 40,
                  height: 40,
                  boxShadow: "0 8px 16px -4px rgba(79, 70, 229, 0.4)"
                }}
              >
                <GraduationCap size={22} color="#ffffff" />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                  NIS <span style={{ color: "#4f46e5" }}>Portal</span>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Topshiriq & Baholash
                </Typography>
              </Box>
            </Stack>

            {setTab && (
              <Box sx={{ bgcolor: "#f1f5f9", p: "4px", borderRadius: "14px", display: "flex", gap: "4px" }}>
                <MuiButton
                  size="small"
                  variant={tab === "main" ? "contained" : "text"}
                  color={tab === "main" ? "primary" : "inherit"}
                  startIcon={<FileText size={16} />}
                  onClick={() => setTab("main")}
                  sx={{
                    borderRadius: "10px",
                    px: 2,
                    py: 0.8,
                    bgcolor: tab === "main" ? "primary.main" : "transparent",
                    color: tab === "main" ? "#ffffff" : "text.secondary",
                    "&:hover": { bgcolor: tab === "main" ? "primary.dark" : "rgba(0,0,0,0.04)" }
                  }}
                >
                  Vazifalar
                </MuiButton>
                <MuiButton
                  size="small"
                  variant={tab === "dashboard" ? "contained" : "text"}
                  color={tab === "dashboard" ? "primary" : "inherit"}
                  startIcon={<Trophy size={16} />}
                  onClick={() => { setTab("dashboard"); fireConfetti(); }}
                  sx={{
                    borderRadius: "10px",
                    px: 2,
                    py: 0.8,
                    bgcolor: tab === "dashboard" ? "primary.main" : "transparent",
                    color: tab === "dashboard" ? "#ffffff" : "text.secondary",
                    "&:hover": { bgcolor: tab === "dashboard" ? "primary.dark" : "rgba(0,0,0,0.04)" }
                  }}
                >
                  Natijalar Dashboardi
                </MuiButton>
              </Box>
            )}

            {user && (
              <Chip
                avatar={<Avatar sx={{ bgcolor: user.role === "admin" ? "#f59e0b" : "#4f46e5", color: "#fff" }}>{user.full_name[0]}</Avatar>}
                label={user.role === "admin" ? "Admin" : user.student_id}
                variant="outlined"
                sx={{ fontWeight: 700, borderColor: "#cbd5e1" }}
              />
            )}

            {onLogout && (
              <Tooltip title="Tizimdan chiqish">
                <IconButton
                  onClick={onLogout}
                  sx={{
                    color: "text.secondary",
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    "&:hover": { color: "error.main", bgcolor: "#fef2f2" }
                  }}
                >
                  <LogOut size={18} />
                </IconButton>
              </Tooltip>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{title}</Typography>
          {subtitle && (
            <Typography color="text.secondary" sx={{ mt: 0.6, mb: 3.5, fontSize: "1.05rem" }}>
              {subtitle}
            </Typography>
          )}
        </motion.div>
        {children}
      </Container>
    </Box>
  );
}

function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [i, setI] = useState(""), [p, setP] = useState(""), [err, setErr] = useState(""), [loading, setLoading] = useState(false);
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
    <Box className="auth-background">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Paper className="auth-card" elevation={0}>
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
            <Typography variant="h4" fontWeight={800}>Xush kelibsiz</Typography>
            <Typography variant="body2" color="text.secondary">
              NIS Deadline & Baholash tizimiga kirish
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
              type="password"
              placeholder="••••••••"
              value={p}
              onChange={e => setP(e.target.value)}
            />
            {err && <Alert severity="error" sx={{ borderRadius: "12px" }}>{err}</Alert>}
            <MuiButton type="submit" size="large" disabled={loading} sx={{ height: 48 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Tizimga kirish"}
            </MuiButton>
          </Box>

          <Divider sx={{ my: 3.5 }}>
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
    [msg, setMsg] = useState(""), [ok, setOk] = useState(false), [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    api.get("/classes/public").then(r => setCs(r.data));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.password !== f.confirm) return setMsg("Parollar bir xil emas");
    setLoading(true);
    try {
      const r = await api.post("/auth/register", f);
      setOk(true);
      setMsg("Sizning maxsus ID raqamingiz: " + r.data.student_id + ". Uni saqlab oling!");
      fireConfetti();
      setTimeout(() => nav("/login"), 3500);
    } catch (e: any) {
      setOk(false);
      setMsg(e.response?.data?.detail || "Ro‘yxatdan o‘tish amalga oshmadi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-background">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Paper className="auth-card" elevation={0}>
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
          p: { xs: 3, md: 4 },
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
            <Typography variant="h4" fontWeight={800} sx={{ color: "#fff" }}>
              Natijalar & Shon-sharaf Doskasi
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.8)", mt: 1 }}>
              O‘qituvchilar tomonidan baholangan va e‘lon qilingan barcha topshiriqlar bo‘yicha talabalar reytingi.
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)"
            }}
          >
            <Trophy size={42} color="#fcd34d" />
          </Avatar>
        </Stack>
      </Paper>

      {results.isLoading && (
        <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress /></Box>
      )}

      {results.data?.length === 0 && (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center", bgcolor: "#fff", borderRadius: "24px" }}>
          <Trophy size={56} color="#d2a84a" style={{ margin: "0 auto 16px" }} />
          <Typography variant="h5" fontWeight={700}>Hozircha e‘lon qilingan natijalar yo‘q</Typography>
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
            <Paper sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: "24px", bgcolor: "#ffffff" }}>
              {/* Task Header */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ sm: "center" }}
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Chip label={a.subject} color="primary" size="small" sx={{ fontWeight: 700 }} />
                    <Chip label={`Maks: ${a.max_score} ball`} variant="outlined" size="small" />
                  </Stack>
                  <Typography variant="h5" fontWeight={800}>{a.title}</Typography>
                </Box>
                <Paper
                  variant="outlined"
                  sx={{
                    px: 2,
                    py: 1,
                    bgcolor: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    borderRadius: "14px"
                  }}
                >
                  <Box textAlign="right">
                    <Typography variant="caption" color="text.secondary" display="block">O‘rtacha ball</Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main">{a.average_score} ball</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "#e0e7ff", color: "primary.main", width: 36, height: 36 }}>
                    <Award size={20} />
                  </Avatar>
                </Paper>
              </Stack>

              {/* Podium for Top 3 */}
              {top3.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 3.5 }}>
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
                            textAlign: "center",
                            boxShadow: idx === 0 ? "0 10px 20px -3px rgba(245, 158, 11, 0.2)" : "none"
                          }}
                        >
                          <Typography variant="caption" fontWeight={800} sx={{ textTransform: "uppercase" }}>
                            {medal}
                          </Typography>
                          <Typography variant="h6" fontWeight={800} noWrap sx={{ mt: 0.5 }}>
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

              {/* Leaderboard Table */}
              <TableContainer sx={{ borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                <Table size="medium">
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: 70 }}>O‘rin</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>O‘quvchi</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Sinfi</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>Natija / Progress</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>O‘qituvchi taqrizi</TableCell>
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
                          <TableCell sx={{ fontWeight: 700 }}>{st.student_name}</TableCell>
                          <TableCell sx={{ color: "text.secondary" }}>{st.student_id}</TableCell>
                          <TableCell>{st.class_name}</TableCell>
                          <TableCell>
                            {hasScore ? (
                              <Box sx={{ width: "100%" }}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                  <Typography variant="body2" fontWeight={800}>{st.score} ball</Typography>
                                  <Typography variant="caption" color="text.secondary">{percentage}%</Typography>
                                </Stack>
                                <LinearProgress
                                  variant="determinate"
                                  value={percentage}
                                  sx={{
                                    height: 7,
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
                              <Paper variant="outlined" sx={{ p: 1, bgcolor: "#f8fafc", borderRadius: "10px" }}>
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
    [msg, setMsg] = useState(""),
    [saving, setSaving] = useState(false);

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
    const known = new Set([...(detail.data?.submission_files || []).map((f: any) => f.name.toLocaleLowerCase()), ...files.map(f => f.name.toLocaleLowerCase())]);
    const fresh = Array.from(next).filter(f => !known.has(f.name.toLocaleLowerCase()));
    setFiles([...files, ...fresh]);
    if (fresh.length < Array.from(next).length) setMsg("Takrorlangan fayl tanlanmadi");
  };

  const submit = async () => {
    if (!selected || saving) return;
    const data = new FormData();
    if (comment.trim()) data.append("comment", comment.trim());
    files.forEach(f => data.append("files", f));
    if (!files.length && !comment.trim()) { setMsg("Izoh yoki kamida bitta fayl kiriting"); return; }
    setSaving(true);
    try {
      await api.post("/assignments/" + selected.assignment_id + "/submissions", data);
      fireConfetti();
      q.refetch();
      setSelected(null);
      setMsg("");
    } catch (e: any) {
      setMsg(e.response?.data?.detail || "Saqlashda xatolik");
    } finally { setSaving(false); }
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
                <Typography variant="caption" color="text.secondary">{uploaded ? "Yuklangan" : "Yuborishga tayyor"}</Typography>
              </Box>
            </Stack>
            {uploaded ? (
              <MuiButton size="small" variant="text" onClick={() => download(f)}>Yuklab olish</MuiButton>
            ) : (
              <MuiButton size="small" color="inherit" onClick={() => setFiles(files.filter(x => x.name !== f.name))}>O‘chirish</MuiButton>
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
              p: 3,
              mb: 4,
              borderRadius: "20px",
              background: "linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)",
              border: "1px solid #e0e7ff"
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="h5" fontWeight={800} color="primary.dark">
                  Mening Topshiriqlarim
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Vazifalarni vaqtida yuboring, ballaringizni tekshiring va natijalar doskasida yuqori o‘rinlarni egallang!
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack direction="row" spacing={2} justifyContent={{ md: "flex-end" }}>
                  <Paper sx={{ px: 2, py: 1, textAlign: "center", borderRadius: "14px", bgcolor: "#fff" }}>
                    <Typography variant="h5" fontWeight={800} color="primary.main">
                      {q.data?.length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Jami vazifa</Typography>
                  </Paper>
                  <Paper sx={{ px: 2, py: 1, textAlign: "center", borderRadius: "14px", bgcolor: "#fff" }}>
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
                    <CardContent sx={{ p: 3 }}>
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

                      <Typography variant="h6" fontWeight={800} sx={{ mt: 2 }}>{a.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: 40 }}>
                        {a.description}
                      </Typography>

                      <Divider sx={{ my: 2.5 }} />

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Calendar size={16} color="#64748b" />
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
          <Dialog open={!!selected} onClose={() => !saving && setSelected(null)} fullWidth maxWidth="md">
            <DialogTitle sx={{ pb: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" fontWeight={800}>{detail.data?.title || "Vazifa tafsilotlari"}</Typography>
                  <Typography variant="caption" color="text.secondary">{detail.data?.subject}</Typography>
                </Box>
                <Chip label={`Maksimal ball: ${detail.data?.max_score || 100}`} color="primary" variant="outlined" />
              </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: "#fafcfa", p: { xs: 2.5, md: 3.5 } }}>
              {detail.isLoading ? (
                <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress /></Box>
              ) : (
                <Stack spacing={3}>
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
                        p: 3,
                        borderRadius: "18px",
                        background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                        border: "1px solid #a7f3d0"
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "#10b981", width: 48, height: 48 }}>
                          <Trophy size={26} color="#ffffff" />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" fontWeight={800} color="#065f46">
                            Sizning natijangiz: {detail.data.score} / {detail.data.max_score} ball
                          </Typography>
                          {detail.data.feedback && (
                            <Typography variant="body2" sx={{ mt: 0.5, color: "#047857" }}>
                              <strong>O‘qituvchi taqrizi:</strong> {detail.data.feedback}
                            </Typography>
                          )}
                          {detail.data.graded_at && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                              Baholandi: {new Date(detail.data.graded_at).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Paper>
                  )}

                  {/* Teacher Attachments */}
                  {detail.data?.attachments?.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                        O‘qituvchi ilova qilgan fayllar
                      </Typography>
                      {fileGrid(detail.data.attachments, true)}
                    </Box>
                  )}

                  {/* Uploaded Files */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                      Siz yuborgan fayllar
                    </Typography>
                    {detail.data?.submission_files?.length ? (
                      fileGrid(detail.data.submission_files, true)
                    ) : (
                      <Paper variant="outlined" sx={{ p: 3, textAlign: "center", color: "text.secondary", borderRadius: "14px" }}>
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
                          Har qanday format qabul qilinadi (maks: 10MB)
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
            <DialogActions sx={{ p: 2.5, justifyContent: "space-between" }}>
              <MuiButton color="inherit" onClick={() => setSelected(null)} disabled={saving}>
                Yopish
              </MuiButton>
              {!detail.data?.locked && !detail.data?.submitted_at && (
                <MuiButton onClick={submit} disabled={saving} startIcon={<Send size={18} />}>
                  {saving ? "Yuborilmoqda..." : "Topshiriqni yuborish"}
                </MuiButton>
              )}
            </DialogActions>
          </Dialog>
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

  const overview = useQuery({
    queryKey: ["class-overview", selectedClass?.id],
    enabled: !!selectedClass,
    queryFn: () => api.get("/admin/classes/" + selectedClass.id + "/overview").then(r => r.data)
  });

  const recipients = useQuery({
    queryKey: ["recipients", selectedAssignment?.id, selectedClass?.id],
    enabled: !!selectedAssignment,
    queryFn: () => api.get("/admin/assignments/" + selectedAssignment.id + "/recipients", {
      params: selectedClass ? { class_id: selectedClass.id } : {}
    }).then(r => r.data)
  });

  const [cname, setCname] = useState(""), [sname, setSname] = useState(""), [notice, setNotice] = useState(""),
    [task, setTask] = useState<any>({
      subject_id: "", title: "", description: "", notes: "", deadline: "",
      target_type: "class", class_id: "", student_id: "", max_score: 100
    });

  const set = (k: string, v: any) => setTask({ ...task, [k]: v }),
    refresh = () => { stats.refetch(); cs.refetch(); subs.refetch(); students.refetch(); };

  const quick = async (e: React.FormEvent, path: string, name: string, reset: () => void) => {
    e.preventDefault();
    try {
      await api.post(path, { name });
      reset(); setNotice("Muvaffaqiyatli yaratildi"); refresh();
    } catch (e: any) { setNotice(e.response?.data?.detail || "Xatolik"); }
  };

  const assign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await api.post("/admin/assignments", {
        ...task,
        max_score: Number(task.max_score) || 100,
        deadline: new Date(task.deadline).toISOString(),
        class_id: task.target_type === "class" ? task.class_id : null,
        student_id: task.target_type === "student" ? task.student_id : null
      });
      fireConfetti();
      setNotice("Vazifa " + r.data.recipients + " ta o‘quvchiga muvaffaqiyatli biriktirildi!");
      refresh();
    } catch (e: any) { setNotice(e.response?.data?.detail || "Vazifa yaratilmadi"); }
  };

  const download = async (f: any) => {
    try {
      const r = await api.get("/files/" + f.id, { responseType: "blob" });
      const url = URL.createObjectURL(r.data), a = document.createElement("a");
      a.href = url; a.download = f.name; a.click(); URL.revokeObjectURL(url);
    } catch { setNotice("Faylni yuklab bo‘lmadi"); }
  };

  const removeAssignment = async () => {
    if (!selectedAssignment || !window.confirm("Bu deadline va barcha topshirishlar o‘chiriladi. Davom etasizmi?")) return;
    try {
      await api.delete("/admin/assignments/" + selectedAssignment.id);
      setSelectedSubmission(null); setSelectedAssignment(null);
      overview.refetch(); cs.refetch(); stats.refetch();
      setNotice("Deadline o‘chirildi");
    } catch (e: any) { setNotice(e.response?.data?.detail || "O‘chirilmadi"); }
  };

  const togglePublish = async () => {
    if (!selectedAssignment) return;
    try {
      const r = await api.post("/admin/assignments/" + selectedAssignment.id + "/publish-results");
      fireConfetti();
      setNotice(r.data.message);
      setSelectedAssignment({ ...selectedAssignment, results_published: r.data.results_published });
      overview.refetch();
    } catch (e: any) { setNotice(e.response?.data?.detail || "Xatolik"); }
  };

  const openGradeDialog = (r: any) => {
    setSelectedSubmission(r);
    setScoreInput(r.score ?? "");
    setFeedbackInput(r.feedback ?? "");
  };

  const saveGrade = async () => {
    if (!selectedSubmission || !selectedSubmission.submission_id) return;
    try {
      await api.post(`/admin/submissions/${selectedSubmission.submission_id}/grade`, {
        score: Number(scoreInput),
        feedback: feedbackInput
      });
      fireConfetti();
      setNotice("Baho muvaffaqiyatli saqlandi!");
      setSelectedSubmission(null);
      recipients.refetch();
      overview.refetch();
    } catch (e: any) {
      setNotice(e.response?.data?.detail || "Bahoni saqlashda xatolik");
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
      subtitle="Sinflar, fanlar, topshiriqlar, baholash va natijalar e‘lon qilish tizimi."
      onLogout={() => { localStorage.clear(); location.reload(); }}
      tab={tab}
      setTab={setTab}
    >
      {tab === "dashboard" ? (
        <DashboardView />
      ) : (
        <>
          {/* Stat Cards */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {statCards.map(s => (
              <Grid size={{ xs: 6, md: 3 }} key={s.key}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: "20px",
                    border: "1px solid #e2e8f0",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-3px)", boxShadow: "0 10px 20px -3px rgba(0,0,0,0.05)" }
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h4" fontWeight={800}>{stats.data?.[s.key] ?? "—"}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 600 }}>
                        {s.label}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: s.bg, color: s.color, width: 48, height: 48 }}>
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
              <Paper sx={{ p: 3, borderRadius: "20px" }}>
                <Typography variant="h6" fontWeight={800}>Tezkor Sozlamalar</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Yangi sinflar va fanlar qo‘shish
                </Typography>

                <Box component="form" onSubmit={e => quick(e, "/admin/classes", cname, () => setCname(""))} sx={{ display: "grid", gap: 1.5, mb: 3 }}>
                  <TextField size="small" label="Yangi sinf nomi" placeholder="Masalan: 10-A" value={cname} onChange={e => setCname(e.target.value)} required />
                  <MuiButton type="submit" variant="outlined" startIcon={<Plus size={16} />}>Sinf qo‘shish</MuiButton>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box component="form" onSubmit={e => quick(e, "/admin/subjects", sname, () => setSname(""))} sx={{ display: "grid", gap: 1.5 }}>
                  <TextField size="small" label="Yangi fan nomi" placeholder="Masalan: Fizika" value={sname} onChange={e => setSname(e.target.value)} required />
                  <MuiButton type="submit" variant="outlined" startIcon={<Plus size={16} />}>Fan qo‘shish</MuiButton>
                </Box>
              </Paper>
            </Grid>

            {/* Task Creation */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: "20px" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <Plus size={22} color="#ffffff" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>Yangi Deadline Vazifa</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Butun sinfga yoki alohida o‘quvchiga topshiriq biriktiring
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
                            <MenuItem key={x.id} value={x.id}>{x.name} — {x.students} o‘quvchi</MenuItem>
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
                  </Grid>

                  <MuiButton type="submit" size="large" sx={{ mt: 1 }}>
                    Vazifani e‘lon qilish
                  </MuiButton>
                </Box>
                {notice && <Alert severity="info" sx={{ mt: 2, borderRadius: "12px" }}>{notice}</Alert>}
              </Paper>
            </Grid>
          </Grid>

          {/* Classes Cards */}
          <Typography variant="h5" fontWeight={800} sx={{ mt: 5, mb: 2.5 }}>Sinflar Holati</Typography>
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
          <Dialog open={!!selectedClass} onClose={() => { setSelectedClass(null); setSelectedAssignment(null); }} fullWidth maxWidth="md">
            <DialogTitle>
              <Typography variant="h5" fontWeight={800}>{selectedClass?.name} — Sinf faoliyati</Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
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

          {/* Assignment Recipients & Grading Modal */}
          <Dialog open={!!selectedAssignment} onClose={() => setSelectedAssignment(null)} fullWidth maxWidth="md">
            <DialogTitle>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
                <Box>
                  <Typography variant="h5" fontWeight={800}>{selectedAssignment?.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Maksimal ball: {selectedAssignment?.max_score || 100}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <MuiButton
                    size="small"
                    color={selectedAssignment?.results_published ? "secondary" : "primary"}
                    startIcon={<Megaphone size={16} />}
                    onClick={togglePublish}
                  >
                    {selectedAssignment?.results_published ? "Natijalarni yashirish" : "Natijalarni e‘lon qilish"}
                  </MuiButton>
                  <MuiButton color="error" size="small" variant="outlined" startIcon={<Trash2 size={16} />} onClick={removeAssignment}>
                    O‘chirish
                  </MuiButton>
                </Stack>
              </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              {recipients.isLoading ? (
                <Box sx={{ py: 4, textAlign: "center" }}><CircularProgress /></Box>
              ) : (
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
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
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
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <MuiButton color="inherit" onClick={() => setSelectedAssignment(null)}>Orqaga</MuiButton>
            </DialogActions>
          </Dialog>

          {/* Grade Submission Dialog */}
          <Dialog open={!!selectedSubmission} onClose={() => setSelectedSubmission(null)} fullWidth maxWidth="sm">
            <DialogTitle>
              <Typography variant="h6" fontWeight={800}>
                {selectedSubmission?.full_name} — Ishni Baholash
              </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Typography variant="caption" color="text.secondary">
                  Talaba ID: {selectedSubmission?.student_code} · Yuborilgan: {selectedSubmission?.submitted_at ? new Date(selectedSubmission.submitted_at).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" }) : "—"}
                </Typography>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: "14px" }}>
                  <Typography variant="subtitle2" color="text.secondary">O‘quvchi izohi:</Typography>
                  <Typography sx={{ mt: 0.5 }}>{selectedSubmission?.comment || "Izoh qoldirilmagan."}</Typography>
                </Paper>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Yuklangan fayllar:</Typography>
                  {selectedSubmission?.files?.length ? selectedSubmission.files.map((f: any) => (
                    <MuiButton key={f.id} variant="outlined" size="small" sx={{ mr: 1, mb: 1 }} onClick={() => download(f)}>
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
              <MuiButton color="inherit" onClick={() => setSelectedSubmission(null)}>Yopish</MuiButton>
              <MuiButton onClick={saveGrade} startIcon={<Trophy size={16} />}>Bahoni saqlash</MuiButton>
            </DialogActions>
          </Dialog>
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
