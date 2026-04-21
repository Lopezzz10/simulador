const REGLAS = {
  txtIngresos: {
    tipo: "decimal", min: 500, max: 100000, requerido: true,
    mensajes: {
      requerido: "Los ingresos mensuales son obligatorios.",
      tipo: "Ingrese un número válido (ej. 1500.00).",
      min: "El ingreso mínimo aceptado es USD 500.00.",
      max: "Los ingresos no pueden superar USD 100,000.00.",
    },
  },
  txtArriendo: {
    tipo: "decimal", min: 0, max: 99999, requerido: false,
    mensajes: {
      tipo: "Ingrese un número válido (ej. 300.00).",
      min: "El arriendo no puede ser negativo.",
      max: "El arriendo no puede superar USD 99,999.00.",
    },
  },
  txtAlimentacion: {
    tipo: "decimal", min: 0, max: 99999, requerido: false,
    mensajes: {
      tipo: "Ingrese un número válido (ej. 200.00).",
      min: "La alimentación no puede ser negativa.",
      max: "La alimentación no puede superar USD 99,999.00.",
    },
  },
  txtVarios: {
    tipo: "decimal", min: 0, max: 99999, requerido: false,
    mensajes: {
      tipo: "Ingrese un número válido (ej. 100.00).",
      min: "El valor de varios no puede ser negativo.",
      max: "El valor de varios no puede superar USD 99,999.00.",
    },
  },
  txtMonto: {
    tipo: "decimal", min: 500, max: 500000, requerido: true,
    mensajes: {
      requerido: "El monto solicitado es obligatorio.",
      tipo: "Ingrese un número válido (ej. 10000.00).",
      min: "El monto mínimo de crédito es USD 500.00.",
      max: "El monto máximo de crédito es USD 500,000.00.",
    },
  },
  txtPlazo: {
    tipo: "entero", min: 1, max: 30, requerido: true,
    mensajes: {
      requerido: "El plazo es obligatorio.",
      tipo: "El plazo debe ser un número entero (ej. 5).",
      min: "El plazo mínimo es 1 año.",
      max: "El plazo máximo es 30 años.",
    },
  },
  txtTasaInteres: {
    tipo: "decimal", min: 0.1, max: 30, requerido: true,
    mensajes: {
      requerido: "La tasa de interés es obligatoria.",
      tipo: "Ingrese una tasa válida (ej. 12.5).",
      min: "La tasa mínima es 0.1%.",
      max: "La tasa máxima permitida es 30%.",
    },
  },
};

function limpiarErrores() {
  document.querySelectorAll(".error-msg").forEach(el => { el.textContent = ""; el.style.display = "none"; });
  document.querySelectorAll(".input-wrap").forEach(w => w.classList.remove("input-error","input-ok"));
}

function mostrarError(id, msg) {
  const el = document.getElementById("err_" + id);
  const wrap = document.getElementById(id).closest(".input-wrap");
  if (el) { el.textContent = msg; el.style.display = "flex"; }
  if (wrap) { wrap.classList.add("input-error"); wrap.classList.remove("input-ok"); }
}

function marcarOk(id) {
  const wrap = document.getElementById(id).closest(".input-wrap");
  if (wrap) { wrap.classList.add("input-ok"); wrap.classList.remove("input-error"); }
}

function validarCampo(id) {
  const regla = REGLAS[id];
  const raw = document.getElementById(id).value.trim();

  if (raw === "") {
    if (regla.requerido) {
      mostrarError(id, regla.mensajes.requerido);
      return false;
    }
    // campo opcional vacío: se toma como 0, sin error
    marcarOk(id);
    return true;
  }

  let valor;
  if (regla.tipo === "entero") {
    if (!/^-?\d+$/.test(raw)) { mostrarError(id, regla.mensajes.tipo); return false; }
    valor = parseInt(raw, 10);
  } else {
    if (isNaN(parseFloat(raw)) || !/^-?\d+(\.\d+)?$/.test(raw)) { mostrarError(id, regla.mensajes.tipo); return false; }
    valor = parseFloat(raw);
  }

  if (valor < regla.min) { mostrarError(id, regla.mensajes.min); return false; }
  if (valor > regla.max) { mostrarError(id, regla.mensajes.max); return false; }

  marcarOk(id);
  return true;
}

