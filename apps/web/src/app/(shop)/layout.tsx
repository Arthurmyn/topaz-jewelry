import { Footer } from "@/components/shop/footer";
import { Header } from "@/components/shop/header";

// Rendered per request: the header depends on runtime feature flags, and the build has no API access.
// API responses are still cached via fetch `next.revalidate` (see lib/api/client.ts).
export const dynamic = "force-dynamic";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
