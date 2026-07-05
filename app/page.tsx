import { t } from "@/lib/i18n";
import { appName } from "@/lib/i18n/strings/common";

const heading = {
  en: "Job hunting, made passive.",
  ar: "البحث عن وظيفة، بدون تعب.",
};

const subheading = {
  en: "Talk to Light in Arabic, get a professional bilingual CV, and let matching find the job for you.",
  ar: "تحدث مع لايت بالعربي، واحصل على سيرة ذاتية احترافية بالعربي والإنجليزي، ودع المطابقة تدوّر لك على الوظيفة المناسبة.",
};

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[1200px] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <span className="text-h3 font-semibold text-accent">{t(appName, "ar")}</span>
      <h1 className="text-display font-bold text-primary">{t(heading, "ar")}</h1>
      <p className="max-w-[640px] text-body-lg text-muted">{t(subheading, "ar")}</p>
    </main>
  );
}
