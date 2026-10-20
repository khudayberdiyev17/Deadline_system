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
  TableContainer, TableHead, TableRow, Tabs, Tab
} from "@mui/material";
import {
  Assignment, School, Logout, AddTask, Lock, CheckCircle, Schedule, People,
  Class, MenuBook, ArrowBack, UploadFile, EmojiEvents, Leaderboard, Campaign
} from "@mui/icons-material";
import { Button } from "./components/ui/button";
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
    primary: { main: "#126c4e" },
    secondary: { main: "#d2a84a" },
    background: { default: "#f5f7f8" }
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "Inter,system-ui,sans-serif",
    h4: { fontWeight: 800 }
  },
  components: {
    MuiButton: {
      defaultProps: { variant: "contained", disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, textTransform: "none", fontWeight: 700, minHeight: 43 }
      }
    }
  }
});

type User = { role: string; full_name: string; student_id?: string; class_name?: string };

function Shell({
  children, title, subtitle, onLogout, tab, setTab
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onLogout?: () => void;
  tab?: string;
  setTab?: (t: string) => void;
}) {
  return (
    <>
      <AppBar position="sticky" elevation={0} color="inherit">
        <Toolbar sx={{ borderBottom: "1px solid #e7ecef" }}>
          <Stack direction="row" alignItems="center" spacing={1.3} sx={{ flexGrow: 1 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 34, height: 34 }}>
              <School fontSize="small" />
            </Avatar>
            <Typography fontWeight={800}>NIS Vazifalar</Typography>
          </Stack>
          {setTab && (
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mr: 2 }}>
              <Tab value="main" label="Vazifalar" icon={<Assignment fontSize="small" />} iconPosition="start" />
              <Tab value="dashboard" label="Natijalar Dashboardi" icon={<Leaderboard fontSize="small" />} iconPosition="start" />
            </Tabs>
          )}
          {onLogout && (
            <MuiButton color="inherit" startIcon={<Logout />} onClick={onLogout}>
              Chiqish
            </MuiButton>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h4">{title}</Typography>
        {subtitle && <Typography color="text.secondary" sx={{ mt: 0.8, mb: 3 }}>{subtitle}</Typography>}
        {children}
      </Container>
    </>
  );
}

function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [i, setI] = useState(""), [p, setP] = useState(""), [err, setErr] = useState("");
  const nav = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await api.post("/auth/login", { identity: i, password: p });
      localStorage.setItem("token", r.data.access_token);
      onLogin(r.data.user);
      nav("/");
    } catch (e: any) {
      setErr(e.response?.data?.detail || "Kirish amalga oshmadi");
    }
  };
  return (
    <Box className="auth-background">
      <Paper className="auth-paper" elevation={0}>
        <Avatar sx={{ bgcolor: "primary.main", width: 52, height: 52, mb: 2 }}><School /></Avatar>
        <Typography variant="h4">Xush kelibsiz</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>O‘quvchi ID yoki administrator hisobi bilan kiring.</Typography>
        <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2.1, mt: 4 }}>
          <TextField required label="O‘quvchi ID yoki login" placeholder="nis@123 yoki cybertron" value={i} onChange={e => setI(e.target.value)} />
          <TextField required label="Parol" type="password" value={p} onChange={e => setP(e.target.value)} />
          {err && <Alert severity="error">{err}</Alert>}
          <MuiButton type="submit" size="large">Kirish</MuiButton>
        </Box>
        <Divider sx={{ my: 3 }}>yoki</Divider>
        <Button variant="ghost" className="full-width" onClick={() => nav("/register")}>O‘quvchi sifatida ro‘yxatdan o‘tish</Button>
      </Paper>
    </Box>
  );
}

