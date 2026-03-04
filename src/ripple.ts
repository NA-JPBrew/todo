export function createRipple(
  event: MouseEvent,
  variant: "md2" | "md3" = "md3",
) {
  const element = event.currentTarget as HTMLElement;
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const size = Math.max(rect.width, rect.height) * 2;

  const ripple = document.createElement("span");
  ripple.classList.add("ripple-effect");
  ripple.classList.add(variant === "md2" ? "ripple-md2" : "ripple-md3");

  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${x - size / 2}px`;
  ripple.style.top = `${y - size / 2}px`;

  element.style.position = "relative";
  element.style.overflow = "hidden";
  element.appendChild(ripple);

  ripple.addEventListener("animationend", () => ripple.remove());
}

export function attachRipple(
  el: HTMLElement | null,
  variant: "md2" | "md3" = "md3",
) {
  if (!el) return;
  const handler = (e: MouseEvent) => createRipple(e, variant);
  el.addEventListener("mousedown", handler);
  return () => el.removeEventListener("mousedown", handler);
}

let confettiTimeout: ReturnType<typeof setTimeout> | null = null;

export function celebrateCompletion(target: HTMLElement) {
  if (confettiTimeout) clearTimeout(confettiTimeout);

  const rect = target.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const container = document.createElement("div");
  container.classList.add("celebration-container");
  container.style.left = `${cx}px`;
  container.style.top = `${cy}px`;
  document.body.appendChild(container);

  const colors = [
    "var(--md-primary)",
    "var(--md-tertiary)",
    "var(--md-secondary)",
    "#ffd700",
    "#ff6b6b",
    "#4ecdc4",
  ];

  for (let i = 0; i < 12; i++) {
    const particle = document.createElement("span");
    particle.classList.add("celebration-particle");
    const angle = (i / 12) * 360;
    const distance = 30 + Math.random() * 40;
    const dx = Math.cos((angle * Math.PI) / 180) * distance;
    const dy = Math.sin((angle * Math.PI) / 180) * distance;
    particle.style.setProperty("--dx", `${dx}px`);
    particle.style.setProperty("--dy", `${dy}px`);
    particle.style.background = colors[i % colors.length];
    particle.style.animationDelay = `${Math.random() * 80}ms`;
    container.appendChild(particle);
  }

  confettiTimeout = setTimeout(() => container.remove(), 800);
}

export function pulseElement(el: HTMLElement) {
  el.classList.add("pulse-success");
  el.addEventListener(
    "animationend",
    () => el.classList.remove("pulse-success"),
    { once: true },
  );
}
