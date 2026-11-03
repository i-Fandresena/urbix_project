import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/messages";

export default async function RedactionLoading() {
  const locale = await getServerLocale();
  return <main className="editorial-access" aria-live="polite"><p>{translate(locale, "editorial.loadingQueue")}</p></main>;
}
