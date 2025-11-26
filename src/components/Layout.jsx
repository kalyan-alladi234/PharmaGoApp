import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 grid place-items-center">
        <div className="w-full max-w-7xl">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
