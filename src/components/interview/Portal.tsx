import { createPortal } from "react-dom";
import { ReactNode, useEffect, useState } from "react";

export function Portal({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<Element | null>(null);
  useEffect(() => setTarget(document.body), []);
  if (!target) return null;
  return createPortal(children, target);
}
