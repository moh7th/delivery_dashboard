/**
 * GreyAtom Logistics Pvt. Ltd. - Internal Operations Tools Team
 * Delivery Exception Management Dashboard (Version 1.0)
 *
 * Core Vanilla JavaScript Implementation:
 * - DOM Element Selection via document.querySelector / querySelectorAll
 * - Form Validation & Real-time Error Feedback
 * - Dynamic DOM Node Creation (createElement, appendChild)
 * - Event Delegation for Table Row Actions (Resolve, Delete)
 * - DOM-based Multi-criteria Filtering (Type & Status)
 * - KPI Summary Counters
 *
 * Note: No frameworks, no external libraries, no browser storage, no APIs.
 */

// Wait for DOM content to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // -------------------------------------------------------------------------
  // DOM Elements
  // -------------------------------------------------------------------------
  var form = document.querySelector("#exceptionForm");
  var deliveryIdInput = document.querySelector("#deliveryId");
  var customerNameInput = document.querySelector("#customerName");
  var issueTypeSelect = document.querySelector("#issueType");
  var notesTextarea = document.querySelector("#notes");

  var deliveryIdError = document.querySelector("#deliveryIdError");
  var customerNameError = document.querySelector("#customerNameError");
  var issueTypeError = document.querySelector("#issueTypeError");
  var priorityError = document.querySelector("#priorityError");

  var tableBody = document.querySelector("#exceptionsTableBody");
  var emptyState = document.querySelector("#emptyState");

  var filterType = document.querySelector("#filterType");
  var filterStatus = document.querySelector("#filterStatus");

  var totalCountElem = document.querySelector("#totalCount");
  var openCountElem = document.querySelector("#openCount");
  var resolvedCountElem = document.querySelector("#resolvedCount");

  // -------------------------------------------------------------------------
  // Helper: Create & Append Exception Row
  // -------------------------------------------------------------------------
  function addExceptionRow(deliveryId, customerName, issueType, priority, status, notes) {
    var row = document.createElement("tr");

    // Store attributes for filtering
    row.setAttribute("data-issue-type", issueType);
    row.setAttribute("data-status", status);
    row.setAttribute("data-priority", priority);

    // Apply High-Priority warning highlight
    if (priority === "High") {
      row.classList.add("row-high-priority");
    }

    // Apply Resolved visual state if resolved
    if (status === "Resolved") {
      row.classList.add("row-resolved");
    }

    // 1. Delivery ID Cell
    var cellId = document.createElement("td");
    cellId.className = "col-id cell-delivery-id";
    cellId.textContent = deliveryId;
    row.appendChild(cellId);

    // 2. Customer Name Cell (with optional notes)
    var cellCustomer = document.createElement("td");
    cellCustomer.className = "col-customer cell-customer";

    var customerNameSpan = document.createElement("span");
    customerNameSpan.textContent = customerName;
    cellCustomer.appendChild(customerNameSpan);

    if (notes && notes.trim() !== "") {
      var notesSpan = document.createElement("span");
      notesSpan.className = "customer-notes";
      notesSpan.textContent = notes.trim();
      cellCustomer.appendChild(notesSpan);
    }
    row.appendChild(cellCustomer);

    // 3. Issue Type Cell
    var cellType = document.createElement("td");
    cellType.className = "col-type";
    cellType.textContent = issueType;
    row.appendChild(cellType);

    // 4. Priority Cell (with badge)
    var cellPriority = document.createElement("td");
    cellPriority.className = "col-priority";
    var priorityBadge = document.createElement("span");
    priorityBadge.className = "badge badge-priority-" + priority.toLowerCase();
    priorityBadge.textContent = priority;
    cellPriority.appendChild(priorityBadge);
    row.appendChild(cellPriority);

    // 5. Status Cell (with badge)
    var cellStatus = document.createElement("td");
    cellStatus.className = "col-status status-cell";
    var statusBadge = document.createElement("span");
    statusBadge.className = "badge badge-status-" + status.toLowerCase();
    statusBadge.textContent = status;
    cellStatus.appendChild(statusBadge);
    row.appendChild(cellStatus);

    // 6. Actions Cell (Resolve and Delete buttons)
    var cellActions = document.createElement("td");
    cellActions.className = "col-actions";

    var actionsContainer = document.createElement("div");
    actionsContainer.className = "action-buttons";

    // Resolve Button
    var resolveBtn = document.createElement("button");
    resolveBtn.type = "button";
    resolveBtn.className = "btn-action btn-resolve";
    if (status === "Resolved") {
      resolveBtn.textContent = "Resolved";
      resolveBtn.disabled = true;
      resolveBtn.classList.add("disabled");
    } else {
      resolveBtn.textContent = "Resolve";
    }
    actionsContainer.appendChild(resolveBtn);

    // Delete Button
    var deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-action btn-delete";
    deleteBtn.textContent = "Delete";
    actionsContainer.appendChild(deleteBtn);

    cellActions.appendChild(actionsContainer);
    row.appendChild(cellActions);

    // Append newly constructed row to table body
    tableBody.appendChild(row);

    // Update KPI metrics and re-apply active filters
    updateCounters();
    applyFilters();
  }

  // -------------------------------------------------------------------------
  // KPI Metrics Counter
  // -------------------------------------------------------------------------
  function updateCounters() {
    var allRows = tableBody.querySelectorAll("tr");
    var total = allRows.length;
    var open = 0;
    var resolved = 0;

    for (var i = 0; i < allRows.length; i++) {
      var currentStatus = allRows[i].getAttribute("data-status");
      if (currentStatus === "Open") {
        open++;
      } else if (currentStatus === "Resolved") {
        resolved++;
      }
    }

    totalCountElem.textContent = total;
    openCountElem.textContent = open;
    resolvedCountElem.textContent = resolved;
  }

  // -------------------------------------------------------------------------
  // Filter Management (DOM Show/Hide)
  // -------------------------------------------------------------------------
  function applyFilters() {
    var selectedType = filterType.value;
    var selectedStatus = filterStatus.value;
    var allRows = tableBody.querySelectorAll("tr");
    var visibleRowCount = 0;

    for (var i = 0; i < allRows.length; i++) {
      var row = allRows[i];
      var rowType = row.getAttribute("data-issue-type");
      var rowStatus = row.getAttribute("data-status");

      var matchesType = (selectedType === "ALL" || rowType === selectedType);
      var matchesStatus = (selectedStatus === "ALL" || rowStatus === selectedStatus);

      if (matchesType && matchesStatus) {
        row.classList.remove("hidden-row");
        visibleRowCount++;
      } else {
        row.classList.add("hidden-row");
      }
    }

    // Toggle empty state message
    if (visibleRowCount === 0) {
      emptyState.style.display = "block";
    } else {
      emptyState.style.display = "none";
    }
  }

  // Filter change event listeners
  filterType.addEventListener("change", applyFilters);
  filterStatus.addEventListener("change", applyFilters);

  // -------------------------------------------------------------------------
  // Form Validation & Submission
  // -------------------------------------------------------------------------
  function clearErrors() {
    deliveryIdError.textContent = "";
    customerNameError.textContent = "";
    issueTypeError.textContent = "";
    priorityError.textContent = "";

    deliveryIdInput.classList.remove("input-error");
    customerNameInput.classList.remove("input-error");
    issueTypeSelect.classList.remove("input-error");
  }

  // Input listeners to clear errors on user interaction
  deliveryIdInput.addEventListener("input", function () {
    if (deliveryIdInput.value.trim() !== "") {
      deliveryIdError.textContent = "";
      deliveryIdInput.classList.remove("input-error");
    }
  });

  customerNameInput.addEventListener("input", function () {
    if (customerNameInput.value.trim() !== "") {
      customerNameError.textContent = "";
      customerNameInput.classList.remove("input-error");
    }
  });

  issueTypeSelect.addEventListener("change", function () {
    if (issueTypeSelect.value !== "") {
      issueTypeError.textContent = "";
      issueTypeSelect.classList.remove("input-error");
    }
  });

  var priorityRadios = document.querySelectorAll('input[name="priority"]');
  for (var r = 0; r < priorityRadios.length; r++) {
    priorityRadios[r].addEventListener("change", function () {
      priorityError.textContent = "";
    });
  }

  form.addEventListener("submit", function (e) {
    // Prevent default browser form submission / page reload
    e.preventDefault();

    clearErrors();

    var deliveryIdVal = deliveryIdInput.value.trim();
    var customerNameVal = customerNameInput.value.trim();
    var issueTypeVal = issueTypeSelect.value;
    var selectedPriorityRadio = document.querySelector('input[name="priority"]:checked');
    var notesVal = notesTextarea.value.trim();

    var isValid = true;

    // Validate Delivery ID
    if (!deliveryIdVal) {
      deliveryIdError.textContent = "Delivery ID is required (e.g., DEL-10492).";
      deliveryIdInput.classList.add("input-error");
      isValid = false;
    }

    // Validate Customer Name
    if (!customerNameVal) {
      customerNameError.textContent = "Customer Name is required.";
      customerNameInput.classList.add("input-error");
      isValid = false;
    }

    // Validate Issue Type
    if (!issueTypeVal) {
      issueTypeError.textContent = "Please select an issue type.";
      issueTypeSelect.classList.add("input-error");
      isValid = false;
    }

    // Validate Priority
    if (!selectedPriorityRadio) {
      priorityError.textContent = "Please choose a priority level.";
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    var priorityVal = selectedPriorityRadio.value;

    // Dynamically add new exception to dashboard table (default status: "Open")
    addExceptionRow(deliveryIdVal, customerNameVal, issueTypeVal, priorityVal, "Open", notesVal);

    // Reset form fields
    form.reset();
    clearErrors();

    // Focus back on delivery ID for fast entry workflow
    deliveryIdInput.focus();
  });

  // -------------------------------------------------------------------------
  // Event Delegation for Table Actions (Resolve & Delete)
  // -------------------------------------------------------------------------
  tableBody.addEventListener("click", function (e) {
    var target = e.target;

    // Check if clicked element is or is inside Resolve Button
    var resolveBtn = target.closest(".btn-resolve");
    if (resolveBtn && !resolveBtn.disabled) {
      var row = resolveBtn.closest("tr");
      if (!row) return;

      // Update status to Resolved
      row.setAttribute("data-status", "Resolved");

      // Visually indicate resolved state (green background / muted row styling)
      row.classList.add("row-resolved");

      // Update status cell badge
      var statusCell = row.querySelector(".status-cell");
      if (statusCell) {
        statusCell.innerHTML = "";
        var resolvedBadge = document.createElement("span");
        resolvedBadge.className = "badge badge-status-resolved";
        resolvedBadge.textContent = "Resolved";
        statusCell.appendChild(resolvedBadge);
      }

      // Disable button after resolving
      resolveBtn.textContent = "Resolved";
      resolveBtn.disabled = true;
      resolveBtn.classList.add("disabled");

      // Update metrics & maintain filters
      updateCounters();
      applyFilters();
      return;
    }

    // Check if clicked element is or is inside Delete Button
    var deleteBtn = target.closest(".btn-delete");
    if (deleteBtn) {
      var rowToDelete = deleteBtn.closest("tr");
      if (!rowToDelete) return;

      var delIdCell = rowToDelete.querySelector(".cell-delivery-id");
      var deliveryIdText = delIdCell ? delIdCell.textContent : "this record";

      // Show confirmation prompt before deletion
      var confirmDelete = confirm("Are you sure you want to delete exception record for " + deliveryIdText + "?");
      if (confirmDelete) {
        // Remove record from table
        rowToDelete.remove();

        // Update metrics & maintain filters
        updateCounters();
        applyFilters();
      }
      return;
    }
  });

  // -------------------------------------------------------------------------
  // Initialize Preloaded Mock Data (Company Operations Baseline)
  // -------------------------------------------------------------------------
  addExceptionRow(
    "DEL-98421",
    "Vikram Malhotra",
    "Address Not Found",
    "High",
    "Open",
    "Building wing number missing; recipient unreachable via call."
  );

  addExceptionRow(
    "DEL-87235",
    "Pooja Sengupta",
    "Customer Not Available",
    "Medium",
    "Open",
    "Security denied entry; resident away until 6:00 PM."
  );

  addExceptionRow(
    "DEL-76510",
    "Arjun Nair",
    "Package Damaged",
    "High",
    "Open",
    "Outer carton seal ruptured during transit from Hub-4."
  );

  addExceptionRow(
    "DEL-65492",
    "Neha Sharma",
    "Payment Issue",
    "Low",
    "Resolved",
    "COD cash discrepancy verified and payment settled via UPI."
  );
});

