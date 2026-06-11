import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import BackToTop from "./components/BackToTop";
import Landing from "./pages/Landing";
import Workshop from "./pages/Workshop";
import Progress from "./pages/Progress";
import Guide from "./pages/Guide";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/workshop" element={<Workshop />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/guide" element={<Guide />} />
      </Routes>
      <Footer />
      <BackToTop />
    </BrowserRouter>
  );
}
