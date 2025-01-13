document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#proformaTable tbody");
  const addRowButton = document.getElementById("addRowButton");

  function updateRowNumbers() {
    let rowNumber = 1;
    tableBody.querySelectorAll("tr").forEach((row) => {
      row.querySelector("td:first-child").textContent = rowNumber.toString().padStart(2, "0");
      rowNumber++;
    });
  }

  function calculateTotals() {
    let subtotal = 0;

    tableBody.querySelectorAll("tr").forEach((row) => {
      const cantidadInput = row.querySelector(".cantidad").value.trim();
      const unitario = parseFloat(row.querySelector(".unitario").value) || 0;

      let cantidad = parseFloat(cantidadInput.split(" ")[0]) || 0;
      const total = cantidad * unitario;
      row.querySelector(".total").textContent = total.toFixed(2);
      subtotal += total;
    });

    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("igv").textContent = igv.toFixed(2);
    document.getElementById("total").textContent = total.toFixed(2);
  }

  function addRow() {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td></td>
      <td><input type="text" placeholder="Descripción"></td>
      <td><input type="text" class="cantidad" placeholder="01 unid."></td>
      <td><input type="number" class="unitario" placeholder="0.00"></td>
      <td><span class="total">0.00</span></td>
      <td><button class="deleteRow">🗑 Eliminar</button></td>
    `;
    tableBody.appendChild(row);
    updateRowNumbers();
    attachEventListeners();
  }

  function attachEventListeners() {
    tableBody.querySelectorAll(".cantidad, .unitario").forEach((input) => {
      input.addEventListener("input", calculateTotals);
    });

    tableBody.querySelectorAll(".deleteRow").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.target.closest("tr").remove();
        updateRowNumbers();
        calculateTotals();
      });
    });
  }

  // Export to Word
  document.getElementById("exportToWord").addEventListener("click", () => {
    const table = document.getElementById("proformaTable");
    const rows = table.rows;
    let tableContent = `<table border="1" style="width: 100%; border-collapse: collapse;">`;

    // Generar filas de la tabla principal
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].cells;
      tableContent += "<tr>";

      for (let j = 0; j < cells.length - 1; j++) { // Excluye la última columna (Acción)
        let cellContent = cells[j].innerHTML;

        if (i > 0 && cells[j].querySelector("input")) {
          // Extrae el valor del input si existe
          cellContent = cells[j].querySelector("input").value || "";
        }
        if (i > 0 && j === 4) {
          // Extrae el texto de la celda de totales
          cellContent = cells[j].querySelector(".total").textContent || "0.00";
        }

        tableContent += `<td>${cellContent}</td>`;
      }

      tableContent += "</tr>";
    }

    // Agregar subtotales, IGV y total
    tableContent += `
      <tr>
        <td colspan="4" style="text-align: right; font-weight: bold;">SUBTOTAL:</td>
        <td style="text-align: right;">${document.getElementById("subtotal").textContent}</td>
      </tr>
      <tr>
        <td colspan="4" style="text-align: right; font-weight: bold;">IGV (18%):</td>
        <td style="text-align: right;">${document.getElementById("igv").textContent}</td>
      </tr>
      <tr>
        <td colspan="4" style="text-align: right; font-weight: bold;">TOTAL:</td>
        <td style="text-align: right;">${document.getElementById("total").textContent}</td>
      </tr>
    `;

    tableContent += "</table>";

    const header = `<h1>Proforma</h1>`;
    const style = `
      <style>
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #000; padding: 8px; text-align: center; }
        th { background-color: #f7e8d0; }
        td { text-align: right; }
      </style>
    `;
    const content = `
      <!DOCTYPE html>
      <html>
      <head>${style}</head>
      <body>${header}${tableContent}</body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Proforma.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  addRowButton.addEventListener("click", addRow);
  attachEventListeners();
  updateRowNumbers();
});
