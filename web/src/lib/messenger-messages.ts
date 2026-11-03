// Textes du bot Messenger. Les champs entre accolades, comme {code}, sont remplacés à l’envoi.
// Une langue n’est proposée que si tous ses textes sont remplis, reprennent les champs du français
// et si chaque titre de bouton tient en 20 caractères, la limite de Messenger.

export type Language = "fr" | "mg" | "en";
type ThemeKey = "education" | "agriculture" | "sante" | "economie" | "politique" | "securite" | "autre";
type SeenOnKey = "facebook" | "whatsapp" | "radio_tv" | "bouche_a_oreille" | "autre";
type StatusKey = "new" | "in_review" | "forwarded" | "verified" | "closed";

export type Messages = {
  locale: string;
  languageName: string;
  greeting: string;
  welcome: string;
  whatToDo: string;
  cancelled: string;
  menuReport: string;
  menuCheck: string;
  menuFollow: string;
  menuLanguage: string;
  cancel: string;
  themeQuestion: string;
  themeHint: string;
  themes: Record<ThemeKey, string>;
  contentReport: string;
  contentCheck: string;
  attachmentReceived: string;
  seenOnQuestion: string;
  seenOn: Record<SeenOnKey, string>;
  regionQuestion: string;
  skip: string;
  kindReport: string;
  kindCheck: string;
  notSpecified: string;
  summary: string;
  summaryFiles: string;
  confirm: string;
  edit: string;
  incomplete: string;
  created: string;
  followEmpty: string;
  followTitle: string;
  followItem: string;
  foundNone: string;
  found: string;
  statuses: Record<StatusKey, string>;
};

const fr: Messages = {
  locale: "fr-FR",
  languageName: "Français",
  greeting: "Bonjour ! Choisissez votre langue.",
  welcome: "Bonjour, je suis l’assistant automatique de Laverta. Vos messages sont enregistrés pour être examinés par l’équipe Laverta, et votre identité n’est pas transmise aux organismes contactés. N’envoyez ni numéro de téléphone ni adresse personnelle.",
  whatToDo: "Que souhaitez-vous faire ?",
  cancelled: "Signalement annulé, rien n’a été enregistré.",
  menuReport: "Signaler une info",
  menuCheck: "Vérifier une rumeur",
  menuFollow: "Suivre un dossier",
  menuLanguage: "Changer de langue",
  cancel: "Annuler",
  themeQuestion: "Quel est le thème de cette information ?",
  themeHint: "Choisissez un thème avec les boutons.",
  themes: { education: "Éducation", agriculture: "Agriculture", sante: "Santé", economie: "Économie", politique: "Politique", securite: "Sécurité", autre: "Autre" },
  contentReport: "Décrivez l’information douteuse en quelques phrases. Vous pouvez aussi coller un lien.",
  contentCheck: "Écrivez la rumeur à vérifier, telle que vous l’avez reçue.",
  attachmentReceived: "Fichier reçu, mais les photos et fichiers ne sont pas conservés pour l’instant. Décrivez leur contenu par écrit.",
  seenOnQuestion: "Où avez-vous vu cette information ?",
  seenOn: { facebook: "Facebook", whatsapp: "WhatsApp", radio_tv: "Radio ou télé", bouche_a_oreille: "Bouche-à-oreille", autre: "Autre" },
  regionQuestion: "Dans quelle ville ou région ?",
  skip: "Passer",
  kindReport: "information douteuse",
  kindCheck: "rumeur à vérifier",
  notSpecified: "non précisé",
  summary: "Voici votre signalement :\n• Type : {kind}\n• Thème : {theme}\n• Contenu : « {content} »\n• Vu sur : {seenOn}\n• Lieu : {region}{files}\n\nConfirmez-vous l’envoi ?",
  summaryFiles: "\n• Fichiers reçus : {count}, non conservés",
  confirm: "Confirmer",
  edit: "Corriger",
  incomplete: "Ce signalement est incomplet. Recommencez depuis le menu.",
  created: "Merci ! Votre signalement est enregistré sous le code {code}. Inutile de retenir ce code : touchez « Suivre un dossier » à tout moment pour savoir où il en est. Aucun verdict n’est publié sans la validation d’un journaliste.",
  followEmpty: "Vous n’avez encore envoyé aucun signalement depuis ce compte Messenger.",
  followTitle: "Où en sont vos signalements :",
  followItem: "• {theme}, envoyé le {date} ({code}) : {status}",
  foundNone: "Aucun signalement {code} n’est associé à ce compte Messenger.",
  found: "{status}\n\nSignalement {code} · {theme} · envoyé le {date}",
  statuses: {
    new: "Bien reçu : un journaliste va l’examiner.",
    in_review: "Un journaliste vérifie votre signalement en ce moment.",
    forwarded: "Un journaliste attend la réponse d’un organisme officiel.",
    verified: "La vérification est terminée.",
    closed: "Ce dossier est clos.",
  },
};