function Register() {
  const [cs, setCs] = useState<any[]>([]), [f, setF] = useState<any>({ full_name: "", class_id: "", password: "", confirm: "" }), [msg, setMsg] = useState(""), [ok, setOk] = useState(false);
  const nav = useNavigate();
  useEffect(() => { api.get("/classes/public").then(r => setCs(r.data)); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.password !== f.confirm) return setMsg("Parollar bir xil emas");
    try {
      const r = await api.post("/auth/register", f);
      setOk(true);
      setMsg("Sizning ID: " + r.data.student_id + ". Uni saqlang — 3 soniyada kirish sahifasiga o‘tasiz.");
      setTimeout(() => nav("/login"), 3000);
    } catch (e: any) {
      setOk(false);
      setMsg(e.response?.data?.detail || "Ro‘yxatdan o‘tish amalga oshmadi");
    }
  };
  return (
    <Box className="auth-background">
      <Paper className="auth-paper" elevation={0}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: "secondary.main" }}><People /></Avatar>
          <Box><Typography variant="h5">Ro‘yxatdan o‘tish</Typography><Typography variant="body2" color="text.secondary">Ma’lumotlarni kiriting</Typography></Box>
        </Stack>
        <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2, mt: 3 }}>
          <TextField required label="F.I.Sh." value={f.full_name} onChange={e => setF({ ...f, full_name: e.target.value })} />
          <TextField required select label="Sinfi" value={f.class_id} onChange={e => setF({ ...f, class_id: e.target.value })}>
            <MenuItem value="">Sinfi tanlang</MenuItem>
            {cs.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField required label="Parol" type="password" helperText="Kamida 8 ta belgi" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
          <TextField required label="Parolni tasdiqlang" type="password" value={f.confirm} onChange={e => setF({ ...f, confirm: e.target.value })} />
          {msg && <Alert severity={ok ? "success" : "error"}>{msg}</Alert>}
          <MuiButton type="submit" disabled={ok}>Hisob yaratish</MuiButton>
        </Box>
        <Button variant="ghost" className="full-width" onClick={() => nav("/login")}><ArrowBack fontSize="small" /> Kirish sahifasiga qaytish</Button>
      </Paper>
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
  if (!s) return <>Muddat tugadi</>;
  return <>{Math.floor(s / 86400) ? Math.floor(s / 86400) + " kun " : ""}{String(Math.floor(s % 86400 / 3600)).padStart(2, "0")}:{String(Math.floor(s % 3600 / 60)).padStart(2, "0")} qoldi</>;
}

