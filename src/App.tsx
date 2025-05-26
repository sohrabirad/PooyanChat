import React, { useState, useEffect, useRef, createContext, useContext, ReactNode } from "react";
import {
  CssBaseline,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  FormControlLabel,
  Switch,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ReactMarkdown from "react-markdown";

// فونت وازیر را در index.html اضافه کنید:
// <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css" rel="stylesheet" />

interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  model: string;
  setModel: React.Dispatch<React.SetStateAction<string>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  alignmentMode: "center" | "side";
  setAlignmentMode: React.Dispatch<React.SetStateAction<"center" | "side">>;
  addMessage: (role: Message["role"], content: string) => void;
  clearChat: () => void;
  totalInputTokens: number;
  totalOutputTokens: number;
  displayedAnswer: string;
  setDisplayedAnswer: React.Dispatch<React.SetStateAction<string>>;
  typing: boolean;
  setTyping: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const MODELS = [
  "whisper-1",
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1-nano",
  "gpt-4.1-mini",
  "gpt-4.1",
  "o3-mini-high",
  "gpt-4o-audio-preview",
  "o3-mini",
  "o3",
  "o3-mini-low",
  "o1",
  "o1-mini",
  "o4-mini",
  "gpt-4.5-preview",
  "chatgpt-4o-latest",
  "gemini-2.5-flash-preview-04-17",
  "gemini-2.5-pro-exp-03-25",
  "gemini-2.0-flash-lite-preview",
  "gemini-2.0-flash",
  "deepseek-reasoner",
  "deepseek-chat",
  "claude-3-7-sonnet-20250219-thinking",
  "claude-3-5-sonnet-20241022",
  "claude-3-7-sonnet-20250219",
];

const countTokens = (text: string) => Math.ceil(text.length / 4);

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#007bff" },
    background: { default: "#f5f7fa", paper: "#fff" },
  },
  typography: { fontFamily: "'Vazir', sans-serif" },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3399ff" },
    background: { default: "#121212", paper: "#1e1e1e" },
  },
  typography: { fontFamily: "'Vazir', sans-serif" },
});

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("chatMessages");
    return saved ? JSON.parse(saved) : [];
  });
  const [model, setModel] = useState("gpt-4o-mini");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });
  const [alignmentMode, setAlignmentMode] = useState<"center" | "side">(() => {
    const saved = localStorage.getItem("alignmentMode");
    return saved === "center" ? "center" : "side"; // پیش‌فرض روی کناره‌ها
  });
  const [totalInputTokens, setTotalInputTokens] = useState(0);
  const [totalOutputTokens, setTotalOutputTokens] = useState(0);
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("alignmentMode", alignmentMode);
  }, [alignmentMode]);

  const addMessage = (role: Message["role"], content: string) => {
    setMessages((prev) => {
      const newMessages = [...prev, { role, content, id: Date.now() }];
      if (newMessages.length > 50) {
        return newMessages.slice(newMessages.length - 50);
      }
      return newMessages;
    });

    if (role === "user") {
      setTotalInputTokens((t) => t + countTokens(content));
    } else if (role === "assistant") {
      setTotalOutputTokens((t) => t + countTokens(content));
    }
  };

  const clearChat = () => {
    setMessages([]);
    setTotalInputTokens(0);
    setTotalOutputTokens(0);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        model,
        setModel,
        input,
        setInput,
        loading,
        setLoading,
        error,
        setError,
        darkMode,
        setDarkMode,
        alignmentMode,
        setAlignmentMode,
        addMessage,
        clearChat,
        totalInputTokens,
        totalOutputTokens,
        displayedAnswer,
        setDisplayedAnswer,
        typing,
        setTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat باید داخل ChatProvider استفاده شود.");
  return context;
}