// Textes fournis par l’équipe, à faire valider par un locuteur natif avant toute démonstration publique.
// Si un texte devient vide ou un bouton dépasse 20 caractères, le malgache n’est plus proposé.
const mg: Messages = {
  locale: "mg-MG",
  languageName: "Malagasy",
  greeting: "Manao ahoana ! Fidio ny fiteny tianao hampiasaina.",
  welcome: "Manao ahoana, izaho no mpanampy mandeha ho azy an'i Laverta. Voatahiry ny hafatrao mba hahafahan'ny ekipan'i Laverta mandinika azy ireo, ary tsy ampitaina amin'ireo tompon'andraikitra ifandraisana ny mombamomba anao. Aza mandefa laharana finday na adiresy fonenana.",
  whatToDo: "Inona no tianao hatao ?",
  cancelled: "Nofoanana ny fampitana vaovao. Tsy nisy zavatra voatahiry.",
  menuReport: "Hampita vaovao",
  menuCheck: "Hanamarina tsaho",
  menuFollow: "Hanaraka raharaha",
  menuLanguage: "Hanova fiteny",
  cancel: "Hanafoana",
  themeQuestion: "Inona ny lohahevitra mahakasika ity vaovao ity ?",
  themeHint: "Misafidiana lohahevitra amin'ny alalan'ny bokotra.",
  themes: {
    education: "Fanabeazana",
    agriculture: "Fambolena",
    sante: "Fahasalamana",
    economie: "Toekarena",
    politique: "Politika",
    securite: "Filaminana",
    autre: "Hafa",
  },
  contentReport: "Farito amin'ny fehezanteny vitsivitsy ilay vaovao mampiahiahy. Azonao apetaka eto ihany koa ny rohy.",
  contentCheck: "Soraty eto ilay tsaho tianao hohamarinina, araka ny fomba nandraisanao azy.",
  attachmentReceived: "Voaray ny rakitra, saingy tsy mbola tehirizina aloha ny sary sy ny rakitra alefa. Farito an-tsoratra ny zavatra hita ao anatiny.",
  seenOnQuestion: "Taiza no nahitanao na nandrenesanao ity vaovao ity ?",
  seenOn: {
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    radio_tv: "Radio/fahitalavitra",
    bouche_a_oreille: "Resaka nifanaovana",
    autre: "Hafa",
  },
  regionQuestion: "Tao amin'ny tanàna na faritra iza ?",
  skip: "Handingana",
  kindReport: "vaovao mampiahiahy",
  kindCheck: "tsaho mila hamarinina",
  notSpecified: "Tsy voalaza",
  summary: "Ity ny famintinana ny fampitam-baovao nalefanao :\n• Karazany : {kind}\n• Lohahevitra : {theme}\n• Votoatiny : « {content} »\n• Nahitana azy tao amin'ny : {seenOn}\n• Toerana : {region}{files}\n\nManamarina ny fandefasana ve ianao ?",
  summaryFiles: "\n• Rakitra voaray : {count}, saingy tsy voatahiry",
  confirm: "Marina",
  edit: "Hanitsy",
  incomplete: "Tsy feno ity fampitam-baovao ity. Avereno manomboka.",
  created: "Misaotra anao ! Voaray sy voatahiry ny fampitam-baovao nalefanao. Ity ny kaody fanarahana azy : {code}. Tsy voatery hotadidinao io kaody io. Tsindrio fotsiny ny « Hanaraka raharaha » amin'ny fotoana rehetra hijerena ny fivoaran'ny raharaha. Tsy misy fanambarana ofisialy momba ny fahamarinan'ny vaovao raha tsy efa nohamarinin'ny mpanao gazety.",
  followEmpty: "Mbola tsy nandefa fampitam-baovao tamin'ity kaonty Messenger ity ianao.",
  followTitle: "Ity ny fivoaran'ny fampitam-baovao nalefanao :",
  followItem: "• {theme}, nalefa tamin'ny {date} ({code}) : {status}",
  foundNone: "Tsy misy fampitam-baovao mitondra ny kaody {code} mifandray amin'ity kaonty Messenger ity.",
  found: "{status}\n\nFampitam-baovao {code} · {theme} · nalefa tamin'ny {date}",
  statuses: {
    new: "Voaray tsara : mpanao gazety iray no handinika azy.",
    in_review: "Misy mpanao gazety mandinika sy manamarina ny vaovao nalefanao amin'izao fotoana izao.",
    forwarded: "Miandry ny valin-tenin'ny tompon'andraikitra ofisialy ny mpanao gazety.",
    verified: "Vita ny fanamarinana ity vaovao ity.",
    closed: "Nakatona ity raharaha ity.",
  },
};

