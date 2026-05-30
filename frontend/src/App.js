import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Packages } from "@/components/site/Packages";
import { Services } from "@/components/site/Services";
import { Gallery } from "@/components/site/Gallery";
import { Testimonials } from "@/components/site/Testimonials";
import { Faq } from "@/components/site/Faq";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";

const Landing = () => (
  <div data-testid="landing-page" className="bg-[color:var(--bg)] text-main overflow-x-hidden">
    <Header />
    <main>
      <Hero />
      <About />
      <Packages />
      <Services />
      <Gallery />
      <Testimonials />
      <Faq />
      <Contact />
    </main>
    <Footer />
    <FloatingWhatsApp />
    <Toaster richColors position="top-center" />
  </div>
);

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
