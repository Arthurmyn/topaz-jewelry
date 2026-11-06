import { ru } from "@/content/ru";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-serif text-3xl">{ru.admin.dashboard}</h1>
      <p className="text-muted mt-3">{ru.admin.dashboardText}</p>
    </div>
  );
}
