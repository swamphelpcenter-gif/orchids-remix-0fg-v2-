"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body p-4">
      <div className="text-center" style={{ maxWidth: "500px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="position-relative d-inline-block mb-8">
            <h1 
              className="display-1 fw-black mb-0" 
              style={{ 
                fontSize: "120px", 
                background: "linear-gradient(135deg, #4361EE, #1D92F1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1
              }}
            >
              404
            </h1>
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="position-absolute"
              style={{ top: "-20px", right: "-20px" }}
            >
              <span className="badge rounded-pill bg-danger p-2 shadow-sm">
                <i className="ri-error-warning-line ri-24px"></i>
              </span>
            </motion.div>
          </div>
          
          <h2 className="h3 fw-bold mb-4">Halaman Tidak Ditemukan</h2>
          <p className="text-muted mb-8 fs-5">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan ke dimensi lain.
          </p>

          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <Link 
              href="/" 
              className="btn btn-primary btn-lg rounded-pill px-8"
              style={{ height: "56px", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <i className="ri-home-4-line me-2"></i>
              Kembali ke Beranda
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="btn btn-outline-secondary btn-lg rounded-pill px-8"
              style={{ height: "56px" }}
            >
              <i className="ri-arrow-left-line me-2"></i>
              Halaman Sebelumnya
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-12 pt-8 border-top"
        >
          <p className="text-muted small">
            Butuh bantuan? <a href="https://wa.me/6289531606677" target="_blank" className="text-decoration-none">Hubungi Support</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
