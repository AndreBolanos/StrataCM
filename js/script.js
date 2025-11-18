// Global delegated navigation handler
$(document).on('click', '.nav-link[data-page], .nav-trigger', function (e) {
  e.preventDefault();

  if (!requireLogin()) return;

  const page = $(this).data('page');
  if (!page) return;

  // visual highlight
  $('.nav-link').removeClass('active');
  $(this).addClass('active');

  loadPage(page);
});


// ----- Auth Functions -----

function isLoggedIn() {
  return localStorage.getItem("loggedIn") === "true";
}

function requireLogin() {
  if (!isLoggedIn()) {

    // Hide both sidebars when user is NOT logged in
    $('#mainSidebar, #caseSidebar').css({
      opacity: 0,
      transform: 'translateX(-100%)',
      pointerEvents: 'none'
    });

    loadPage('pages/login.html');
    return false;
  }
  return true;
}


function logout() {
  localStorage.removeItem("loggedIn");

  // Hide both sidebars immediately on logout
  $('#mainSidebar, #caseSidebar').css({
    opacity: 0,
    transform: 'translateX(-100%)',
    pointerEvents: 'none'
  });

  loadPage('pages/login.html');
}



// ----- Global Functions -----

function loadPage(page) {
  console.log('Loading page:', page);

  $('#main-content').load(page + '?_=' + new Date().getTime(), function () {

    // If login page is loaded, activate login button
    if (page === 'pages/login.html') {

      $('#main-content').addClass('login-active');

      // LOGIN BUTTON CLICK
      $('#loginBtn').click(function () {
        const user = $('#loginUser').val().trim();
        const pass = $('#loginPass').val().trim();

        if (user === "admin" && pass === "123") {
          localStorage.setItem("loggedIn", "true");

          $('#mainSidebar').css({
            opacity: '1',
            transform: 'translateX(0)',
            pointerEvents: 'auto'
          });

          loadPage('pages/dashboard.html');
        }
        else {
          $('#loginError').removeClass('d-none');
          $('#loginUser').val('');
          $('#loginPass').val('');
          $('#loginUser').focus();
        }
      });

      // 👉 ENTER KEY SUBMIT ON PASSWORD FIELD
      $('#loginPass').on('keypress', function (e) {
        if (e.key === "Enter") {
          $('#loginBtn').click();
        }
      });
    }

    if (page !== 'pages/login.html') {
      $('#main-content').removeClass('login-active');
    }
    if (page === 'pages/dashboard.html') {
      setTimeout(() => initDashboard(), 10);
    }


    if (page === 'pages/case/case-tasks.html') {
      initTaskDetail();
    }

    const cleanPage = page.split('?')[0];

    if (!isLoggedIn()) return;

    if (cleanPage.startsWith('pages/case/')) {
      showCaseSidebar();
    } else {
      showMainSidebar();
    }

    highlightCaseSidebarLink(cleanPage);
  });
}

function showCaseSidebar() {
  // Hide main sidebar
  $('#mainSidebar').css({
    opacity: 0,
    transform: 'translateX(-100%)',
    pointerEvents: 'none'
  });

  // Show case sidebar
  $('#caseSidebar').css({
    opacity: 1,
    transform: 'translateX(0)',
    pointerEvents: 'auto'
  });
}


function showMainSidebar() {
  // Hide case sidebar
  $('#caseSidebar').css({
    opacity: 0,
    transform: 'translateX(-100%)',
    pointerEvents: 'none'
  });

  // Show main sidebar
  $('#mainSidebar').css({
    opacity: 1,
    transform: 'translateX(0)',
    pointerEvents: 'auto'
  });
}


function highlightCaseSidebarLink(cleanPage) {
  $('#caseSidebar .nav-link').removeClass('active');
  if (cleanPage == 'pages/case/task-detail.html') {
    cleanPage = 'pages/case/case-tasks.html';
  }

  $('#caseSidebar .nav-link').each(function () {
    const linkPage = $(this).data('page');
    if (cleanPage === linkPage) {
      $(this).addClass('active');
    }
  });
}

function exitToDashboard() {
  showMainSidebar();
  loadPage('pages/dashboard.html');
}

// ----- Initialize Dashboard -----

