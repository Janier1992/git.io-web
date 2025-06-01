// Credenciales de administrador
const validUsers = [
    { user: "Janier", pass: "admin", role: "Admin. Principal", initial: "J" },
    { user: "Gean", pass: "admin1", role: "Admin. Secundario", initial: "G" },
    { user: "Campo", pass: "123456", role: "Usuario Estándar", initial: "C" },
    { user: "Juan", pass: "supervisor", role: "Supervisor", initial: "S" } // Supervisor para el ejemplo del sidebar
];

// Datos de ejemplo para la biblioteca de archivos
let documentsData = [
    { id: 1, name: "Manual de Procesos - Perfilería", type: "Manual", date: "2025-04-12", sizeMB: 2.3, rawSize: 2.3 * 1024 * 1024, path: "docs/manual_perfileria.pdf" },
    { id: 2, name: "Instructivo de Calidad - Pintura", type: "Instructivo", date: "2025-03-05", sizeMB: 1.5, rawSize: 1.5 * 1024 * 1024, path: "docs/instructivo_pintura.pdf" },
    { id: 3, name: "Ficha Técnica - Vidrio Templado", type: "Ficha", date: "2025-02-18", sizeMB: 0.5, rawSize: 0.5 * 1024 * 1024, path: "docs/ficha_vidrio.pdf" },
    { id: 4, name: "Norma ISO 9001:2015 - Extracto", type: "Norma", date: "2025-01-21", sizeMB: 3.1, rawSize: 3.1 * 1024 * 1024, path: "docs/norma_iso.pdf" },
    { id: 5, name: "Formato de Inspección - Despachos", type: "Formato", date: "2024-12-15", sizeMB: 0.2, rawSize: 0.2 * 1024 * 1024, path: "docs/formato_despachos.xlsx" }
];

let isSidebarCollapsed = false;
const SIDEBAR_COLLAPSED_KEY = 'sidebarAlcoCollapsedState';

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const appContainer = document.getElementById('mainAppContainer');
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const toggleBtnIcon = toggleBtn.querySelector('i');

    isSidebarCollapsed = !isSidebarCollapsed;
    sidebar.classList.toggle('collapsed', isSidebarCollapsed);
    appContainer.classList.toggle('sidebar-collapsed', isSidebarCollapsed);

    if (isSidebarCollapsed) {
        toggleBtnIcon.classList.remove('fa-angle-double-left');
        toggleBtnIcon.classList.add('fa-angle-double-right');
        toggleBtn.title = "Expandir Menú";
    } else {
        toggleBtnIcon.classList.remove('fa-angle-double-right');
        toggleBtnIcon.classList.add('fa-angle-double-left');
        toggleBtn.title = "Minimizar Menú";
    }
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isSidebarCollapsed.toString());
}

function applyInitialSidebarState() {
    const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (savedState === 'true') {
        isSidebarCollapsed = false; // Para que toggleSidebar lo ponga en true y colapse
        toggleSidebar();
    }
}

function intentLogin() {
    console.log("Intentando login...");
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const username = usernameInput.value;
    const password = passwordInput.value;
    const validUser = validUsers.find(u => u.user === username && u.pass === password);

    if (validUser) {
        console.log("Login exitoso para:", validUser.user);
        document.getElementById('loginContainer').classList.remove('active');
        document.getElementById('mainAppContainer').classList.add('active');

        document.getElementById('sidebarUserDisplay').textContent = validUser.user;
        const userRoleElement = document.querySelector('.sidebar-user-profile .user-role');
        if (userRoleElement) userRoleElement.textContent = validUser.role || 'Usuario';
        const userAvatarInitial = document.getElementById('userAvatarInitial');
        if (userAvatarInitial) userAvatarInitial.textContent = validUser.initial || username.charAt(0).toUpperCase();

        usernameInput.value = '';
        passwordInput.value = '';

        applyInitialSidebarState();
        activateModule('dashboardPrincipalModule');
    } else {
        alert('Credenciales incorrectas. Inténtelo nuevamente.');
        console.log("Login fallido");
        passwordInput.value = '';
    }
    return false;
}

