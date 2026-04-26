interface ErrorTextProps {
  msg?: string;
}

export default function ErrorText({ msg }: ErrorTextProps) {
  if (!msg) return null;
  return <div style={{ color: "#791F1F", fontSize: 11, marginTop: -2, fontWeight: 600 }}>⚠ {msg}</div>;
}
