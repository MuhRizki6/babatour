import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import { BlogTeaser } from "@/components/site/BlogTeaser";
import { Newsletter } from "@/components/site/Newsletter";

import AdminLogin from "@/pages/AdminLogin";
import AdminLayout from "@/pages/AdminLayout";
import AdminInquiries from "@/pages/AdminInquiries";
import AdminBlog from "@/pages/AdminBlog";
import AdminBlogEditor from "@/pages/AdminBlogEditor";
import AdminPackages from "@/pages/AdminPackages";
import AdminPackageEditor from "@/pages/AdminPackageEditor";
import AdminNewsletter from "@/pages/AdminNewsletter";
import AdminGallery from "@/pages/AdminGallery";
import AdminAlbumEditor from "@/pages/AdminAlbumEditor";
import PackageDetail from "@/pages/PackageDetail";
import BlogList from "@/pages/BlogList";
import BlogDetail from "@/pages/BlogDetail";
import GalleryPage from "@/pages/GalleryPage";

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
      <BlogTeaser />
      <Newsletter />
      <Faq />
      <Contact />
    </main>
    <Footer />
    <FloatingWhatsApp />
  </div>
);

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/packages/:id" element={<PackageDetail />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/gallery" element={<GalleryPage />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminInquiries />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="packages/new" element={<AdminPackageEditor />} />
              <Route path="packages/:id/edit" element={<AdminPackageEditor />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="blog/new" element={<AdminBlogEditor />} />
              <Route path="blog/:id/edit" element={<AdminBlogEditor />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="gallery/new" element={<AdminAlbumEditor />} />
              <Route path="gallery/:id/edit" element={<AdminAlbumEditor />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
            </Route>
          </Routes>
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