// Premier jet à faire relire par un anglophone avant toute démonstration publique.
const en: Messages = {
  locale: "en-GB",
  languageName: "English",
  greeting: "Hello! Choose your language.",
  welcome: "Hello, I am Laverta’s automated assistant. Your messages are stored so the Laverta team can review them, and your identity is not shared with the organisations we contact. Please do not send phone numbers or home addresses.",
  whatToDo: "What would you like to do?",
  cancelled: "Report cancelled. Nothing was saved.",
  menuReport: "Report something",
  menuCheck: "Check a rumour",
  menuFollow: "Track my reports",
  menuLanguage: "Change language",
  cancel: "Cancel",
  themeQuestion: "What is this information about?",
  themeHint: "Please choose a topic with the buttons.",
  themes: { education: "Education", agriculture: "Agriculture", sante: "Health", economie: "Economy", politique: "Politics", securite: "Security", autre: "Other" },
  contentReport: "Describe the doubtful information in a few sentences. You can also paste a link.",
  contentCheck: "Write the rumour you want checked, as you received it.",
  attachmentReceived: "File received, but photos and files are not stored for now. Please describe them in writing.",
  seenOnQuestion: "Where did you see this information?",
  seenOn: { facebook: "Facebook", whatsapp: "WhatsApp", radio_tv: "Radio or TV", bouche_a_oreille: "Word of mouth", autre: "Other" },
  regionQuestion: "Which town or region?",
  skip: "Skip",
  kindReport: "doubtful information",
  kindCheck: "rumour to check",
  notSpecified: "not specified",
  summary: "Here is your report:\n• Type: {kind}\n• Topic: {theme}\n• Content: “{content}”\n• Seen on: {seenOn}\n• Place: {region}{files}\n\nDo you want to send it?",
  summaryFiles: "\n• Files received: {count}, not stored",
  confirm: "Send",
  edit: "Edit",
  incomplete: "This report is incomplete. Please start again from the menu.",
  created: "Thank you! Your report is saved under the code {code}. No need to remember it: tap “Track my reports” at any time to see where it stands. No verdict is published without a journalist’s approval.",
  followEmpty: "You have not sent any reports from this Messenger account yet.",
  followTitle: "Where your reports stand:",
  followItem: "• {theme}, sent on {date} ({code}): {status}",
  foundNone: "No report {code} is linked to this Messenger account.",
  found: "{status}\n\nReport {code} · {theme} · sent on {date}",
  statuses: {
    new: "Received: a journalist will review it.",
    in_review: "A journalist is checking your report right now.",
    forwarded: "A journalist is waiting for an answer from an official body.",
    verified: "The check is complete.",
    closed: "This report is closed.",
  },
};

export const CATALOGS: Record<Language, Messages> = { fr, mg, en };

const PLACEHOLDER = /\{\w+\}/g;
const BUTTON_KEYS = new Set(["languageName", "menuReport", "menuCheck", "menuFollow", "menuLanguage", "cancel", "skip", "confirm", "edit"]);

function texts(value: object, prefix = ""): [string, string][] {
  return Object.entries(value).flatMap(([key, item]): [string, string][] =>
    typeof item === "string" ? [[`${prefix}${key}`, item]] : texts(item as object, `${prefix}${key}.`));
}

function isButton(path: string) {
  return BUTTON_KEYS.has(path) || path.startsWith("themes.") || path.startsWith("seenOn.");
}

export function isReady(messages: Messages) {
  const candidate = new Map(texts(messages));
  return texts(fr).every(([path, reference]) => {
    const translated = candidate.get(path)?.trim() ?? "";
    if (!translated || (isButton(path) && translated.length > 20)) return false;
    return (reference.match(PLACEHOLDER) ?? []).every((field) => translated.includes(field));
  });
}

export const LANGUAGES = (["fr", "mg", "en"] as const).filter((language) => isReady(CATALOGS[language]));

export function isLanguage(value: unknown): value is Language {
  return value === "fr" || value === "mg" || value === "en";
}

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(PLACEHOLDER, (field) => {
    const key = field.slice(1, -1);
    return Object.hasOwn(values, key) ? String(values[key]) : field;
  });
}

export function label(labels: Record<string, string>, key: string) {
  return Object.hasOwn(labels, key) ? labels[key] : key;
}
