const root = document.documentElement;
const body = document.body;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const intro = document.querySelector(".intro-screen");
const finishIntro = () => {
  if (!intro) return;
  intro.classList.add("is-finished");
};

if (reducedMotion.matches) {
  finishIntro();
} else {
  window.addEventListener("load", () => window.setTimeout(finishIntro, 720), { once: true });
  window.setTimeout(finishIntro, 1800);
}

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const menuButton = document.querySelector(".menu-button");
const menuLabel = document.querySelector(".menu-button-label");
const nav = document.getElementById("primary-nav");

const setMenu = (open) => {
  body.classList.toggle("menu-open", open);
  if (menuButton) menuButton.setAttribute("aria-expanded", String(open));
  if (menuLabel) menuLabel.textContent = open ? "Close" : "Menu";
};

menuButton?.addEventListener("click", () => {
  setMenu(!body.classList.contains("menu-open"));
});

nav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && body.classList.contains("menu-open")) setMenu(false);
});

const revealItems = Array.from(document.querySelectorAll(".reveal"));
if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -9% 0px", threshold: 0.08 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const progress = document.querySelector(".scroll-progress span");
const header = document.querySelector("[data-header]");
let previousScroll = window.scrollY;
let scrollQueued = false;

const updateScrollState = () => {
  const scrollTop = window.scrollY;
  const available = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const ratio = Math.min(Math.max(scrollTop / available, 0), 1);

  if (progress) progress.style.transform = `scaleX(${ratio})`;

  if (header && !body.classList.contains("menu-open")) {
    const movingDown = scrollTop > previousScroll;
    header.classList.toggle("is-hidden", movingDown && scrollTop > 220);
  }

  previousScroll = scrollTop;
  scrollQueued = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(updateScrollState);
  },
  { passive: true }
);

updateScrollState();

const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
const trackedSections = ["work", "about", "contact"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const setActiveSection = (id) => {
  navLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
};

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActiveSection(visible[0].target.id);
    },
    { rootMargin: "-22% 0px -58% 0px", threshold: [0, 0.1, 0.35] }
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));
}

if (window.matchMedia("(pointer: fine)").matches && !reducedMotion.matches) {
  let pointerQueued = false;
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;

  document.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (pointerQueued) return;
    pointerQueued = true;
    window.requestAnimationFrame(() => {
      root.style.setProperty("--pointer-x", `${pointerX}px`);
      root.style.setProperty("--pointer-y", `${pointerY}px`);
      pointerQueued = false;
    });
  });
}

const dialog = document.getElementById("media-dialog");
const dialogImage = document.getElementById("dialog-image");
const dialogCaption = document.getElementById("media-caption");
const dialogClose = document.querySelector(".dialog-close");
const mediaTriggers = Array.from(document.querySelectorAll(".media-trigger"));

const closeDialog = () => {
  if (!dialog?.open) return;
  dialog.close();
};

mediaTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const image = trigger.dataset.image;
    const caption = trigger.dataset.caption || "Product screen";
    if (!dialog || !dialogImage || !image) return;

    dialogImage.src = image;
    dialogImage.alt = caption;
    if (dialogCaption) dialogCaption.textContent = caption;
    body.classList.add("dialog-open");
    dialog.showModal();
  });
});

dialogClose?.addEventListener("click", closeDialog);

dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) closeDialog();
});

dialog?.addEventListener("close", () => {
  body.classList.remove("dialog-open");
  if (dialogImage) dialogImage.src = "";
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760 && body.classList.contains("menu-open")) setMenu(false);
});
