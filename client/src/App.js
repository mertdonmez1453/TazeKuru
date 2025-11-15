import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SellFoodPage from "./pages/SellFoodPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import MessagesPage from "./pages/MessagesPage";
import OrdersPage from "./pages/OrdersPage";
import SellerRegistrationPage from "./pages/SellerRegistrationPage";
import SellerDetailPage from "./pages/SellerDetailPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/sell" element={<SellFoodPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/seller-register" element={<SellerRegistrationPage />} />
        <Route path="/seller/:id" element={<SellerDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
