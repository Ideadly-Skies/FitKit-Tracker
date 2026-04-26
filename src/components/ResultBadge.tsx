import { Result } from '../types';

interface ResultBadgeProps {
  result: Result;
}

export default function ResultBadge({ result }: ResultBadgeProps) {
  if (!result) return (
    <span style={{ background: "#FAEEDA", color: "#633806", fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>Pending</span>
  );
  const styles: Record<string, { bg: string; fg: string; br: string }> = {
    Positive:           { bg: "#FCEBEB", fg: "#791F1F", br: "#F09595" },
    Negative:           { bg: "#EAF3DE", fg: "#27500A", br: "#97C459" },
    Inconclusive:       { bg: "#FFF4D6", fg: "#7A5200", br: "#E6B84D" },
    Withdrawn:          { bg: "#EEEEEE", fg: "#555555", br: "#BBBBBB" },
    "Early Terminated": { bg: "#EEEEEE", fg: "#555555", br: "#BBBBBB" },
    Rejected:           { bg: "#FDE8D8", fg: "#7A2E00", br: "#F4A26A" },
    "Not Shared":       { bg: "#E0EAF5", fg: "#1A3D6B", br: "#7AAAD6" },
  };
  const s = styles[result] ?? { bg: "#EEEEEE", fg: "#555", br: "#BBB" };
  return (
    <span style={{ background: s.bg, color: s.fg, border: `1px solid ${s.br}`, fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
      {result}
    </span>
  );
}
