const navWrap = document.getElementById("navWrap");
const toggle = document.querySelector(".nav-toggle");
const panel = document.getElementById("nav-menu");

function setMenu(open) {
  if (!toggle || !panel) return;
  panel.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("lock", open);
}

toggle?.addEventListener("click", () => setMenu(!panel.classList.contains("open")));
panel?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

window.addEventListener("scroll", () => {
  navWrap?.classList.toggle("scrolled", window.scrollY > 8);
}, { passive: true });

const revealNodes = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });
  revealNodes.forEach((node) => observer.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("in"));
}

document.querySelectorAll(".skill").forEach((skill) => {
  const fill = () => skill.classList.add("ready");
  if (!("IntersectionObserver" in window)) {
    fill();
    return;
  }
  const watcher = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      fill();
      watcher.disconnect();
    }
  }, { threshold: 0.4 });
  watcher.observe(skill);
});

let lastFocus = null;

function openModal(modal) {
  if (!modal) return;
  lastFocus = document.activeElement;
  modal.hidden = false;
  document.body.classList.add("lock");
  modal.querySelector(".modal-x")?.focus();
}

function closeModal(modal) {
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("lock");
  if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
}

document.querySelectorAll("[data-open-story]").forEach((button) => {
  button.addEventListener("click", () => openModal(document.getElementById("storyModal")));
});

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]")) closeModal(modal);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  setMenu(false);
  document.querySelectorAll(".modal").forEach((modal) => {
    if (!modal.hidden) closeModal(modal);
  });
});

document.querySelectorAll(".project-card").forEach((card) => {
  const open = () => {
    const modal = document.getElementById("projectModal");
    const body = document.getElementById("projectModalBody");
    if (!modal || !body) return;
    const cover = card.querySelector(".cover");
    const title = card.querySelector("h3")?.textContent?.trim() || "Project";
    const more = card.querySelector(".project-more")?.innerHTML || "";
    const tech = card.querySelector(".tech")?.innerHTML || "";
    const cat = card.querySelector(".kicker")?.textContent || "";
    body.innerHTML = `
      <div class="modal-project">
        <div class="${cover.className} modal-cover">${cover.innerHTML}</div>
        <div class="modal-copy">
          <p class="kicker">${cat}</p>
          <h3 id="projectModalTitle">${title}</h3>
          ${more}
          <ul class="tech">${tech}</ul>
          <a class="btn" href="contact.html?project=${encodeURIComponent(title)}">Start a project like this <span aria-hidden="true">→</span></a>
        </div>
      </div>`;
    openModal(modal);
  };
  card.querySelector(".project-open")?.addEventListener("click", (event) => {
    event.stopPropagation();
    open();
  });
  card.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) return;
    open();
  });
});

document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll(".filter-btn").forEach((item) => item.classList.remove("is-on"));
    button.classList.add("is-on");
    let shown = 0;
    document.querySelectorAll(".project-grid .project-card").forEach((card) => {
      const match = filter === "all" || card.dataset.cat.split(" ").includes(filter);
      card.hidden = !match;
      if (match) shown += 1;
    });
    const empty = document.getElementById("filterEmpty");
    if (empty) empty.hidden = shown !== 0;
  });
});

const form = document.getElementById("contactForm");

function digits(value) {
  return (value.match(/\d/g) || []).length;
}

function validateField(field) {
  const input = field.querySelector("input, textarea, select");
  const error = field.querySelector(".err");
  if (!input || !error || input.name === "website") return true;
  const value = input.value.trim();
  let message = "";
  if (input.name === "name") {
    if (value.length < 2) message = "Please enter your name.";
    else if (!/[a-zA-Z]/.test(value)) message = "Use letters in your name.";
  }
  if (input.name === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) message = "Enter a valid email address.";
  }
  if (input.name === "phone") {
    if (digits(value) < 10 || digits(value) > 15 || !/^[+\d\s()-]+$/.test(value)) {
      message = "Enter a phone number we can call or WhatsApp.";
    }
  }
  if (input.name === "service" && !value) message = "Choose a service.";
  if (input.name === "message") {
    if (value.length < 20) message = "Tell us a little more (at least 20 characters).";
    else if (value.length > 600) message = "Please keep the note under 600 characters.";
  }
  error.textContent = message;
  field.classList.toggle("has-error", Boolean(message));
  input.setAttribute("aria-invalid", String(Boolean(message)));
  return !message;
}

if (form) {
  const params = new URLSearchParams(window.location.search);
  const project = params.get("project");
  const service = params.get("service");
  const projectRef = document.getElementById("projectRef");
  const message = form.querySelector("[name='message']");
  const serviceField = form.querySelector("[name='service']");
  if (project && projectRef && message && !message.value) {
    projectRef.value = project;
    message.value = `Hello PixelCraft, I'd like to talk about a project in the spirit of ${project}. `;
    document.getElementById("projectChip").hidden = false;
    document.getElementById("projectChip").textContent = `About: ${project}`;
  }
  if (service && serviceField) {
    const option = [...serviceField.options].find((item) => item.value.toLowerCase() === service.toLowerCase());
    if (option) serviceField.value = option.value;
  }

  const counter = document.getElementById("count");
  message?.addEventListener("input", () => {
    if (counter) counter.textContent = String(message.value.trim().length);
  });

  form.querySelectorAll(".field").forEach((field) => {
    const input = field.querySelector("input, textarea, select");
    input?.addEventListener("blur", () => {
      if (input.dataset.touched === "true" || form.dataset.tried === "true") validateField(field);
    });
    input?.addEventListener("input", () => {
      input.dataset.touched = "true";
      if (form.dataset.tried === "true" || field.classList.contains("has-error")) validateField(field);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.dataset.tried = "true";
    const honeypot = form.querySelector("[name='website']");
    const fields = [...form.querySelectorAll(".field")];
    const ok = fields.map((field) => validateField(field)).every(Boolean);
    if (!ok) {
      form.querySelector(".has-error input, .has-error textarea, .has-error select")?.focus();
      return;
    }
    if (honeypot && honeypot.value.trim()) return;

    const data = new FormData(form);
    const text = [
      "Hello PixelCraft, I would like to commission a design.",
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone")}`,
      `Service: ${data.get("service")}`,
      data.get("project") ? `Reference: ${data.get("project")}` : "",
      "",
      String(data.get("message") || "").trim()
    ].filter(Boolean).join("\n");

    const wa = document.getElementById("waSend");
    if (wa) wa.href = `https://wa.me/233244031014?text=${encodeURIComponent(text)}`;
    form.hidden = true;
    const success = document.getElementById("formSuccess");
    if (success) success.hidden = false;
  });

  document.getElementById("writeAnother")?.addEventListener("click", () => {
    form.hidden = false;
    document.getElementById("formSuccess").hidden = true;
    form.reset();
    form.dataset.tried = "false";
    if (counter) counter.textContent = "0";
    form.querySelectorAll(".err").forEach((error) => { error.textContent = ""; });
    form.querySelectorAll(".field").forEach((field) => field.classList.remove("has-error"));
  });
}

document.getElementById("savePdf")?.addEventListener("click", () => window.print());
document.getElementById("savePdfTop")?.addEventListener("click", () => window.print());
