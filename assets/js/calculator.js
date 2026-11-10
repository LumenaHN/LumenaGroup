/* =========================================================
   LUMENA GROUP — Cotizador interactivo
   Estimado referencial en Lempiras (HNL)
   ========================================================= */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "50495382344"; // +504 9538-2344

  var PRICING = {
    base: { marketing: 12000, web: 18000, apps: 45000, tools: 35000 },
    scopeMultiplier: { basic: 0.7, standard: 1, advanced: 1.6 },
    perUnit: { marketing: 800, web: 1500, apps: 4000, tools: 3500 },
    includedUnits: { marketing: 3, web: 3, apps: 3, tools: 2 },
    integrationsExtra: 0.15,
    urgentExtra: 0.2,
    rangeSpread: 0.12
  };

  var state = {
    service: null,
    scope: "standard",
    pages: 5,
    integrations: null,
    timeline: "normal",
    name: "",
    company: "",
    email: "",
    phone: "",
    notes: ""
  };

  var currentStep = 1;

  function fmt(n) {
    return "L " + Math.round(n).toLocaleString("es-HN");
  }

  function computeEstimate() {
    if (!state.service) return null;
    var base = PRICING.base[state.service];
    var scopeMult = PRICING.scopeMultiplier[state.scope] || 1;
    var included = PRICING.includedUnits[state.service];
    var extraUnits = Math.max(0, (state.pages || 0) - included);
    var perUnit = PRICING.perUnit[state.service];

    var subtotal = base * scopeMult + extraUnits * perUnit;
    if (state.integrations === "yes") subtotal *= (1 + PRICING.integrationsExtra);
    if (state.timeline === "urgent") subtotal *= (1 + PRICING.urgentExtra);

    var min = subtotal * (1 - PRICING.rangeSpread);
    var max = subtotal * (1 + PRICING.rangeSpread);
    return { min: min, max: max };
  }

  function lang() {
    return (window.LumenaI18n && window.LumenaI18n.getLang()) || "es";
  }
  function t(key) {
    return (window.LumenaI18n && window.LumenaI18n.t(key, lang())) || key;
  }

  function updateSummary() {
    var estimateEl = document.querySelector("[data-summary-total]");
    var lines = {
      service: document.querySelector("[data-summary-service]"),
      scope: document.querySelector("[data-summary-scope]"),
      pages: document.querySelector("[data-summary-pages]"),
      integrations: document.querySelector("[data-summary-integrations]"),
      timeline: document.querySelector("[data-summary-timeline]")
    };
    var emptyMsg = document.querySelector("[data-summary-empty]");
    var filled = document.querySelector("[data-summary-filled]");

    if (!state.service) {
      if (emptyMsg) emptyMsg.style.display = "block";
      if (filled) filled.style.display = "none";
      return;
    }
    if (emptyMsg) emptyMsg.style.display = "none";
    if (filled) filled.style.display = "block";

    if (lines.service) lines.service.textContent = t("quote.service." + state.service);
    if (lines.scope) lines.scope.textContent = t("quote.s2.scope." + state.scope);
    if (lines.pages) lines.pages.textContent = state.pages;
    if (lines.integrations) lines.integrations.textContent = state.integrations === "yes" ? t("quote.s2.integrations.yes") : (state.integrations === "no" ? t("quote.s2.integrations.no") : "—");
    if (lines.timeline) lines.timeline.textContent = state.timeline === "urgent" ? t("quote.s2.timeline.urgent") : t("quote.s2.timeline.normal");

    var estimate = computeEstimate();
    if (estimateEl && estimate) {
      estimateEl.textContent = fmt(estimate.min) + " – " + fmt(estimate.max);
    }
  }

  function goToStep(step) {
    currentStep = step;
    document.querySelectorAll(".quote-panel").forEach(function (panel) {
      panel.classList.toggle("is-active", Number(panel.getAttribute("data-step")) === step);
    });
    document.querySelectorAll(".quote-step-dot").forEach(function (dot) {
      var dotStep = Number(dot.getAttribute("data-step"));
      dot.classList.toggle("active", dotStep === step);
      dot.classList.toggle("done", dotStep < step);
    });
    var panelEl = document.querySelector('.quote-panel[data-step="' + step + '"]');
    if (panelEl) panelEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validateStep1() {
    return !!state.service;
  }
  function validateStep3() {
    var errors = {};
    if (!state.name.trim()) errors.name = true;
    if (!state.phone.trim()) errors.phone = true;
    if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) errors.email = true;
    return errors;
  }

  function setFieldError(fieldName, hasError) {
    var field = document.querySelector('[data-field="' + fieldName + '"]');
    if (field) field.classList.toggle("error", !!hasError);
  }

  function buildWhatsAppMessage() {
    var estimate = computeEstimate();
    var msg = "Hola Lumena Group, quiero una cotización:\n\n";
    msg += "Servicio: " + t("quote.service." + state.service) + "\n";
    msg += "Alcance: " + t("quote.s2.scope." + state.scope) + "\n";
    msg += "Páginas/módulos aprox.: " + state.pages + "\n";
    msg += "Integraciones: " + (state.integrations === "yes" ? "Sí" : "No") + "\n";
    msg += "Tiempo de entrega: " + (state.timeline === "urgent" ? "Urgente" : "Normal") + "\n";
    if (estimate) msg += "Estimado referencial: " + fmt(estimate.min) + " - " + fmt(estimate.max) + "\n";
    msg += "\nNombre: " + state.name + "\n";
    if (state.company) msg += "Empresa: " + state.company + "\n";
    if (state.email) msg += "Correo: " + state.email + "\n";
    msg += "Teléfono: " + state.phone + "\n";
    if (state.notes) msg += "Detalles: " + state.notes + "\n";
    return msg;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector("[data-quote-form]");
    if (!form) return;

    /* Step 1: service option cards */
    form.querySelectorAll('input[name="service"]').forEach(function (input) {
      input.addEventListener("change", function () {
        state.service = input.value;
        updateSummary();
      });
    });

    /* Step 2: scope option cards */
    form.querySelectorAll('input[name="scope"]').forEach(function (input) {
      input.addEventListener("change", function () {
        state.scope = input.value;
        updateSummary();
      });
    });

    /* Step 2: pages/modules range */
    var pagesRange = form.querySelector('[data-field="pages"] input[type="range"]');
    var pagesValue = form.querySelector("[data-pages-value]");
    if (pagesRange) {
      pagesRange.addEventListener("input", function () {
        state.pages = Number(pagesRange.value);
        if (pagesValue) pagesValue.textContent = state.pages;
        updateSummary();
      });
    }

    /* Step 2: integrations toggle */
    form.querySelectorAll('input[name="integrations"]').forEach(function (input) {
      input.addEventListener("change", function () {
        state.integrations = input.value;
        updateSummary();
      });
    });

    /* Step 2: timeline toggle */
    form.querySelectorAll('input[name="timeline"]').forEach(function (input) {
      input.addEventListener("change", function () {
        state.timeline = input.value;
        updateSummary();
      });
    });

    /* Step 3: contact fields */
    ["name", "company", "email", "phone", "notes"].forEach(function (fieldName) {
      var el = form.querySelector('[name="' + fieldName + '"]');
      if (!el) return;
      el.addEventListener("input", function () {
        state[fieldName] = el.value;
      });
    });

    /* Navigation */
    form.querySelectorAll("[data-step-next]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (currentStep === 1 && !validateStep1()) {
          var group = form.querySelector('[data-field="service"]');
          if (group) group.classList.add("error");
          return;
        }
        goToStep(currentStep + 1);
      });
    });
    form.querySelectorAll("[data-step-back]").forEach(function (btn) {
      btn.addEventListener("click", function () { goToStep(currentStep - 1); });
    });

    /* Submit */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var errors = validateStep3();
      setFieldError("name", errors.name);
      setFieldError("phone", errors.phone);
      setFieldError("email", errors.email);
      if (Object.keys(errors).length) return;

      var message = buildWhatsAppMessage();
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
      var successEl = document.querySelector("[data-quote-success]");
      if (successEl) successEl.style.display = "flex";
      window.open(url, "_blank", "noopener");
    });

    updateSummary();
    document.addEventListener("lumena:langchange", updateSummary);
  });
})();
