import { redirect } from "next/navigation";

// Login and registration share one page (see the wireframe).
export default function RegisterPage() {
  redirect("/login");
}
