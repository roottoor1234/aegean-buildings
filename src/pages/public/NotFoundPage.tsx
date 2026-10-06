import { useContentLang } from "@/lib/lang";
import { PublicError } from "./PublicStates";

export default function NotFoundPage() {
  const lang = useContentLang();
  return <PublicError lang={lang} onRetry={() => window.location.reload()} />;
}