export function Header() {
  const {
    model,
    setModel,
    darkMode,
    setDarkMode,
    clearChat,
    alignmentMode,
    setAlignmentMode,
  } = useChat();

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAlignmentMode(event.target.checked ? "center" : "side");
  };

  return (
    <AppBar position="sticky" color="primary" enableColorOnDark>
      <Toolbar
        sx={{
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1, minWidth: 150 }}>
          دستیار هوش مصنوعی پویان (ورژن 1.3)
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel id="model-select-label">انتخاب مدل</InputLabel>
            <Select
              labelId="model-select-label"
              value={model}
              label="انتخاب مدل"
              onChange={(e) => setModel(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              {MODELS.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* سوئیچ حالت روشن/خاموش */}
<FormControlLabel
  control={
    <Switch
      checked={darkMode}
      onChange={() => setDarkMode(!darkMode)}
      sx={{
        // برگشت به رنگ‌های پیش‌فرض Material-UI برای سوئیچ‌ها
        "& .MuiSwitch-thumb": {
          backgroundColor: darkMode ? undefined : undefined, // پیش‌فرض رنگ دکمه
        },
        "& .MuiSwitch-track": {
          backgroundColor: darkMode ? undefined : undefined, // پیش‌فرض رنگ پس‌زمینه
        },
      }}
    />
  }
  label={darkMode ? "حالت تاریک" : "حالت روشن"}
  sx={{
    color: "text.primary", // رنگ پیش‌فرض برای لیبل
    userSelect: "none",
  }}
/>

<FormControlLabel
  control={
    <Switch
      checked={alignmentMode === "center"}
      onChange={handleToggle}
      sx={{
        // برگشت به رنگ‌های پیش‌فرض Material-UI برای سوئیچ‌ها
        "& .MuiSwitch-thumb": {
          backgroundColor: alignmentMode === "center" ? undefined : undefined, // پیش‌فرض رنگ دکمه
        },
        "& .MuiSwitch-track": {
          backgroundColor: alignmentMode === "center" ? undefined : undefined, // پیش‌فرض رنگ پس‌زمینه
        },
      }}
    />
  }
  label="وسط‌چین"
  sx={{
    color: "text.primary", // رنگ پیش‌فرض برای لیبل
    userSelect: "none",
  }}
/>


          <IconButton color="inherit" onClick={clearChat} aria-label="پاک کردن چت">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export function Messages() {
  const { messages, darkMode, displayedAnswer, typing, alignmentMode } = useChat();

  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const lastAssistantIndex = [...messages]
      .reverse()
      .findIndex((msg) => msg.role === "assistant");

    if (lastAssistantIndex === -1) return;

    const idx = messages.length - 1 - lastAssistantIndex;
    const lastAssistantRef = messageRefs.current[idx];

    if (lastAssistantRef) {
      lastAssistantRef.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [messages]);

  const typingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typing && typingRef.current) {
      typingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [displayedAnswer, typing]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        p: 2,
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
      aria-live="polite"
      role="log"
    >
      {messages.map(({ id, role, content }, index) => {
        let alignSelf = "center";
        if (alignmentMode === "side") {
          alignSelf = role === "user" ? "flex-end" : "flex-start";
        }

        return (

<Paper
  key={id}
  elevation={0} // حذف حاشیه
  ref={(el) => (messageRefs.current[index] = el)}
  sx={{
    p: "4px 16px", // کاهش فاصله از بالا و پایین
    mb: 1.5,
    maxWidth: "800px", // محدود کردن حداکثر عرض به 800 پیکسل
    width: "100%", // عرض کامل تا 800 پیکسل
    alignSelf: "center", // مرکز کردن پیام‌ها در وسط صفحه
    borderRadius: 3, // گرد کردن لبه‌ها
    whiteSpace: "normal", // اطمینان از اینکه متن‌ها به صورت عمودی و ستونی نمایش داده می‌شوند
    wordBreak: "break-word", // شکستن کلمات در صورت نیاز
    bgcolor: "background.default", // هماهنگ با پس‌زمینه صفحه
    color: darkMode ? "text.primary" : "grey.800", // رنگ متن روشن و تاریک
    border: role === "user" ? `1px solid ${darkMode ? "#333" : "#ccc"}` : "none", // حاشیه دور سوالات کاربر
    boxShadow: role === "user" ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none", // سایه برای حالت سه‌بعدی
    display: "block", // استفاده از فلکس باکس برای راست‌چین کردن
    flexDirection: "column", // نمایش پیام‌ها به صورت ستونی
    textAlign: "right", // راست‌چین کردن متن
    margin: "0 auto", // مرکز کردن پیام‌ها در صفحه
  }}
  aria-label={role === "user" ? "پیام شما" : "پیام دستیار"}
>
  <Typography
    component="div"
    variant="body1"
    sx={{
      "& pre": {
        padding: 1,
        borderRadius: 1,
        overflowX: "auto",
      },
      "& code": {
        fontFamily: "monospace",
        padding: "2px 4px",
        borderRadius: "4px",
      },
    }}
  >
    <ReactMarkdown>{content}</ReactMarkdown>
  </Typography>
</Paper>




        );
      })}

      {typing && (
        <Paper
          elevation={3}
          ref={typingRef}
          sx={{
            p: 2,
            mb: 1.5,
            maxWidth: "70%",
            alignSelf: alignmentMode === "side" ? "flex-start" : "center",
            bgcolor: darkMode ? "grey.700" : "grey.300",
            color: darkMode ? "grey.100" : "text.primary",
            borderRadius: 3,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontStyle: "italic",
          }}
          aria-label="در حال تایپ..."
        >
          <Typography variant="body1">
            {displayedAnswer}
            <span style={{ animation: "blink 1s step-start infinite" }}>|</span>
          </Typography>
          <style>{`
            @keyframes blink {
              50% { opacity: 0; }
            }
          `}</style>
        </Paper>
      )}
    </Box>
  );
}

export function InputArea() {
  const {
    input,
    setInput,
    loading,
    addMessage,
    model,
    setError,
    setLoading,
    messages,
    setDisplayedAnswer,
    setTyping,
  } = useChat();

  const inputRef = useRef<HTMLInputElement>(null);

  const API_URL = "https://health-assistant-backend-production.up.railway.app/chat";

  const sendMessage = async () => {
    if (!input.trim()) return;
    addMessage("user", input);
    setInput("");
    setError(null);
    setLoading(true);
    setDisplayedAnswer("");
    setTyping(true);

    try {
      const contextMessages = messages.slice(-5).map(({ role, content }) => ({ role, content }));
      const messagesToSend = [
        { role: "system", content: "شما یک فرد خبره هستید و در حال کار با یک دستیار هوشمند می باشید." },
        ...contextMessages,
        { role: "user", content: input },
      ];

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          conversation: messagesToSend,
        }),
      });

      if (!response.ok) throw new Error("خطا در پاسخ سرور");

      const data = await response.json();

      if (data.answer) {
        const words = data.answer.split(/(\s+)/);
        let index = 0;
        setDisplayedAnswer("");
        setTyping(true);

        const interval = setInterval(() => {
          setDisplayedAnswer((prev) => prev + words[index]);
          index++;
          if (index >= words.length) {
            clearInterval(interval);
            setTyping(false);
            addMessage("assistant", data.answer);
            inputRef.current?.focus();
          }
        }, 30);
      } else {
        throw new Error("پاسخ نامعتبر از سرور دریافت شد");
      }
    } catch (err: any) {
      setError(err.message);
      setTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) sendMessage();
    }
  };

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        sendMessage();
      }}
      sx={{
        display: "flex",
        gap: 3,
        p: 2,
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <TextField
        inputRef={inputRef}
        multiline
        minRows={2}
        maxRows={6}
        fullWidth
        placeholder="پیام خود را بنویسید..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        aria-label="متن پیام"
        variant="outlined"
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading || !input.trim()}
        sx={{ borderRadius: 3, minWidth: 100 }}
        aria-label="ارسال پیام"
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "ارسال"}
      </Button>
    </Box>
  );
}

export function InfoBar() {
  const { totalInputTokens, totalOutputTokens, error } = useChat();

  return (
    <>
      <Box
        sx={{
          p: 1,
          textAlign: "center",
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="textSecondary">
          توکن ورودی: {totalInputTokens} | توکن خروجی: {totalOutputTokens} | مجموع:{" "}
          {totalInputTokens + totalOutputTokens}
        </Typography>
      </Box>

      <Snackbar
        open={Boolean(error)}
        message={error || ""}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </>
  );
}

export default function App() {
  const { darkMode } = useChat();

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          fontFamily: "'Vazir', sans-serif",
        }}
        dir="rtl"
      >
        <Header />
        <InfoBar />
        <Messages />
        <InputArea />
      </Box>
    </ThemeProvider>
  );
}

export function Root() {
  return (
    <ChatProvider>
      <App />
    </ChatProvider>
  );
}
