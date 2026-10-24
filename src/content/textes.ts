import source from "../../TEXTES.txt";

/**
 * Lecture de TEXTES.txt : chaque balise [nom.de.balise] est suivie de son texte,
 * jusqu'à la balise suivante. Les lignes qui commencent par # sont ignorées,
 * les lignes consécutives sont collées, une ligne vide sépare deux paragraphes.
 */
function parse(raw: string) {
  const texts = new Map<string, string>();
  let key: string | null = null;
  let lines: string[] = [];

  const flush = () => {
    if (key === null) return;
    const paragraphs = lines
      .join("\n")
      .split(/\n\s*\n/)
      .map((p) => p.split("\n").map((l) => l.trim()).filter(Boolean).join(" "))
      .filter(Boolean);
    texts.set(key, paragraphs.join("\n\n"));
  };

  for (const line of raw.split(/\r?\n/)) {
    if (line.trimStart().startsWith("#")) continue;
    const tag = line.match(/^\s*\[([^\]]+)\]\s*$/);
    if (tag) {
      flush();
      key = tag[1].trim();
      lines = [];
    } else if (key !== null) {
      lines.push(line);
    }
  }
  flush();
  return texts;
}

const texts = parse(source);

/** Texte d'une balise. Une balise absente arrête la construction du site avec un message clair. */
export function t(key: string): string {
  const value = texts.get(key);
  if (value === undefined) {
    throw new Error(`TEXTES.txt : la balise [${key}] est introuvable. Ajoute-la (ou vérifie son orthographe).`);
  }
  return value;
}

/** Texte d'une balise qui peut être vide (l'élément est alors masqué). */
export const optional = (key: string) => t(key) || undefined;

/** Liste séparée par des virgules : « Java, Swing, Git ». */
export const list = (key: string) =>
  t(key)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** Numéros 1, 2, 3… des balises « <prefix>N.<champ> » présentes (pour ajouter une ligne, il suffit d'ajouter ses balises). */
export function numbered(prefix: string, field: string) {
  const out: number[] = [];
  for (let i = 1; texts.has(`${prefix}${i}.${field}`); i++) out.push(i);
  return out;
}
