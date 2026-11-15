const FORMULA_START = /^[=+\-@\t\r]/;

// Quotes a value for CSV, and defuses text that a spreadsheet could treat as a formula.
export function csvCell(value) {
  let text = value === null || value === undefined ? '' : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildRosterCsv(members, pointsFor) {
  const rows = [['Name', 'Role', 'Secondary role', 'Minecraft username', 'Voting points']];
  for (const member of members) {
    rows.push([member.name, member.role, member.secondaryRole ?? '', member.mcName ?? '', pointsFor(member)]);
  }
  return `${rows.map(row => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}

// Starts a browser download of the given text (with a BOM so Excel reads it as UTF-8).
export function downloadTextFile(filename, text, type = 'text/csv;charset=utf-8') {
  const blob = new Blob(['\ufeff', text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
