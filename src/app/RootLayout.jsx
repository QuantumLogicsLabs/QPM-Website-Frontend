import { Outlet, ScrollRestoration } from "react-router";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import NavigationProgress from "@/components/layout/NavigationProgress";
import styles from "./RootLayout.module.css";

export default function RootLayout() {
  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>
      <NavigationProgress />
      <Navbar />
      <main id="main" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
