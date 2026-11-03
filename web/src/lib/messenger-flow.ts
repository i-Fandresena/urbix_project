// Parcours de conversation du bot Messenger. Fonctions pures : la base et l’envoi sont gérés par la route.
import { CATALOGS, LANGUAGES, fill, label, type Language, type Messages } from "@/lib/messenger-messages";

export type QuickReply = { content_type: "text"; title: string; payload: string };
export type Reply = { text: string; quickReplies?: QuickReply[] };
export type Step = "idle" | "language" | "theme" | "content" | "seen_on" | "region" | "confirm";
export type Draft = {
  kind?: "report" | "check";
  theme?: string;
  content?: string;
  attachmentCount?: number;
  seenOn?: string;
  region?: string;
};
export type CompleteDraft = Draft & Required<Pick<Draft, "kind" | "theme" | "content">>;
export type Conversation = { step: Step; draft: Draft; language?: Language };
export type FlowInput = { payload?: string; text?: string; attachmentCount: number };
export type Effect =
  | { type: "create"; draft: CompleteDraft; language: Language }
  | { type: "list"; language: Language }
  | { type: "find"; code: string; language: Language };
export type FlowResult = { conversation: Conversation; replies: Reply[]; effect?: Effect };
export type SignalementSummary = { code: string; theme: string; status: string; createdAt: Date };

export const STEPS: readonly Step[] = ["idle", "language", "theme", "content", "seen_on", "region", "confirm"];

const MAX_CONTENT_LENGTH = 2000;
const MAX_SHORT_LENGTH = 120;
const CODE_PATTERN = /\bLV-([A-HJKMNP-Z2-9]{6})\b/i;
const FOLLOW_COMMAND = /^(suivi|follow|track)\b/i;
const CANCEL_COMMANDS = new Set(["annuler", "cancel", "menu"]);

const option = (title: string, payload: string): QuickReply => ({ content_type: "text", title, payload });

// Certaines applications, comme Facebook Lite, peuvent ne pas afficher les boutons :
// chaque choix est aussi listé avec un numéro, et le numéro ou le libellé tapé est accepté.
type Choices = { numbered: QuickReply[]; named: QuickReply[] };

function languageOptions() {
  return LANGUAGES.map((language) => option(CATALOGS[language].languageName, `LANG_${language}`));
}

function menuOptions(m: Messages) {
  const options = [option(m.menuReport, "INTENT_REPORT"), option(m.menuCheck, "INTENT_CHECK"), option(m.menuFollow, "INTENT_FOLLOW")];
  return LANGUAGES.length > 1 ? [...options, option(m.menuLanguage, "CHANGE_LANGUAGE")] : options;
}

function themeOptions(m: Messages) {
  return Object.entries(m.themes).map(([key, title]) => option(title, `THEME_${key}`));
}

function seenOnOptions(m: Messages) {
  return Object.entries(m.seenOn).map(([key, title]) => option(title, `SEEN_${key}`));
}

