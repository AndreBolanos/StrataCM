// ----- Global Functions -----

function loadPage(page) {
  console.log('Loading page:', page);

  $('#main-content').load(page, function () {
    if (page === 'pages/dashboard.html') {
      initDashboard();
    }

    const cleanPage = page.split('?')[0];

    if (cleanPage.startsWith('pages/case/')) {
      showCaseSidebar();
    } else {
      showMainSidebar();
    }

    highlightCaseSidebarLink(cleanPage);
  });
}

function showCaseSidebar() {
  $('#mainSidebar').addClass('sidebar-hidden');
  $('#caseSidebar').removeClass('sidebar-hidden');
}

function showMainSidebar() {
  $('#mainSidebar').removeClass('sidebar-hidden');
  $('#caseSidebar').addClass('sidebar-hidden');
}

function highlightCaseSidebarLink(cleanPage) {
  $('#caseSidebar .nav-link').removeClass('active');

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
    scrollY: '42vh',
    scrollCollapse: true,
    paging: true,
    searching: true,
    ordering: true
  });

  // Handle claim link clicks
  $(document).on('click', '.claim-link', function (e) {
    e.preventDefault();
    const claimId = $(this).data('claim-id');
    loadPage(`pages/case/case-info.html?claim=${claimId}`);
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
  // Load default dashboard
  loadPage('pages/dashboard.html');

  // Sidebar nav link click (main + case)
  $(document).on('click', '.nav-link', function (e) {
    e.preventDefault();
    $('.nav-link').removeClass('active');
    $(this).addClass('active');

    const page = $(this).data('page');
    if (page) {
      loadPage(page);
    }
  });

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
