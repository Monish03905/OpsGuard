export function exportToCsv(filename: string, rows: Record<string, any>[], columns?: string[]) {
  if (rows.length === 0) return;
  const keys = columns || Object.keys(rows[0]);
  const header = keys.join(",");
  const csv = [
    header,
    ...rows.map((row) =>
      keys
        .map((k) => {
          const val = row[k];
          if (val == null) return "";
          const str = Array.isArray(val) ? val.join("; ") : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
