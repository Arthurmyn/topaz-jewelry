import { getDict } from "@/lib/i18n-server";

export async function AnnouncementBar() {
  const dict = await getDict();
  return (
    <div className="bg-dark flex items-center justify-center px-4 py-2.5">
      <p className="text-12 text-center text-white">{dict.announcement}</p>
    </div>
  );
}
