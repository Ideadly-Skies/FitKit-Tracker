export default function Row({ children, gap = 10 }) {
  return <div style={{ display: "flex", gap, flexWrap: "wrap" }}>{children}</div>;
}