function choicesFor(step: Step, m: Messages): Choices {
  const cancel = option(m.cancel, "CANCEL");
  switch (step) {
    case "idle": return { numbered: menuOptions(m), named: [] };
    case "theme": return { numbered: themeOptions(m), named: [cancel] };
    case "seen_on": return { numbered: seenOnOptions(m), named: [cancel] };
    case "region": return { numbered: [], named: [option(m.skip, "REGION_SKIP"), cancel] };
    case "confirm": return { numbered: [option(m.confirm, "CONFIRM"), option(m.edit, "EDIT")], named: [cancel] };
    default: return { numbered: [], named: [cancel] };
  }
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function typedChoice({ numbered, named }: Choices, text: string) {
  const answer = normalize(text);
  if (!answer) return undefined;
  if (/^\d{1,2}$/.test(answer)) return numbered[Number(answer) - 1]?.payload;
  return [...numbered, ...named].find((choice) => normalize(choice.title) === answer)?.payload;
}

function withNumbers(text: string, options: QuickReply[]) {
  return `${text}\n\n${options.map((choice, index) => `${index + 1}. ${choice.title}`).join("\n")}`;
}

function menu(m: Messages, text: string): Reply {
  const options = menuOptions(m);
  return { text: withNumbers(text, options), quickReplies: options };
}

function welcome(m: Messages) {
  return menu(m, `${m.welcome}\n\n${m.whatToDo}`);
}

function languageQuestion(): Reply {
  const options = languageOptions();
  return { text: withNumbers(LANGUAGES.map((language) => CATALOGS[language].greeting).join("\n"), options), quickReplies: options };
}

function themeQuestion(m: Messages, withHint = false): Reply {
  const options = themeOptions(m);
  return { text: withNumbers(withHint ? `${m.themeHint} ${m.themeQuestion}` : m.themeQuestion, options), quickReplies: [...options, option(m.cancel, "CANCEL")] };
}

function contentQuestion(m: Messages, kind: Draft["kind"]): Reply {
  return { text: kind === "check" ? m.contentCheck : m.contentReport, quickReplies: [option(m.cancel, "CANCEL")] };
}

function seenOnQuestion(m: Messages): Reply {
  const options = seenOnOptions(m);
  return { text: withNumbers(m.seenOnQuestion, options), quickReplies: [...options, option(m.cancel, "CANCEL")] };
}

function regionQuestion(m: Messages): Reply {
  return { text: m.regionQuestion, quickReplies: [option(m.skip, "REGION_SKIP"), option(m.cancel, "CANCEL")] };
}

function summary(m: Messages, draft: Draft): Reply {
  const content = draft.content ?? "";
  const text = fill(m.summary, {
    kind: draft.kind === "check" ? m.kindCheck : m.kindReport,
    theme: label(m.themes, draft.theme ?? "autre"),
    content: content.length > 300 ? `${content.slice(0, 300)}…` : content,
    seenOn: draft.seenOn ? label(m.seenOn, draft.seenOn) : m.notSpecified,
    region: draft.region ?? m.notSpecified,
    files: draft.attachmentCount ? fill(m.summaryFiles, { count: draft.attachmentCount }) : "",
  });
  const options = choicesFor("confirm", m).numbered;
  return { text: withNumbers(text, options), quickReplies: [...options, option(m.cancel, "CANCEL")] };
}

function isComplete(draft: Draft): draft is CompleteDraft {
  return Boolean(draft.kind && draft.theme && draft.content);
}

function describe(m: Messages, template: string, item: SignalementSummary) {
  return fill(template, {
    code: item.code,
    theme: label(m.themes, item.theme),
    date: new Intl.DateTimeFormat(m.locale, { dateStyle: "long", timeZone: "Indian/Antananarivo" }).format(item.createdAt),
    status: label(m.statuses, item.status),
  });
}

export function advance(conversation: Conversation, input: FlowInput): FlowResult {
  const text = input.text?.trim() ?? "";
  const command = text.toLowerCase();
  const known = LANGUAGES.length === 1 ? LANGUAGES[0] : LANGUAGES.find((item) => item === conversation.language);
  const choosingLanguage = !known || conversation.step === "language";
  const choices = choosingLanguage ? { numbered: languageOptions(), named: [] } : choicesFor(conversation.step, CATALOGS[known]);
  const payload = input.payload ?? (text ? typedChoice(choices, text) : undefined);

  const picked = LANGUAGES.find((language) => payload === `LANG_${language}`);
  if (picked) return { conversation: { step: "idle", draft: {}, language: picked }, replies: [welcome(CATALOGS[picked])] };
  if (choosingLanguage || payload === "CHANGE_LANGUAGE") {
    return { conversation: { step: "language", draft: {}, language: conversation.language }, replies: [languageQuestion()] };
  }

  const language = known;
  const m = CATALOGS[language];
  const { step, draft } = conversation;
  const current: Conversation = { ...conversation, language };
  const idle: Conversation = { step: "idle", draft: {}, language };

  if (payload === "GET_STARTED") return { conversation: idle, replies: [welcome(m)] };
  if (payload === "CANCEL" || CANCEL_COMMANDS.has(command)) {
    return { conversation: idle, replies: [menu(m, step === "idle" ? m.whatToDo : `${m.cancelled} ${m.whatToDo}`)] };
  }
  if (payload === "INTENT_REPORT" || payload === "INTENT_CHECK") {
    return { conversation: { step: "theme", draft: { kind: payload === "INTENT_CHECK" ? "check" : "report" }, language }, replies: [themeQuestion(m)] };
  }
  if (payload === "INTENT_FOLLOW") return { conversation: current, replies: [], effect: { type: "list", language } };

  const code = CODE_PATTERN.exec(text)?.[1];
  if (code && (step === "idle" || FOLLOW_COMMAND.test(text))) {
    return { conversation: current, replies: [], effect: { type: "find", code: `LV-${code.toUpperCase()}`, language } };
  }

  switch (step) {
    case "theme": {
      const theme = payload?.startsWith("THEME_") ? payload.slice("THEME_".length) : "";
      if (!Object.hasOwn(m.themes, theme)) return { conversation: current, replies: [themeQuestion(m, true)] };
      return { conversation: { ...current, step: "content", draft: { ...draft, theme } }, replies: [contentQuestion(m, draft.kind)] };
    }
    case "content": {
      const attachmentCount = (draft.attachmentCount ?? 0) + input.attachmentCount;
      if (payload || !text) {
        const reply = input.attachmentCount ? { text: m.attachmentReceived, quickReplies: [option(m.cancel, "CANCEL")] } : contentQuestion(m, draft.kind);
        return { conversation: { ...current, draft: { ...draft, attachmentCount } }, replies: [reply] };
      }
      const next = { ...draft, attachmentCount, content: text.slice(0, MAX_CONTENT_LENGTH) };
      return { conversation: { ...current, step: "seen_on", draft: next }, replies: [seenOnQuestion(m)] };
    }
    case "seen_on": {
      const key = payload?.startsWith("SEEN_") ? payload.slice("SEEN_".length) : "";
      const seenOn = Object.hasOwn(m.seenOn, key) ? key : !payload && text ? text.slice(0, MAX_SHORT_LENGTH) : "";
      if (!seenOn) return { conversation: current, replies: [seenOnQuestion(m)] };
      return { conversation: { ...current, step: "region", draft: { ...draft, seenOn } }, replies: [regionQuestion(m)] };
    }
    case "region": {
      if (payload !== "REGION_SKIP" && (payload || !text)) return { conversation: current, replies: [regionQuestion(m)] };
      const next = { ...draft, region: payload === "REGION_SKIP" ? undefined : text.slice(0, MAX_SHORT_LENGTH) };
      return { conversation: { ...current, step: "confirm", draft: next }, replies: [summary(m, next)] };
    }
    case "confirm": {
      if (!isComplete(draft)) return { conversation: idle, replies: [menu(m, m.incomplete)] };
      if (payload === "CONFIRM") return { conversation: idle, replies: [], effect: { type: "create", draft, language } };
      if (payload === "EDIT") {
        return { conversation: { ...current, step: "content", draft: { kind: draft.kind, theme: draft.theme } }, replies: [contentQuestion(m, draft.kind)] };
      }
      return { conversation: current, replies: [summary(m, draft)] };
    }
    default:
      return { conversation: idle, replies: [welcome(m)] };
  }
}

export function createdReplies(language: Language, code: string): Reply[] {
  const m = CATALOGS[language];
  return [menu(m, fill(m.created, { code }))];
}

export function followReplies(language: Language, items: SignalementSummary[]): Reply[] {
  const m = CATALOGS[language];
  if (!items.length) return [menu(m, m.followEmpty)];
  return [menu(m, [m.followTitle, ...items.map((item) => describe(m, m.followItem, item))].join("\n"))];
}

export function foundReplies(language: Language, code: string, item: SignalementSummary | null): Reply[] {
  const m = CATALOGS[language];
  return [menu(m, item ? describe(m, m.found, item) : fill(m.foundNone, { code }))];
}