function initDashboard() {
  $('#dashboardTable').DataTable({
    columnDefs: [{ orderable: false, targets: 0 }],
    order: [[10, 'desc']],
    paging: true,
    searching: true,
    ordering: true,
    responsive: false,
    scrollCollapse: true
  });



  // Handle claim link clicks
  // Global variable to hold current claim
  window.currentClaimId = null;
  window.currentTaskId = null;

  // Handle claim link clicks
  $(document).on('click', '.claim-link', function (e) {
    e.preventDefault();
    const claimId = $(this).data('claim-id');
    window.currentClaimId = claimId;
    loadPage("pages/case/case-info.html");
  });

  $(document).on('click', '.task-link', function (e) {
    e.preventDefault();
    const taskId = $(this).data('task-id');
    window.currentTaskId = taskId;
    const claimId = $(this).data('claim-id');
    window.currentClaimId = claimId;  // store the task number globally
    loadPage("pages/case/task-detail.html"); // 👈 go to task detail page
  });

}

function initTaskDetail() {
  $('#taskListTable').DataTable({
    columnDefs: [{ orderable: false, targets: 0 }],
    order: [[5, 'desc']],
    paging: true,
    searching: true,
    ordering: true,
    responsive: false,
    scrollCollapse: true
  });

}

function showSaveAlert(callback) {
  const alertHtml = `
    <div class="alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-4" role="alert" style="z-index: 9999; min-width: 300px;">
      Case saved successfully!
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  $('body').append(alertHtml);

  // Auto-dismiss after 2 seconds
  setTimeout(() => {
    $('.alert').alert('close');
    if (typeof callback === 'function') {
      callback(); // Call callback after alert closes (used by Save & Exit)
    }
  }, 1000);
}

// ----- DOM Ready -----

$(document).ready(function () {

  $('#saveAndExitBtn').click(function () {
    console.log('Saving case...');
    $('#exitModal').modal('hide');

    showSaveAlert(() => {
      exitToDashboard();
    });
  });

  $('#exitOnlyBtn').click(function () {
    $('#exitModal').modal('hide');
    exitToDashboard();
  });
  // Check login first
  if (!requireLogin()) return;

  loadPage('pages/dashboard.html');

  // Exit modal buttons
  $('#saveAndExitBtn').click(function () {
    console.log('Saving case...');
    $('#exitModal').modal('hide');

    showSaveAlert(() => {
      exitToDashboard();
    });
  });


  $('#exitOnlyBtn').click(function () {
    $('#exitModal').modal('hide');
    exitToDashboard();
  });

  // Optional: Back to dashboard from inside a case
  $(document).on('click', '#backToDashboard', function () {
    exitToDashboard();
  });

  // Save button only (on page)
  $(document).on('click', '#saveBtn', function () {
    showSaveAlert();
  });

});


// tasks-render.js

function loadTableTaskDate() {
  const tbody = document.querySelector("#dashboardTable tbody");

  window.tasksData.forEach(task => {
    const row = document.createElement("tr");
    row.classList.add("task-row", task.status);

    row.innerHTML = `
      <td><div class="status-indicator ${task.status}"></div></td>
      <td><a href="#" class="task-link" data-task-id="${task.taskNumber}" data-claim-id="${task.claimNumber}">${task.taskNumber}</a></td>
      <td>${task.taskType}</td>
      <td>${task.clientName}</td>
      <td>${task.claimantName}</td>
      <td>${task.workStatus}</td>
      <td><a href="#" class="claim-link" data-claim-id="${task.claimNumber}">${task.claimNumber}</a></td>
      <td>${task.state}</td>
      <td>${task.taskStatus}</td>
      <td>${task.adjusterName}</td>
      <td>${task.nurseAssigned}</td>
      <td>${task.dueDate}</td>
      <td>${task.assignedBy}</td>
    `;

    tbody.appendChild(row);
  });
};

// tasks-data.js

function generateTaskNumber(seq) {
  return `T-2025-${String(seq).padStart(7, "0")}`;
}

window.tasksData = [
  {
    status: "urgent",
    taskNumber: generateTaskNumber(1000001),
    taskType: "MMI",
    clientName: "Archdioceses of New Orleans",
    claimantName: "MICHAEL JONES",
    workStatus: "MODDUTY",
    claimNumber: "25050M687291",
    state: "CA",
    taskStatus: "Open",
    adjusterName: "John Pinkman",
    nurseAssigned: "John Davies",
    dueDate: "2025-05-22",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "overdue",
    taskNumber: generateTaskNumber(1000002),
    taskType: "FOLLOWUP",
    clientName: "RYDER",
    claimantName: "JACK FULLER",
    workStatus: "TERM-NO",
    claimNumber: "1M01M01773",
    state: "TX",
    taskStatus: "Open",
    adjusterName: "Laura Megan",
    nurseAssigned: "John Davies",
    dueDate: "2025-04-15",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "urgent",
    taskNumber: generateTaskNumber(1000003),
    taskType: "MEDFAX",
    clientName: "TSA",
    claimantName: "RANDY BANKS",
    workStatus: "MODDUTY",
    claimNumber: "AR10743",
    state: "CA",
    taskStatus: "Assigned",
    adjusterName: "Lisa Fuller",
    nurseAssigned: "John Davies",
    dueDate: "2025-05-22",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "pending",
    taskNumber: generateTaskNumber(1000004),
    taskType: "INTAKE",
    clientName: "DELTA AIRLINES",
    claimantName: "SARAH CONNOR",
    workStatus: "FULLDUTY",
    claimNumber: "DLA22311",
    state: "GA",
    taskStatus: "Pending",
    adjusterName: "Mike Harris",
    nurseAssigned: "Laura Smith",
    dueDate: "2025-06-10",
    assignedBy: "Robert King"
  },
  {
    status: "urgent",
    taskNumber: generateTaskNumber(1000005),
    taskType: "REFERRAL",
    clientName: "GENERAL MOTORS",
    claimantName: "PETER GABRIEL",
    workStatus: "LOA",
    claimNumber: "GM551134",
    state: "MI",
    taskStatus: "Open",
    adjusterName: "Rachel Adams",
    nurseAssigned: "John Davies",
    dueDate: "2025-05-05",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "overdue",
    taskNumber: generateTaskNumber(1000006),
    taskType: "MMI",
    clientName: "CISCO",
    claimantName: "LARRY PAGE",
    workStatus: "MODDUTY",
    claimNumber: "CS88931",
    state: "CA",
    taskStatus: "Open",
    adjusterName: "John Pinkman",
    nurseAssigned: "Laura Smith",
    dueDate: "2025-04-20",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "pending",
    taskNumber: generateTaskNumber(1000007),
    taskType: "FOLLOWUP",
    clientName: "VERIZON",
    claimantName: "ANNA LEE",
    workStatus: "FULLDUTY",
    claimNumber: "VZ923001",
    state: "NY",
    taskStatus: "Pending",
    adjusterName: "Chris Howard",
    nurseAssigned: "John Davies",
    dueDate: "2025-06-01",
    assignedBy: "Robert King"
  },
  {
    status: "urgent",
    taskNumber: generateTaskNumber(1000008),
    taskType: "REFERRAL",
    clientName: "AT&T",
    claimantName: "JASON BOURNE",
    workStatus: "LOA",
    claimNumber: "ATT3321",
    state: "TX",
    taskStatus: "Assigned",
    adjusterName: "Laura Megan",
    nurseAssigned: "Laura Smith",
    dueDate: "2025-05-15",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "overdue",
    taskNumber: generateTaskNumber(1000009),
    taskType: "INTAKE",
    clientName: "FORD",
    claimantName: "CHRIS EVANS",
    workStatus: "TERM-NO",
    claimNumber: "FD334122",
    state: "MI",
    taskStatus: "Open",
    adjusterName: "Mike Harris",
    nurseAssigned: "John Davies",
    dueDate: "2025-04-28",
    assignedBy: "Robert King"
  },
  {
    status: "urgent",
    taskNumber: generateTaskNumber(1000010),
    taskType: "MMI",
    clientName: "APPLE",
    claimantName: "TIM COOK",
    workStatus: "MODDUTY",
    claimNumber: "AP99821",
    state: "CA",
    taskStatus: "Open",
    adjusterName: "Rachel Adams",
    nurseAssigned: "Laura Smith",
    dueDate: "2025-05-30",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "pending",
    taskNumber: generateTaskNumber(1000011),
    taskType: "MEDFAX",
    clientName: "MICROSOFT",
    claimantName: "BILL GATES",
    workStatus: "FULLDUTY",
    claimNumber: "MS22312",
    state: "WA",
    taskStatus: "Pending",
    adjusterName: "Lisa Fuller",
    nurseAssigned: "John Davies",
    dueDate: "2025-06-15",
    assignedBy: "Robert King"
  },
  {
    status: "overdue",
    taskNumber: generateTaskNumber(1000012),
    taskType: "FOLLOWUP",
    clientName: "TESLA",
    claimantName: "ELON MUSK",
    workStatus: "LOA",
    claimNumber: "TS99121",
    state: "NV",
    taskStatus: "Open",
    adjusterName: "John Pinkman",
    nurseAssigned: "Laura Smith",
    dueDate: "2025-04-12",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "urgent",
    taskNumber: generateTaskNumber(1000013),
    taskType: "REFERRAL",
    clientName: "NESTLE",
    claimantName: "AMY ADAMS",
    workStatus: "MODDUTY",
    claimNumber: "NE332221",
    state: "IL",
    taskStatus: "Assigned",
    adjusterName: "Chris Howard",
    nurseAssigned: "John Davies",
    dueDate: "2025-05-18",
    assignedBy: "Robert King"
  },
  {
    status: "pending",
    taskNumber: generateTaskNumber(1000014),
    taskType: "INTAKE",
    clientName: "COCA COLA",
    claimantName: "TOM HANKS",
    workStatus: "FULLDUTY",
    claimNumber: "CC99122",
    state: "GA",
    taskStatus: "Pending",
    adjusterName: "Rachel Adams",
    nurseAssigned: "Laura Smith",
    dueDate: "2025-06-08",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "urgent",
    taskNumber: generateTaskNumber(1000015),
    taskType: "MMI",
    clientName: "IBM",
    claimantName: "MORGAN FREEMAN",
    workStatus: "LOA",
    claimNumber: "IB88311",
    state: "NY",
    taskStatus: "Open",
    adjusterName: "Mike Harris",
    nurseAssigned: "John Davies",
    dueDate: "2025-05-25",
    assignedBy: "Robert King"
  },
  {
    status: "pending",
    taskNumber: generateTaskNumber(1000016),
    taskType: "FOLLOWUP",
    clientName: "SONY",
    claimantName: "LEONARDO DICAPRIO",
    workStatus: "TERM-NO",
    claimNumber: "SN121122",
    state: "CA",
    taskStatus: "Pending",
    adjusterName: "Laura Megan",
    nurseAssigned: "Laura Smith",
    dueDate: "2025-06-18",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "overdue",
    taskNumber: generateTaskNumber(1000017),
    taskType: "INTAKE",
    clientName: "ORACLE",
    claimantName: "MATT DAMON",
    workStatus: "MODDUTY",
    claimNumber: "OR55431",
    state: "TX",
    taskStatus: "Open",
    adjusterName: "Rachel Adams",
    nurseAssigned: "John Davies",
    dueDate: "2025-04-09",
    assignedBy: "Robert King"
  },
  {
    status: "urgent",
    taskNumber: generateTaskNumber(1000018),
    taskType: "REFERRAL",
    clientName: "NIKE",
    claimantName: "SERENA WILLIAMS",
    workStatus: "FULLDUTY",
    claimNumber: "NK44321",
    state: "OR",
    taskStatus: "Assigned",
    adjusterName: "Mike Harris",
    nurseAssigned: "Laura Smith",
    dueDate: "2025-05-20",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "pending",
    taskNumber: generateTaskNumber(1000019),
    taskType: "MEDFAX",
    clientName: "ADOBE",
    claimantName: "KEANU REEVES",
    workStatus: "LOA",
    claimNumber: "AD66211",
    state: "CA",
    taskStatus: "Pending",
    adjusterName: "Chris Howard",
    nurseAssigned: "John Davies",
    dueDate: "2025-06-22",
    assignedBy: "Robert King"
  },
  {
    status: "urgent",
    taskNumber: generateTaskNumber(1000020),
    taskType: "MMI",
    clientName: "AMAZON",
    claimantName: "JEFF BEZOS",
    workStatus: "MODDUTY",
    claimNumber: "AM11234",
    state: "WA",
    taskStatus: "Open",
    adjusterName: "Laura Megan",
    nurseAssigned: "Laura Smith",
    dueDate: "2025-05-27",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "overdue",
    taskNumber: generateTaskNumber(1000021),
    taskType: "FOLLOWUP",
    clientName: "META",
    claimantName: "MARK ZUCKERBERG",
    workStatus: "FULLDUTY",
    claimNumber: "MT77889",
    state: "CA",
    taskStatus: "Open",
    adjusterName: "John Pinkman",
    nurseAssigned: "John Davies",
    dueDate: "2025-04-25",
    assignedBy: "Robert King"
  },
  {
    status: "urgent",
    taskNumber: generateTaskNumber(1000022),
    taskType: "REFERRAL",
    clientName: "NETFLIX",
    claimantName: "RYAN REYNOLDS",
    workStatus: "LOA",
    claimNumber: "NF44521",
    state: "CA",
    taskStatus: "Assigned",
    adjusterName: "Lisa Fuller",
    nurseAssigned: "Laura Smith",
    dueDate: "2025-05-12",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "pending",
    taskNumber: generateTaskNumber(1000023),
    taskType: "INTAKE",
    clientName: "DISNEY",
    claimantName: "EMMA WATSON",
    workStatus: "FULLDUTY",
    claimNumber: "DS99112",
    state: "FL",
    taskStatus: "Pending",
    adjusterName: "Mike Harris",
    nurseAssigned: "John Davies",
    dueDate: "2025-06-28",
    assignedBy: "Robert King"
  },
  {
    status: "urgent",
    taskNumber: generateTaskNumber(1000024),
    taskType: "MEDFAX",
    clientName: "STARBUCKS",
    claimantName: "OPRAH WINFREY",
    workStatus: "MODDUTY",
    claimNumber: "SB88771",
    state: "WA",
    taskStatus: "Open",
    adjusterName: "Rachel Adams",
    nurseAssigned: "Laura Smith",
    dueDate: "2025-05-16",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "overdue",
    taskNumber: generateTaskNumber(1000025),
    taskType: "MMI",
    clientName: "UBER",
    claimantName: "TRAVIS KALANICK",
    workStatus: "TERM-NO",
    claimNumber: "UB99322",
    state: "NY",
    taskStatus: "Open",
    adjusterName: "John Pinkman",
    nurseAssigned: "John Davies",
    dueDate: "2025-04-18",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "pending",
    taskNumber: generateTaskNumber(1000026),
    taskType: "FOLLOWUP",
    clientName: "LYFT",
    claimantName: "LOGAN GREEN",
    workStatus: "FULLDUTY",
    claimNumber: "LF22133",
    state: "CA",
    taskStatus: "Pending",
    adjusterName: "Laura Megan",
    nurseAssigned: "Laura Smith",
    dueDate: "2025-06-05",
    assignedBy: "Robert King"
  },
  {
    status: "urgent",
    taskNumber: generateTaskNumber(1000027),
    taskType: "REFERRAL",
    clientName: "SPACEX",
    claimantName: "GWYNNE SHOTWELL",
    workStatus: "MODDUTY",
    claimNumber: "SX88721",
    state: "TX",
    taskStatus: "Assigned",
    adjusterName: "Chris Howard",
    nurseAssigned: "John Davies",
    dueDate: "2025-05-08",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "overdue",
    taskNumber: generateTaskNumber(1000028),
    taskType: "INTAKE",
    clientName: "PFIZER",
    claimantName: "ALBERT BOURLA",
    workStatus: "LOA",
    claimNumber: "PZ77621",
    state: "NJ",
    taskStatus: "Open",
    adjusterName: "Mike Harris",
    nurseAssigned: "Laura Smith",
    dueDate: "2025-04-30",
    assignedBy: "Robert King"
  },
  {
    status: "urgent",
    taskNumber: generateTaskNumber(1000029),
    taskType: "MMI",
    clientName: "MODERNA",
    claimantName: "STEPHANE BANCEL",
    workStatus: "FULLDUTY",
    claimNumber: "MD66112",
    state: "MA",
    taskStatus: "Open",
    adjusterName: "Rachel Adams",
    nurseAssigned: "John Davies",
    dueDate: "2025-05-14",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "pending",
    taskNumber: generateTaskNumber(1000030),
    taskType: "MEDFAX",
    clientName: "JOHNSON & JOHNSON",
    claimantName: "ALEX GORSKY",
    workStatus: "MODDUTY",
    claimNumber: "JJ55123",
    state: "NJ",
    taskStatus: "Pending",
    adjusterName: "Lisa Fuller",
    nurseAssigned: "Laura Smith",
    dueDate: "2025-06-12",
    assignedBy: "Robert King"
  },
  {
    status: "urgent",
    taskNumber: generateTaskNumber(1000031),
    taskType: "FOLLOWUP",
    clientName: "WALMART",
    claimantName: "SAM WALTON JR",
    workStatus: "LOA",
    claimNumber: "WM11232",
    state: "AR",
    taskStatus: "Open",
    adjusterName: "Mike Harris",
    nurseAssigned: "John Davies",
    dueDate: "2025-05-21",
    assignedBy: "Danielle Mayo"
  },
  {
    status: "overdue",
    taskNumber: generateTaskNumber(1000032),
    taskType: "REFERRAL",
    clientName: "TARGET",
    claimantName: "BRIAN CORNELL",
    workStatus: "TERM-NO",
    claimNumber: "TG44122",
    state: "MN",
    taskStatus: "Open",
    adjusterName: "Chris Howard",
    nurseAssigned: "Laura Smith",
    dueDate: "2025-04-14",
    assignedBy: "Robert King"
  },
  {
    status: "pending",
    taskNumber: generateTaskNumber(1000033),
    taskType: "MMI",
    clientName: "COSTCO",
    claimantName: "JAMES SINEGAL",
    workStatus: "MODDUTY",
    claimNumber: "CC44221",
    state: "WA",
    taskStatus: "Pending",
    adjusterName: "Rachel Adams",
    nurseAssigned: "John Davies",
    dueDate: "2025-06-03",
    assignedBy: "Danielle Mayo"
  }
  // ➝ continue with all your other tasks
];


// Function to get query parameters

// On page load, set claim number
function fetchClaimNumber() {
  if (window.currentClaimId) {
    document.getElementById("claimNumber").textContent = window.currentClaimId;
  }
}

function fetchTaskNumber() {
  if (window.currentTaskId) {
    document.getElementById("taskNumber-value").value = window.currentTaskId;
  }
}


function loadTableMainTaskList() {
  const tbody = document.querySelector("#taskListTable tbody");
  tbody.innerHTML = ""; // clear old rows

  // Example: map statuses to priorities for realism
  const priorityMap = {
    urgent: "High",
    overdue: "Critical",
    pending: "Normal",
  };

  window.tasksData.forEach((task, index) => {
    const row = document.createElement("tr");

    // Fake realistic created/modified timestamps
    const createdDate = new Date(2025, 3, 10 + (index % 15), 9, 30);
    const modifiedDate = new Date(createdDate.getTime() + 1000 * 60 * 60 * 24 * (index % 5));

    const formatDate = (date) =>
      date.toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

    // Each row’s HTML
    row.innerHTML = `
      <td>${task.taskNumber}</td>
      <td>${task.taskType}</td>
      <td>${task.nurseAssigned}</td>
      <td>${task.taskStatus}</td>
      <td>${priorityMap[task.status] || "Normal"}</td>
      <td>${formatDate(new Date(task.dueDate))}</td>
      <td>${task.assignedBy}</td>
      <td>${formatDate(createdDate)}</td>
      <td>${task.adjusterName}</td>
      <td>${formatDate(modifiedDate)}</td>
      <td>
        <div class="btn-group btn-group-sm" role="group">
          <button class="btn btn-outline-primary view-task" data-task-id="${task.taskNumber}" title="View Task">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-outline-secondary edit-task task-link" data-task-id="${task.taskNumber}" data-claim-id="${task.claimNumber}" title="Edit Task">
            <i class="bi bi-pencil"></i>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(row);
  });
}