function DashboardView() {
  const results = useQuery({
    queryKey: ["dashboard-results"],
    queryFn: () => api.get("/dashboard/results").then(r => r.data)
  });

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, bgcolor: "#f0f7f3", border: "1px solid #c9e5d4" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: "primary.main" }}><Campaign /></Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800}>E‘lon qilingan natijalar va Reyting</Typography>
            <Typography variant="body2" color="text.secondary">
              O‘qituvchi tomonidan baholanib e‘lon qilingan barcha deadline topshiriqlari natijalari.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {results.isLoading && <Box sx={{ py: 4, textAlign: "center" }}><CircularProgress /></Box>}

      {results.data?.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
          <EmojiEvents sx={{ fontSize: 48, color: "#d2a84a", mb: 1 }} />
          <Typography variant="h6">Hozircha e‘lon qilingan natijalar yo‘q</Typography>
          <Typography variant="body2">O‘qituvchi topshiriqlarni baholab, natijalarni e‘lon qilgach bu yerda ko‘rinadi.</Typography>
        </Paper>
      )}

      {results.data?.map((a: any) => (
        <Paper key={a.assignment_id} variant="outlined" sx={{ p: 2.5 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1} sx={{ mb: 2 }}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={a.subject} color="primary" size="small" />
                <Typography variant="h6" fontWeight={700}>{a.title}</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Maksimal ball: {a.max_score} · O‘rtacha ball: {a.average_score} · Baholangan: {a.graded_count}/{a.total_students}
              </Typography>
            </Box>
            <Chip icon={<EmojiEvents />} label={`O‘rtacha: ${a.average_score} / ${a.max_score}`} color="secondary" />
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 60 }}># O‘rin</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>O‘quvchi</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Sinfi</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Baho / Ball</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>O‘qituvchi fikri</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {a.students.map((st: any, idx: number) => {
                  const hasScore = st.score !== null && st.score !== undefined;
                  const rankBadge = idx === 0 ? "🥇 1" : idx === 1 ? "🥈 2" : idx === 2 ? "🥉 3" : String(idx + 1);
                  return (
                    <TableRow key={st.student_id + idx} hover sx={{ bgcolor: idx < 3 && hasScore ? "#fdfbf5" : "inherit" }}>
                      <TableCell sx={{ fontWeight: idx < 3 ? 800 : 500 }}>{rankBadge}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{st.student_name}</TableCell>
                      <TableCell>{st.student_id}</TableCell>
                      <TableCell>{st.class_name}</TableCell>
                      <TableCell align="center">
                        {hasScore ? (
                          <Chip
                            size="small"
                            label={`${st.score} / ${a.max_score}`}
                            color={st.score >= a.max_score * 0.8 ? "success" : st.score >= a.max_score * 0.6 ? "primary" : "warning"}
                            sx={{ fontWeight: 700 }}
                          />
                        ) : st.submitted ? (
                          <Chip size="small" label="Tekshirilmoqda" variant="outlined" />
                        ) : (
                          <Chip size="small" label="Topshirmagan" color="error" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                        {st.feedback || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}
    </Stack>
  );
}

function Student({ user }: { user: User }) {
  const [tab, setTab] = useState("main");
  const q = useQuery({ queryKey: ["assignments"], queryFn: () => api.get("/student/assignments").then(r => r.data) });
  const [selected, setSelected] = useState<any>(null), [comment, setComment] = useState(""), [files, setFiles] = useState<File[]>([]), [msg, setMsg] = useState(""), [saving, setSaving] = useState(false);
  const detail = useQuery({ queryKey: ["assignment", selected?.assignment_id], enabled: !!selected, queryFn: () => api.get("/assignments/" + selected.assignment_id).then(r => r.data) });

  useEffect(() => { if (detail.data) { setComment(detail.data.comment || ""); setFiles([]); } }, [detail.data?.id]);

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
      q.refetch(); setSelected(null); setMsg("");
    } catch (e: any) {
      setMsg(e.response?.data?.detail || "Saqlashda xatolik");
    } finally { setSaving(false); }
  };

  const fileGrid = (items: any[], uploaded: boolean) => (
    <Grid container spacing={1.2}>
      {items.map((f: any) => (
        <Grid key={uploaded ? f.id : f.name} size={{ xs: 12, sm: 6 }}>
          <Paper variant="outlined" sx={{ p: 1.25, height: "100%", bgcolor: uploaded ? "#f3faf6" : "#fffaf0" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar variant="rounded" sx={{ width: 34, height: 34, bgcolor: uploaded ? "#dff2e7" : "#fff0ca", color: uploaded ? "success.main" : "#a66e00" }}>
                <UploadFile fontSize="small" />
              </Avatar>
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography variant="body2" fontWeight={700} noWrap title={f.name}>{f.name}</Typography>
                <Typography variant="caption" color="text.secondary">{uploaded ? "Yuklangan" : "Saqlashga tayyor"}</Typography>
              </Box>
              {uploaded ? <MuiButton size="small" variant="text" onClick={() => download(f)}>Yuklash</MuiButton> : <MuiButton size="small" color="inherit" onClick={() => setFiles(files.filter(x => x.name !== f.name))}>Olib tashlash</MuiButton>}
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Shell
      title={"Assalomu alaykum, " + user.full_name}
      subtitle={(user.student_id || "") + " · " + (user.class_name || "")}
      onLogout={() => { localStorage.clear(); location.reload(); }}
      tab={tab}
      setTab={setTab}
    >
      {tab === "dashboard" ? (
        <DashboardView />
      ) : (
        <>
          <Grid container spacing={2.5}>
            {q.isLoading && <CircularProgress />}
            {q.data?.map((a: any) => {
              const isGraded = a.status === "graded";
              const sent = a.status === "submitted" || isGraded;
              const locked = a.status === "locked";
              return (
                <Grid size={{ xs: 12, md: 6 }} key={a.assignment_id}>
                  <Card
                    onClick={() => { setSelected(a); setComment(""); setFiles([]); setMsg(""); }}
                    sx={{
                      height: "100%", cursor: "pointer",
                      "&:hover": { transform: "translateY(-3px)", boxShadow: 5 },
                      borderLeft: "5px solid " + (isGraded ? "#126c4e" : sent ? "#2e9b5f" : locked ? "#718096" : "#d2a84a")
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Chip label={a.subject} color="primary" size="small" />
                        {isGraded ? (
                          <Chip icon={<EmojiEvents />} label={`Baho: ${a.score}/${a.max_score}`} color="success" size="small" />
                        ) : sent ? (
                          <Chip icon={<CheckCircle />} label="Topshirilgan" color="success" size="small" />
                        ) : locked ? (
                          <Chip icon={<Lock />} label="Yopilgan" size="small" />
                        ) : (
                          <Chip icon={<Schedule />} label="Kutilmoqda" color="warning" size="small" />
                        )}
                      </Stack>
                      <Typography variant="h6" sx={{ mt: 2 }}>{a.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: 40 }}>{a.description}</Typography>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={700}>
                          {isGraded ? "Baholandi" : sent ? "Vaqtida yuborildi" : locked ? "Yopilgan — muddat tugagan" : <Countdown deadline={a.deadline} />}
                        </Typography>
                        {a.results_published && (
                          <Chip label="Natijalar e‘lon qilindi" size="small" color="secondary" variant="outlined" />
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Dialog open={!!selected} onClose={() => !saving && setSelected(null)} fullWidth maxWidth="md">
            <DialogTitle>{detail.data?.title || "Vazifa tafsilotlari"}</DialogTitle>
            <DialogContent dividers sx={{ bgcolor: "#fafcfa" }}>
              {detail.isLoading ? (
                <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress /></Box>
              ) : (
                <Stack spacing={2.5}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Chip label={detail.data?.subject || ""} color="primary" size="small" />
                      <Typography sx={{ mt: 1.5 }}>{detail.data?.description}</Typography>
                    </Box>
                    <Paper variant="outlined" sx={{ p: 1.5, minWidth: 220 }}>
                      <Typography fontWeight={800}>Deadline & Maksimal ball</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {detail.data?.deadline ? new Date(detail.data.deadline).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" }) : ""}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                        Maksimal ball: {detail.data?.max_score || 100}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.75, color: detail.data?.locked ? "error.main" : "success.main", fontWeight: 700 }}>
                        {detail.data?.locked ? "Muddat tugagan" : "Topshirish uchun vaqt bor"}
                      </Typography>
                    </Paper>
                  </Stack>

                  {detail.data?.score !== null && detail.data?.score !== undefined && (
                    <Paper sx={{ p: 2, bgcolor: "#eaf6ee", border: "1px solid #9ad2b0" }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: "success.main" }}><EmojiEvents /></Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={800} color="success.main">
                            Sizning natijangiz: {detail.data.score} / {detail.data.max_score} ball
                          </Typography>
                          {detail.data.feedback && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              <strong>O‘qituvchi taqrizi:</strong> {detail.data.feedback}
                            </Typography>
                          )}
                          {detail.data.graded_at && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                              Baholangan vaqt: {new Date(detail.data.graded_at).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Paper>
                  )}

                  {detail.data?.notes && <Alert severity="info">{detail.data.notes}</Alert>}

                  {detail.data?.attachments?.length > 0 && (
                    <Box>
                      <Typography fontWeight={800} sx={{ mb: 1 }}>O‘qituvchi biriktirgan fayllar</Typography>
                      {fileGrid(detail.data.attachments, true)}
                    </Box>
                  )}

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography fontWeight={800}>Siz yuklagan fayllar</Typography>
                      {detail.data?.submission_files?.length > 0 && (
                        <Chip color="success" size="small" label={detail.data.submission_files.length + " ta fayl"} icon={<CheckCircle />} />
                      )}
                    </Stack>
                    {detail.data?.submission_files?.length ? fileGrid(detail.data.submission_files, true) : (
                      <Paper variant="outlined" sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>Hali fayl yuklanmagan.</Paper>
                    )}
                  </Box>

                  {!detail.data?.locked && !detail.data?.submitted_at && (
                    <>
                      <Box>
                        <Typography fontWeight={800} sx={{ mb: 1 }}>Yangi fayllar</Typography>
                        <MuiButton component="label" variant="outlined" fullWidth startIcon={<UploadFile />} sx={{ height: 52, borderStyle: "dashed" }}>
                          Fayllarni tanlash
                          <input hidden multiple type="file" onChange={e => { addFiles(e.target.files); e.currentTarget.value = ""; }} />
                        </MuiButton>
                        <Typography variant="caption" color="text.secondary">Barcha fayl turlari qabul qilinadi. Har bir fayl hajmi cheklovi qo‘llanadi.</Typography>
                        {files.length > 0 && <Box sx={{ mt: 1.25 }}>{fileGrid(files, false)}</Box>}
                      </Box>
                      <TextField multiline minRows={3} label="Izoh (ixtiyoriy)" value={comment} onChange={e => setComment(e.target.value)} placeholder="O‘qituvchiga izoh qoldiring" />
                      {msg && <Alert severity={msg.includes("tayyor") ? "warning" : "error"}>{msg}</Alert>}
                    </>
                  )}

                  {detail.data?.submitted_at && (
                    <Alert severity="success">Vazifa yuborilgan. Yuklangan fayllarni yuqoridan yuklab olishingiz mumkin.</Alert>
                  )}
                </Stack>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
              <MuiButton color="inherit" onClick={() => setSelected(null)} disabled={saving}>Yopish</MuiButton>
              {!detail.data?.locked && !detail.data?.submitted_at && (
                <MuiButton onClick={submit} disabled={saving} startIcon={<CheckCircle />}>{saving ? "Saqlanmoqda..." : "Saqlash va yopish"}</MuiButton>
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
      setNotice("Vazifa " + r.data.recipients + " o‘quvchiga biriktirildi");
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
    if (!selectedAssignment || !window.confirm("Bu deadline va unga bog‘liq barcha topshirishlar o‘chiriladi. Davom etasizmi?")) return;
    try {
      await api.delete("/admin/assignments/" + selectedAssignment.id);
      setSelectedSubmission(null); setSelectedAssignment(null);
      overview.refetch(); cs.refetch(); stats.refetch();
      setNotice("Deadline o‘chirildi");
    } catch (e: any) { setNotice(e.response?.data?.detail || "Deadline o‘chirilmadi"); }
  };

  const togglePublish = async () => {
    if (!selectedAssignment) return;
    try {
      const r = await api.post("/admin/assignments/" + selectedAssignment.id + "/publish-results");
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
      setNotice("Baho muvaffaqiyatli saqlandi");
      setSelectedSubmission(null);
      recipients.refetch();
      overview.refetch();
    } catch (e: any) {
      setNotice(e.response?.data?.detail || "Bahoni saqlashda xatolik");
    }
  };

  const data = [
    ["active_students", "Faol o‘quvchilar", <People />],
    ["classes", "Sinflar", <Class />],
    ["assignments", "Vazifalar", <Assignment />],
    ["submitted", "Yuborilgan", <CheckCircle />]
  ];

  const assignmentGroup = (title: string, items: any[], empty: string) => (
    <Box sx={{ mt: 2 }}>
      <Typography fontWeight={800} sx={{ mb: 1 }}>{title}</Typography>
      {items.length ? items.map((a: any) => (
        <Card key={a.id} variant="outlined" onClick={() => setSelectedAssignment(a)} sx={{ mb: 1, cursor: "pointer" }}>
          <CardContent sx={{ py: "12px !important" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography fontWeight={700}>{a.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {a.subject} · {new Date(a.deadline).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                {a.results_published && <Chip label="E‘lon qilingan" size="small" color="secondary" />}
                <Chip label={a.submitted_count + "/" + a.recipient_count} color={a.state === "completed" ? "default" : "primary"} size="small" />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )) : <Typography variant="body2" color="text.secondary">{empty}</Typography>}
    </Box>
  );

  return (
    <Shell
      title="Boshqaruv markazi"
      subtitle="Sinf, fan, deadline topshiriqlari, baholash va e‘lon qilish tizimi."
      onLogout={() => { localStorage.clear(); location.reload(); }}
      tab={tab}
      setTab={setTab}
    >
      {tab === "dashboard" ? (
        <DashboardView />
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {data.map((x: any) => (
              <Grid size={{ xs: 6, md: 3 }} key={x[0]}>
                <Card>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4">{stats.data?.[x[0]] ?? "—"}</Typography>
                        <Typography variant="body2" color="text.secondary">{x[1]}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: "#e5f3ec", color: "primary.main" }}>{x[2]}</Avatar>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6">Tezkor sozlamalar</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Avval sinf va fan yarating.</Typography>
                <Box component="form" onSubmit={e => quick(e, "/admin/classes", cname, () => setCname(""))} sx={{ display: "grid", gap: 1.2, mb: 2 }}>
                  <TextField required size="small" label="Yangi sinf" value={cname} onChange={e => setCname(e.target.value)} />
                  <MuiButton type="submit" variant="outlined" startIcon={<Class />}>Sinf yaratish</MuiButton>
                </Box>
                <Box component="form" onSubmit={e => quick(e, "/admin/subjects", sname, () => setSname(""))} sx={{ display: "grid", gap: 1.2 }}>
                  <TextField required size="small" label="Yangi fan" value={sname} onChange={e => setSname(e.target.value)} />
                  <MuiButton type="submit" variant="outlined" startIcon={<MenuBook />}>Fan yaratish</MuiButton>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main" }}><AddTask /></Avatar>
                  <Box>
                    <Typography variant="h6">Deadline vazifa berish</Typography>
                    <Typography variant="body2" color="text.secondary">Butun sinfga yoki bitta o‘quvchiga biriktiring.</Typography>
                  </Box>
                </Stack>
                <Box component="form" onSubmit={assign} sx={{ display: "grid", gap: 2, mt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField required select fullWidth label="Fan" value={task.subject_id} onChange={e => set("subject_id", e.target.value)}>
                        <MenuItem value="">Fanni tanlang</MenuItem>
                        {subs.data?.filter((x: any) => x.active).map((x: any) => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField required fullWidth type="datetime-local" label="Deadline (Toshkent vaqti)" InputLabelProps={{ shrink: true }} value={task.deadline} onChange={e => set("deadline", e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TextField required fullWidth label="Vazifa sarlavhasi" value={task.title} onChange={e => set("title", e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField required fullWidth type="number" label="Maksimal ball" value={task.max_score} onChange={e => set("max_score", e.target.value)} />
                    </Grid>
                    <Grid size={12}>
                      <TextField required fullWidth multiline minRows={3} label="Yo‘riqnoma" value={task.description} onChange={e => set("description", e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <TextField select fullWidth label="Kimga beriladi?" value={task.target_type} onChange={e => set("target_type", e.target.value)}>
                        <MenuItem value="class">Butun sinf</MenuItem>
                        <MenuItem value="student">Bitta o‘quvchi</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 7 }}>
                      {task.target_type === "class" ? (
                        <TextField required select fullWidth label="Sinf" value={task.class_id} onChange={e => set("class_id", e.target.value)}>
                          <MenuItem value="">Sinfni tanlang</MenuItem>
                          {cs.data?.filter((x: any) => x.active).map((x: any) => <MenuItem key={x.id} value={x.id}>{x.name} — {x.students} o‘quvchi</MenuItem>)}
                        </TextField>
                      ) : (
                        <TextField required select fullWidth label="O‘quvchi" value={task.student_id} onChange={e => set("student_id", e.target.value)}>
                          <MenuItem value="">O‘quvchini tanlang</MenuItem>
                          {students.data?.filter((x: any) => x.active).map((x: any) => <MenuItem key={x.id} value={x.id}>{x.full_name} ({x.student_id})</MenuItem>)}
                        </TextField>
                      )}
                    </Grid>
                  </Grid>
                  <MuiButton type="submit" startIcon={<AddTask />}>Vazifani biriktirish</MuiButton>
                </Box>
                {notice && <Alert severity="info" sx={{ mt: 2 }}>{notice}</Alert>}
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>Sinflar</Typography>
          <Grid container spacing={2}>
            {cs.data?.map((c: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={c.id}>
                <Card onClick={() => setSelectedClass(c)} sx={{ cursor: "pointer", "&:hover": { transform: "translateY(-3px)", boxShadow: 5 } }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between">
                      <Avatar sx={{ bgcolor: "#eaf3ef", color: "primary.main" }}><Class /></Avatar>
                      <Chip label={c.active ? "Faol" : "Nofaol"} color={c.active ? "success" : "default"} size="small" />
                    </Stack>
                    <Typography variant="h6" sx={{ mt: 2 }}>{c.name}</Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">{c.students} faol o‘quvchi</Typography>
                      <Chip icon={<Assignment />} label={c.task_count || 0} size="small" color="primary" variant="outlined" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Sinf holati modali */}
          <Dialog open={!!selectedClass} onClose={() => { setSelectedClass(null); setSelectedAssignment(null); }} fullWidth maxWidth="md">
            <DialogTitle>{selectedClass?.name} — sinf holati</DialogTitle>
            <DialogContent dividers>
              {overview.isLoading ? (
                <Box sx={{ py: 4, textAlign: "center" }}><CircularProgress /></Box>
              ) : (
                <>
                  <Typography variant="h6">O‘quvchilar</Typography>
                  <Grid container spacing={1.2} sx={{ mt: 0.5 }}>
                    {overview.data?.students?.map((s: any) => {
                      const color = s.state === "submitted" ? "success.main" : s.state === "overdue" ? "error.main" : "#94a3b8";
                      const label = s.state === "submitted" ? "Topshirgan" : s.state === "overdue" ? "Topshirmagan — muddat tugagan" : "Jarayonda";
                      return (
                        <Grid key={s.id} size={{ xs: 12, sm: 6 }}>
                          <Paper variant="outlined" sx={{ p: 1.5, borderLeft: "5px solid " + color }}>
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
                  {assignmentGroup("Jarayonda", overview.data?.assignments?.filter((a: any) => a.state === "in_progress") || [], "Hozir faol deadline yo‘q.")}
                  {assignmentGroup("Tugallangan", overview.data?.assignments?.filter((a: any) => a.state === "completed") || [], "Tugallangan deadline yo‘q.")}
                </>
              )}
            </DialogContent>
            <DialogActions><MuiButton color="inherit" onClick={() => setSelectedClass(null)}>Yopish</MuiButton></DialogActions>
          </Dialog>

          {/* Vazifaning qabul qiluvchilari va baholash modali */}
          <Dialog open={!!selectedAssignment} onClose={() => setSelectedAssignment(null)} fullWidth maxWidth="md">
            <DialogTitle>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
                <Box>
                  <Typography variant="h6">{selectedAssignment?.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Maksimal ball: {selectedAssignment?.max_score || 100}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <MuiButton
                    size="small"
                    color={selectedAssignment?.results_published ? "secondary" : "primary"}
                    startIcon={<Campaign />}
                    onClick={togglePublish}
                  >
                    {selectedAssignment?.results_published ? "Natijalarni yashirish" : "Natijalarni e‘lon qilish"}
                  </MuiButton>
                  <MuiButton color="error" size="small" variant="outlined" onClick={removeAssignment}>
                    O‘chirish
                  </MuiButton>
                </Stack>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              {recipients.isLoading ? (
                <Box sx={{ py: 4, textAlign: "center" }}><CircularProgress /></Box>
              ) : (
                <Stack spacing={1.2}>
                  {recipients.data?.map((r: any) => {
                    const isGraded = r.status === "graded";
                    const isSubmitted = r.status === "submitted" || isGraded;
                    return (
                      <Paper key={r.student_id} variant="outlined" sx={{ p: 1.5, borderLeft: "5px solid " + (isGraded ? "#126c4e" : isSubmitted ? "#2e9b5f" : "#d14343") }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                          <Box>
                            <Typography fontWeight={700}>{r.full_name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {r.student_code} · {isGraded ? `Baholandi: ${r.score}/${r.max_score}` : isSubmitted ? "Topshirgan (Baholanmagan)" : "Topshirmagan"}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {isGraded && (
                              <Chip label={`Ball: ${r.score}/${r.max_score}`} color="success" size="small" />
                            )}
                            {isSubmitted ? (
                              <MuiButton size="small" onClick={() => openGradeDialog(r)}>
                                {isGraded ? "Bahoni ko‘rish / Tahrirlash" : "Baholash"}
                              </MuiButton>
                            ) : (
                              <Chip label="Topshirmagan" color="error" size="small" />
                            )}
                          </Stack>
                        </Stack>
                      </Paper>
                    );
                  })}
                  {!recipients.data?.length && <Typography color="text.secondary">Bu deadline uchun o‘quvchi topilmadi.</Typography>}
                </Stack>
              )}
            </DialogContent>
            <DialogActions><MuiButton color="inherit" onClick={() => setSelectedAssignment(null)}>Orqaga</MuiButton></DialogActions>
          </Dialog>

          {/* Topshirilgan ishni ko'rish va Baholash dialogi */}
          <Dialog open={!!selectedSubmission} onClose={() => setSelectedSubmission(null)} fullWidth maxWidth="sm">
            <DialogTitle>{selectedSubmission?.full_name} — topshirilgan ish va baholash</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2.5}>
                <Typography variant="body2" color="text.secondary">
                  Talaba ID: {selectedSubmission?.student_code} · Yuborilgan: {selectedSubmission?.submitted_at ? new Date(selectedSubmission.submitted_at).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" }) : "—"}
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography fontWeight={700}>O‘quvchi izohi</Typography>
                  <Typography sx={{ mt: 0.5 }}>{selectedSubmission?.comment || "Izoh qoldirilmagan."}</Typography>
                </Paper>
                <Box>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>Yuklangan fayllar</Typography>
                  {selectedSubmission?.files?.length ? selectedSubmission.files.map((f: any) => (
                    <MuiButton key={f.id} variant="outlined" sx={{ mr: 1, mb: 1 }} onClick={() => download(f)}>
                      {f.name}
                    </MuiButton>
                  )) : <Typography color="text.secondary">Fayl yuklanmagan.</Typography>}
                </Box>

                <Divider />

                <Paper sx={{ p: 2, bgcolor: "#f8faf9", border: "1px solid #dbeae2" }}>
                  <Typography variant="subtitle1" fontWeight={800} color="primary.main" sx={{ mb: 1.5 }}>
                    Topshiriqni baholash
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      required
                      type="number"
                      label={`Ball (0 dan ${selectedSubmission?.max_score || 100} gacha)`}
                      value={scoreInput}
                      onChange={e => setScoreInput(e.target.value)}
                      placeholder="Masalan: 95"
                    />
                    <TextField
                      multiline
                      minRows={3}
                      label="O‘qituvchi fikri / Taqriz (Feedback)"
                      value={feedbackInput}
                      onChange={e => setFeedbackInput(e.target.value)}
                      placeholder="Vazifa bo‘yicha izoh yoki tavsiyalar yozing..."
                    />
                  </Stack>
                </Paper>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
              <MuiButton color="inherit" onClick={() => setSelectedSubmission(null)}>Yopish</MuiButton>
              <MuiButton onClick={saveGrade} startIcon={<EmojiEvents />}>Bahoni saqlash</MuiButton>
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
