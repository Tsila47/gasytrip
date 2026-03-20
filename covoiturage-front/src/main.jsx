import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./compenents/Navbar.jsx";
import ProtectedRoute from "./compenents/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import RideListPage from "./pages/RideListPage.jsx";
import RideDetailPage from "./pages/RideDetailPage.jsx";
import MyBookingsPage from "./pages/MyBookingsPage.jsx";
import MyRidesPage from "./pages/MyRidesPage.jsx";
import CreateRidePage from "./pages/CreateRidePage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import "./index.css";
import Footer from "./compenents/Footer.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/rides" element={<RideListPage />} />
          <Route path="/rides/:id" element={<RideDetailPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/me/reservations" element={<MyBookingsPage />} />
            <Route path="/me/rides" element={<MyRidesPage />} />
            <Route path="/me/rides/new" element={<CreateRidePage />} />
          </Route>
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>
        </Routes>
        </main>
        <Footer/>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);