import { AnnouncementBar } from "@/components/shop/announcement-bar";
import { Footer } from "@/components/shop/footer";
import { Header } from "@/components/shop/header";
import { SupportChat } from "@/components/shop/support-chat";

// Rendered per request: language, currency and feature flags come from cookies and env.
export const dynamic = "force-dynamic";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>{children}</main>
      <Footer />
      <SupportChat />
    </>
  );
}
