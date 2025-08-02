import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { AuthProvider } from "./contexts/AuthContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout/Layout"
import Login from "./pages/Auth/Login"
import Register from "./pages/Auth/Register"
import Dashboard from "./pages/Dashboard/Dashboard"
import TicketList from "./pages/Tickets/TicketList"
import TicketDetail from "./pages/Tickets/TicketDetail"
import CreateTicket from "./pages/Tickets/CreateTicket"
import Profile from "./pages/Profile/Profile"
import UserManagement from "./pages/Admin/UserManagement"
import CategoryManagement from "./pages/Admin/CategoryManagement"
import Settings from "./pages/Settings/Settings"
import "./App.css"

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="tickets" element={<TicketList />} />
                  <Route path="tickets/new" element={<CreateTicket />} />
                  <Route path="tickets/:id" element={<TicketDetail />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route
                    path="admin/users"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/categories"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <CategoryManagement />
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