function validarTodo() {
  limpiarErrores();
  const res = Object.keys(REGLAS).map(id => validarCampo(id));

  // Validación cruzada: total gastos < ingresos
  if (res[0]) {
    const ingresos = parseFloat(document.getElementById("txtIngresos").value) || 0;
    const totalGastos = obtenerTotalGastos();
    if (totalGastos >= ingresos) {
      mostrarError("txtArriendo", "");
      mostrarError("txtAlimentacion", "");
      mostrarError("txtVarios", "El total de gastos debe ser menor a los ingresos.");
      res[3] = false;
    }
  }
  return res.every(Boolean);
}

function obtenerTotalGastos() {
  const arriendo     = parseFloat(document.getElementById("txtArriendo").value)     || 0;
  const alimentacion = parseFloat(document.getElementById("txtAlimentacion").value) || 0;
  const varios       = parseFloat(document.getElementById("txtVarios").value)       || 0;
  return arriendo + alimentacion + varios;
}

function actualizarTotalGastos() {
  const total = obtenerTotalGastos();
  document.getElementById("spnTotalGastos").textContent = "USD " + total.toFixed(2);
}

function calcular() {
  if (!validarTodo()) return;

  const ingresos = parseFloat(document.getElementById("txtIngresos").value);
  const egresos  = obtenerTotalGastos();
  const monto    = parseFloat(document.getElementById("txtMonto").value);
  const plazo    = parseInt(document.getElementById("txtPlazo").value, 10);
  const tasa     = parseFloat(document.getElementById("txtTasaInteres").value);

  const disponible    = calcularDisponible(ingresos, egresos);
  const capacidadPago = calcularCapacidadPago(disponible);
  const interes       = calcularInteresSimple(monto, tasa, plazo);
  const total         = calcularTotalPagar(monto, interes);
  const cuota         = calcularCuotaMensual(total, plazo);

  document.getElementById("spnDisponible").textContent    = "USD " + disponible.toFixed(2);
  document.getElementById("spnCapacidadPago").textContent = "USD " + capacidadPago.toFixed(2);
  document.getElementById("spnInteresPagar").textContent  = "USD " + interes.toFixed(2);
  document.getElementById("spnTotalPrestamo").textContent = "USD " + total.toFixed(2);
  document.getElementById("spnCuotaMensual").textContent  = "USD " + cuota.toFixed(2);

  const badge = document.getElementById("spnEstadoCredito");
  if (aprobarCredito(capacidadPago, cuota)) {
    badge.textContent = "CRÉDITO APROBADO ✔";
    badge.className = "estado-badge aprobado";
  } else {
    badge.textContent = "CRÉDITO RECHAZADO ✘";
    badge.className = "estado-badge rechazado";
  }
}
function reiniciar() {
  ["txtIngresos","txtArriendo","txtAlimentacion","txtVarios","txtMonto","txtPlazo","txtTasaInteres"].forEach(id => {
    document.getElementById(id).value = "";
  });
  limpiarErrores();
  document.getElementById("spnTotalGastos").textContent   = "USD 0.00";
  document.getElementById("spnDisponible").textContent    = "—";
  document.getElementById("spnCapacidadPago").textContent = "—";
  document.getElementById("spnInteresPagar").textContent  = "—";
  document.getElementById("spnTotalPrestamo").textContent = "—";
  document.getElementById("spnCuotaMensual").textContent  = "—";
  const badge = document.getElementById("spnEstadoCredito");
  badge.textContent = "ANALIZANDO...";
  badge.className = "estado-badge";
}