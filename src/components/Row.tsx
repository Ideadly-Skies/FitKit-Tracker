import { ReactNode } from 'react';

interface RowProps {
  children: ReactNode;
  gap?: number;
}

export default function Row({ children, gap = 10 }: RowProps) {
  return <div style={{ display: "flex", gap, flexWrap: "wrap" }}>{children}</div>;
}