function logout() {
    console.log("Cerrando sesión...");
    document.getElementById('mainAppContainer').classList.remove('active');
    document.getElementById('loginContainer').classList.add('active');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

function activateModule(moduleId, isSubmenuLink = false) {
    console.log("Activando módulo:", moduleId);
    document.querySelectorAll('.module-content').forEach(moduleEl => {
        moduleEl.classList.remove('active');
    });

    const targetModuleElement = document.getElementById(moduleId);
    if (targetModuleElement) {
        targetModuleElement.classList.add('active');

        const moduleTitleElement = targetModuleElement.querySelector('.content-title, .content-subtitle');
        document.title = `Alco Suite - ${moduleTitleElement ? moduleTitleElement.textContent.trim() : moduleId.replace('Module', '')}`;

        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`.sidebar-nav .nav-link[data-module="${moduleId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            const parentLi = activeLink.closest('.nav-item-has-children');
            if (parentLi) {
                parentLi.querySelector('a[data-module-parent]').classList.add('active');
                if (!parentLi.classList.contains('open')) parentLi.classList.add('open');
            }
        }

        if (moduleId === 'formulariosModule') setupInspectionForm();
        else if (moduleId === 'bibliotecaModule') setupLibraryModule();
        else if (moduleId === 'indicadoresModule') initCharts(); // initCharts verificará si el módulo está activo

    } else {
        console.error("Módulo no encontrado:", moduleId, ". Mostrando Dashboard Principal por defecto.");
        activateModule('dashboardPrincipalModule');
    }
}

function setupInspectionForm() {
    const inspectionForm = document.getElementById('inspectionForm');
    if (!inspectionForm || inspectionForm.dataset.initialized === 'true') return;
    console.log("Configurando Formularios de Inspección...");
    inspectionForm.dataset.initialized = 'true';

    const formInputs = inspectionForm.querySelectorAll('input, select, textarea');
    const DRAFT_KEY = 'inspectionFormDraft_v2';

    function saveDraft() { /* ... (sin cambios) ... */ const draftData = {}; formInputs.forEach(input => { if (input.name) draftData[input.name] = input.value; }); localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData)); console.log('Borrador de inspección guardado'); }
    function loadDraft() { /* ... (sin cambios) ... */ const draft = localStorage.getItem(DRAFT_KEY); if (draft) { if (confirm("Se encontró un borrador guardado para este formulario. ¿Desea cargarlo?")) { const draftData = JSON.parse(draft); formInputs.forEach(input => { if (input.name && draftData[input.name] !== undefined) { input.value = draftData[input.name]; } }); console.log('Borrador de inspección cargado'); } } }
    function clearDraftAndForm() { /* ... (sin cambios) ... */ localStorage.removeItem(DRAFT_KEY); inspectionForm.reset(); console.log('Borrador de inspección y formulario limpiados'); }

    formInputs.forEach(input => input.addEventListener('input', saveDraft));
    inspectionForm.onsubmit = function (e) { e.preventDefault(); alert('Formulario de inspección enviado (simulación). Borrador limpiado.'); clearDraftAndForm(); };
    const productCodeInput = document.getElementById('productCode');
    if (productCodeInput) { productCodeInput.oninvalid = function () { if (productCodeInput.validity.patternMismatch) { productCodeInput.setCustomValidity('El código debe tener entre 5 y 10 caracteres alfanuméricos (A-Z, 0-9).'); } else if (productCodeInput.validity.valueMissing) { productCodeInput.setCustomValidity('Este campo es obligatorio.'); } else { productCodeInput.setCustomValidity(''); } }; productCodeInput.oninput = () => productCodeInput.setCustomValidity(''); }
    const restoreDraftButton = document.getElementById('restoreDraftButton');
    if (restoreDraftButton) restoreDraftButton.onclick = loadDraft;
    const cancelInspectionFormButton = document.getElementById('cancelInspectionForm');
    if (cancelInspectionFormButton) { cancelInspectionFormButton.onclick = () => { if (confirm("¿Está seguro de que desea cancelar y limpiar el formulario?")) { clearDraftAndForm(); } }; }
    loadDraft();
}

function setupLibraryModule() {
    const libraryModule = document.getElementById('bibliotecaModule');
    if (!libraryModule || libraryModule.dataset.initialized === 'true') return;
    console.log("Configurando Biblioteca de Archivos...");
    libraryModule.dataset.initialized = 'true';

    function renderDocumentsTable(docsToRender) { /* ... (sin cambios) ... */ const tbody = libraryModule.querySelector('.documents-table tbody'); if (!tbody) return; tbody.innerHTML = ''; if (docsToRender.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No se encontraron documentos.</td></tr>'; return; } docsToRender.forEach(doc => { const tr = document.createElement('tr'); const formattedDate = doc.date ? new Date(doc.date + 'T00:00:00').toLocaleDateString() : 'N/A'; tr.innerHTML = `<td>${doc.name}</td><td>${doc.type}</td><td>${formattedDate}</td><td>${doc.sizeMB} MB</td><td class="document-actions"><button class="view-btn" data-path="${doc.path}"><i class="fas fa-eye"></i> Ver</button><button class="download-btn" data-path="${doc.path}" data-name="${doc.name}"><i class="fas fa-download"></i> Descargar</button></td>`; tbody.appendChild(tr); }); tbody.querySelectorAll('.view-btn').forEach(btn => btn.onclick = (e) => { alert(`Simulación: Ver archivo en ${e.currentTarget.dataset.path}`); }); tbody.querySelectorAll('.download-btn').forEach(btn => btn.onclick = (e) => { alert(`Simulación: Descargar archivo ${e.currentTarget.dataset.name} desde ${e.currentTarget.dataset.path}`); }); }
    function applyFiltersAndSort() { /* ... (sin cambios) ... */ const searchTerm = document.getElementById('documentSearch').value.toLowerCase(); const selectedType = document.getElementById('documentType').value; const dateFrom = document.getElementById('filterDateFrom').value; const dateTo = document.getElementById('filterDateTo').value; const sortBy = document.getElementById('sortFilesBy').value; let filtered = documentsData.filter(doc => { const nameMatch = doc.name.toLowerCase().includes(searchTerm); const typeMatch = selectedType ? doc.type.toLowerCase() === selectedType.toLowerCase() : true; let dateDoc = doc.date ? new Date(doc.date + 'T00:00:00Z') : null; let dateFromObj = dateFrom ? new Date(dateFrom + 'T00:00:00Z') : null; let dateToObj = dateTo ? new Date(dateTo + 'T00:00:00Z') : null; if (dateToObj) dateToObj.setDate(dateToObj.getDate() + 1); const dateMatch = (!dateFromObj || (dateDoc && dateDoc >= dateFromObj)) && (!dateToObj || (dateDoc && dateDoc < dateToObj)); return nameMatch && typeMatch && dateMatch; }); switch (sortBy) { case 'name_asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break; case 'name_desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break; case 'date_new': filtered.sort((a, b) => new Date(b.date) - new Date(a.date)); break; case 'date_old': filtered.sort((a, b) => new Date(a.date) - new Date(b.date)); break; case 'size_asc': filtered.sort((a, b) => a.rawSize - b.rawSize); break; case 'size_desc': filtered.sort((a, b) => b.rawSize - a.rawSize); break; } renderDocumentsTable(filtered); }
    const applyFiltersButton = document.getElementById('applyLibraryFilters');
    if (applyFiltersButton) applyFiltersButton.onclick = applyFiltersAndSort;
    ['documentSearch', 'documentType', 'filterDateFrom', 'filterDateTo', 'sortFilesBy'].forEach(id => { const el = document.getElementById(id); if (el) { if (id === 'documentSearch') el.oninput = applyFiltersAndSort; else el.onchange = applyFiltersAndSort; } });
    renderDocumentsTable(documentsData);
}

window.onload = function () {
    console.log("Página cargada y lista.");

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.onsubmit = (e) => { e.preventDefault(); intentLogin(); };
    const loginButton = document.querySelector('.login-button');
    if (loginButton) loginButton.onclick = (e) => { e.preventDefault(); intentLogin(); };
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) logoutButton.onclick = logout;

    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    if (sidebarToggleBtn) sidebarToggleBtn.onclick = toggleSidebar;
    const sidebarExpandBtn = document.getElementById('sidebarExpandBtn');
    if (sidebarExpandBtn) sidebarExpandBtn.onclick = toggleSidebar;

    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.onclick = function (e) {
            e.preventDefault();
            const moduleId = this.dataset.module;
            const parentModuleId = this.dataset.moduleParent;

            document.querySelectorAll('.sidebar-nav .nav-item-has-children.open').forEach(openLi => {
                if (openLi !== this.closest('.nav-item-has-children')) {
                    openLi.classList.remove('open');
                }
            });

            if (moduleId) {
                activateModule(moduleId, this.classList.contains('submenu-link'));
                const parentLi = this.closest('.nav-item-has-children');
                if (parentLi && !parentLi.classList.contains('open')) {
                    parentLi.classList.add('open');
                }
            } else if (parentModuleId) {
                const parentLi = this.closest('.nav-item-has-children');
                if (parentLi) parentLi.classList.toggle('open');
            }
        };
    });

    document.querySelectorAll('.breadcrumb-link-main-module').forEach(link => {
        link.onclick = function (e) {
            e.preventDefault();
            const mainModuleId = this.dataset.mainModule;
            const parentNavLink = document.querySelector(`.nav-link[data-module-parent="${mainModuleId}"]`);
            if (parentNavLink) {
                const parentLi = parentNavLink.closest('.nav-item-has-children');
                if (parentLi && !parentLi.classList.contains('open')) parentLi.classList.add('open');
                const firstSubmenuItem = parentLi.querySelector('.submenu-link');
                if (firstSubmenuItem && firstSubmenuItem.dataset.module) {
                    activateModule(firstSubmenuItem.dataset.module, true);
                } else { console.warn("No se encontró el primer submódulo para:", mainModuleId); }
            }
        }
    });
    // applyInitialSidebarState(); // Llamar aquí si quieres que se aplique incluso antes del login (no recomendado)
};

function initCharts() {
    const indicadoresModule = document.getElementById('indicadoresModule');
    if (!indicadoresModule || !indicadoresModule.classList.contains('active') || indicadoresModule.dataset.chartsInitialized === 'true') {
        // console.log("Módulo de indicadores no activo o gráficos ya inicializados.");
        return;
    }
    console.log("Inicializando gráficos...");

    const chartsToCreate = [
        { id: 'defectsChart', type: 'bar', data: { labels: ['Perfilería', 'Pintura', 'Troquelados', 'Felpa', 'Vidrio', 'Despachos'], datasets: [{ label: '% de Defectos', data: [2.3, 1.7, 3.5, 0.9, 1.2, 0.5], backgroundColor: '#004282', borderWidth: 1 }] }, options: { scales: { y: { beginAtZero: true, title: { display: true, text: 'Porcentaje (%)' } } } } },
        { id: 'timeChart', type: 'line', data: { labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'], datasets: [{ label: 'Tiempo promedio (min)', data: [12, 15, 10, 9, 11], borderColor: '#0056b3', backgroundColor: 'rgba(0, 86, 179, 0.1)', tension: 0.4, fill: true }] }, options: { scales: { y: { beginAtZero: true } } } },
        { id: 'approvalChart', type: 'pie', data: { labels: ['Aprobados', 'Rechazados', 'Pendientes'], datasets: [{ data: [85, 10, 5], backgroundColor: ['#28a745', '#dc3545', '#ffc107'] }] }, options: {} },
        { id: 'trendChart', type: 'line', data: { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'], datasets: [{ label: 'Calidad General', data: [92, 94, 91, 95, 97], borderColor: '#004282', backgroundColor: 'transparent' }, { label: 'Meta', data: [90, 90, 90, 90, 90], borderColor: '#a5a7a8', borderDash: [5, 5], backgroundColor: 'transparent' }] }, options: { scales: { y: { min: 85, max: 100, title: { display: true, text: 'Puntuación (%)' } } } } }
    ];

    let chartsCreated = 0;
    chartsToCreate.forEach(chartConfig => {
        const ctx = document.getElementById(chartConfig.id)?.getContext('2d');
        if (ctx) {
            new Chart(ctx, { type: chartConfig.type, data: chartConfig.data, options: chartConfig.options });
            chartsCreated++;
        }
    });

    if (chartsCreated > 0) {
        indicadoresModule.dataset.chartsInitialized = 'true'; // Marcar como inicializados
        console.log(chartsCreated + " gráficos inicializados.");
    }
}