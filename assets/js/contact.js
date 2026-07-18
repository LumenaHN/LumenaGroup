/* =========================================================
   LUMENA GROUP — Formulario de contacto
   Construye un mensaje de WhatsApp a partir del formulario
   ========================================================= */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "50495382344"; // +504 9538-2344

  function setFieldError(form, fieldName, hasError) {
    var field = form.querySelector('[data-field="' + fieldName + '"]');
    if (field) field.classList.toggle("error", !!hasError);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.querySelector('[name="name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var phone = form.querySelector('[name="phone"]').value.trim();
      var service = form.querySelector('[name="service"]');
      var serviceVal = service ? service.value : "";
      var serviceLabel = service && service.selectedIndex > -1 ? service.options[service.selectedIndex].text : "";
      var message = form.querySelector('[name="message"]').value.trim();

      var errors = {};
      if (!name) errors.name = true;
      if (!phone) errors.phone = true;
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = true;

      setFieldError(form, "name", errors.name);
      setFieldError(form, "phone", errors.phone);
      setFieldError(form, "email", errors.email);
      if (Object.keys(errors).length) return;

      var text = "Hola Lumena Group, quiero más información:\n\n";
      text += "Nombre: " + name + "\n";
      if (email) text += "Correo: " + email + "\n";
      text += "Teléfono: " + phone + "\n";
      if (serviceVal) text += "Servicio de interés: " + serviceLabel + "\n";
      if (message) text += "Mensaje: " + message + "\n";

      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
      var successEl = form.querySelector("[data-contact-success]");
      if (successEl) successEl.style.display = "flex";
      window.open(url, "_blank", "noopener");
    });
  });
})();
