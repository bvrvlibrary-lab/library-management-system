export function formatText(text = "") {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatLanguage(language = "") {
  return formatText(language);
}

export function formatPosition(position = "") {
  return position
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}
