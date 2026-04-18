function calcular() {
    let ingresos = parseFloat(document.getElementById("txtIngresos").value);
    let egresos = parseFloat(document.getElementById("txtEgresos").value);

    let disponible = calcularDisponible(ingresos, egresos);
    document.getElementById("spnDisponible").innerHTML = "USD " + disponible.toFixed(2);

    let capacidadPago = calcularCapacidadPago(disponible);
    document.getElementById("spnCapacidadPago").innerHTML = "USD " + capacidadPago.toFixed(2);

    let monto = parseInt(document.getElementById("txtMonto").value);
    let plazo = parseInt(document.getElementById("txtPlazo").value);
    let tasa = parseInt(document.getElementById("txtTasaInteres").value);

    let interes = calcularInteresSimple(monto, tasa, plazo);
    document.getElementById("spnInteresPagar").innerHTML = "USD " + interes.toFixed(2);

    let total = calcularTotalPagar(monto, interes);
    document.getElementById("spnTotalPrestamo").innerHTML = "USD " + total.toFixed(2);

    let cuota = calcularCuotaMensual(total, plazo);
    document.getElementById("spnCuotaMensual").innerHTML = "USD " + cuota.toFixed(2);
}