// Credenciales de administrador
const validUsers = [
    { user: "Janier", pass: "admin", role: "Admin. Principal", initial: "J" },
    { user: "Gean", pass: "admin1", role: "Admin. Secundario", initial: "G" },
    { user: "Campo", pass: "123456", role: "Usuario Estándar", initial: "C" },
    { user: "Juan", pass: "supervisor", role: "Supervisor", initial: "S" }
];

// Datos de ejemplo para la biblioteca de archivos
let documentsData = [
    { id: 1, name: "Manual Perfilería", type: "Manual", date: "2025-04-12", sizeMB: 2.3, rawSize: 2.3 * 1024 * 1024, path: "docs/manual_perfileria.pdf" },
    { id: 2, name: "Instructivo Pintura", type: "Instructivo", date: "2025-03-05", sizeMB: 1.5, rawSize: 1.5 * 1024 * 1024, path: "docs/instructivo_pintura.pdf" },
    { id: 3, name: "Ficha Vidrio Templado", type: "Ficha", date: "2025-02-18", sizeMB: 0.5, rawSize: 0.5 * 1024 * 1024, path: "docs/ficha_vidrio.pdf" },
    { id: 4, name: "Norma ISO 9001", type: "Norma", date: "2025-01-21", sizeMB: 3.1, rawSize: 3.1 * 1024 * 1024, path: "docs/norma_iso.pdf" },
    { id: 5, name: "Formato Despachos", type: "Formato", date: "2024-12-15", sizeMB: 0.2, rawSize: 0.2 * 1024 * 1024, path: "docs/formato_despachos.xlsx" }
];

let isDesktopSidebarCollapsed = false; // Para el estado colapsado en desktop
let isMobileSidebarOpen = false;     // Para el estado abierto/cerrado en móvil
const SIDEBAR_COLLAPSED_KEY = 'sidebarAlcoDesktopCollapsedState_v3';

function updateSidebarToggleButtonIcon() {
    const toggleBtnIcon = document.getElementById('sidebarToggleBtn').querySelector('i');
    if (window.innerWidth <= 768) { // Móvil
        toggleBtnIcon.classList.remove('fa-angle-double-left', 'fa-angle-double-right');
        if (isMobileSidebarOpen) {
            toggleBtnIcon.classList.add('fa-times'); // Icono de cerrar
            document.getElementById('sidebarToggleBtn').title = "Cerrar Menú";
        } else {
            toggleBtnIcon.classList.add('fa-bars');   // Icono de hamburguesa
            document.getElementById('sidebarToggleBtn').title = "Abrir Menú";
        }
    } else { // Desktop
        toggleBtnIcon.classList.remove('fa-bars', 'fa-times');
        if (isDesktopSidebarCollapsed) {
            toggleBtnIcon.classList.add('fa-angle-double-right');
            document.getElementById('sidebarToggleBtn').title = "Expandir Menú";
        } else {
            toggleBtnIcon.classList.add('fa-angle-double-left');
            document.getElementById('sidebarToggleBtn').title = "Minimizar Menú";
        }
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const appContainer = document.getElementById('mainAppContainer');

    if (window.innerWidth <= 768) { // Lógica para Móvil
        isMobileSidebarOpen = !isMobileSidebarOpen;
        sidebar.classList.toggle('open-mobile', isMobileSidebarOpen);
        // Opcional: añadir un overlay al body
        // document.body.classList.toggle('mobile-sidebar-overlay-active', isMobileSidebarOpen);
    } else { // Lógica para Desktop
        isDesktopSidebarCollapsed = !isDesktopSidebarCollapsed;
        sidebar.classList.toggle('collapsed', isDesktopSidebarCollapsed);
        appContainer.classList.toggle('sidebar-collapsed', isDesktopSidebarCollapsed);
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isDesktopSidebarCollapsed.toString());
    }
    updateSidebarToggleButtonIcon(); // Actualizar el icono del botón principal
}

function applyInitialSidebarState() {
    if (window.innerWidth > 768) {
        const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
        if (savedState === 'true') {
            isDesktopSidebarCollapsed = false;
            toggleSidebar(); // Lo colapsará
        } else {
            isDesktopSidebarCollapsed = true;
            toggleSidebar(); // Lo expandirá (y pondrá el icono correcto)
        }
    } else { // Móvil
        document.getElementById('sidebar').classList.remove('open-mobile', 'collapsed');
        document.getElementById('mainAppContainer').classList.remove('sidebar-collapsed');
        isMobileSidebarOpen = false;
        updateSidebarToggleButtonIcon(); // Asegurar icono de hamburguesa
    }
}

function intentLogin() {
    // ... (sin cambios, pero llama a applyInitialSidebarState y activateModule)
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

        applyInitialSidebarState(); // Muy importante llamar DESPUÉS de mostrar mainAppContainer
        activateModule('dashboardPrincipalModule');
    } else {
        alert('Credenciales incorrectas. Inténtelo nuevamente.');
        console.log("Login fallido");
        passwordInput.value = '';
    }
    return false;
}

function logout() {
    // ... (sin cambios)
    console.log("Cerrando sesión...");
    document.getElementById('mainAppContainer').classList.remove('active');
    document.getElementById('loginContainer').classList.add('active');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

function activateModule(moduleId, isSubmenuLink = false) {
    // ... (lógica de activateModule sin cambios, pero ahora incluye el cierre del sidebar móvil)
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
                parentLi.querySelector('a[data-module-parent]').classList.add('active'); // Activar también el padre
                if (!parentLi.classList.contains('open')) parentLi.classList.add('open');
            }
        }

        // Cerrar sidebar en móvil después de seleccionar un ítem
        if (window.innerWidth <= 768 && isMobileSidebarOpen) {
            toggleSidebar();
        }

        if (moduleId === 'formulariosModule') setupInspectionForm();
        else if (moduleId === 'bibliotecaModule') setupLibraryModule();
        else if (moduleId === 'indicadoresModule') initCharts();

    } else {
        console.error("Módulo no encontrado:", moduleId, ". Mostrando Dashboard Principal por defecto.");
        activateModule('dashboardPrincipalModule');
    }
}

function setupInspectionForm() { /* ... (como en la respuesta anterior, con dataset.initialized) ... */ const inspectionForm = document.getElementById('inspectionForm'); if (!inspectionForm || inspectionForm.dataset.initialized === 'true') return; console.log("Configurando Formularios de Inspección..."); inspectionForm.dataset.initialized = 'true'; const formInputs = inspectionForm.querySelectorAll('input, select, textarea'); const DRAFT_KEY = 'inspectionFormDraft_v3'; function saveDraft() { const draftData = {}; formInputs.forEach(input => { if (input.name) draftData[input.name] = input.value; }); localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData)); /* console.log('Borrador guardado'); */ } function loadDraft() { const draft = localStorage.getItem(DRAFT_KEY); if (draft) { if (confirm("Borrador encontrado. ¿Cargar?")) { const draftData = JSON.parse(draft); formInputs.forEach(input => { if (input.name && draftData[input.name] !== undefined) { input.value = draftData[input.name]; } }); console.log('Borrador cargado'); } } } function clearDraftAndForm() { localStorage.removeItem(DRAFT_KEY); inspectionForm.reset(); console.log('Borrador y form limpiados'); } formInputs.forEach(input => input.addEventListener('input', saveDraft)); inspectionForm.onsubmit = function (e) { e.preventDefault(); alert('Formulario enviado (simulación).'); clearDraftAndForm(); }; const productCodeInput = document.getElementById('productCode'); if (productCodeInput) { productCodeInput.oninvalid = function () { if (productCodeInput.validity.patternMismatch) { productCodeInput.setCustomValidity('Código: 5-10 alfanuméricos (A-Z, 0-9).'); } else if (productCodeInput.validity.valueMissing) { productCodeInput.setCustomValidity('Campo obligatorio.'); } else { productCodeInput.setCustomValidity(''); } }; productCodeInput.oninput = () => productCodeInput.setCustomValidity(''); } const restoreDraftButton = document.getElementById('restoreDraftButton'); if (restoreDraftButton) restoreDraftButton.onclick = loadDraft; const cancelInspectionFormButton = document.getElementById('cancelInspectionForm'); if (cancelInspectionFormButton) { cancelInspectionFormButton.onclick = () => { if (confirm("¿Cancelar y limpiar formulario?")) { clearDraftAndForm(); } }; } loadDraft(); }
function setupLibraryModule() { /* ... (como en la respuesta anterior, con dataset.initialized) ... */ const libraryModule = document.getElementById('bibliotecaModule'); if (!libraryModule || libraryModule.dataset.initialized === 'true') return; console.log("Configurando Biblioteca..."); libraryModule.dataset.initialized = 'true'; function renderDocumentsTable(docsToRender) { const tbody = libraryModule.querySelector('.documents-table tbody'); if (!tbody) return; tbody.innerHTML = ''; if (docsToRender.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay documentos.</td></tr>'; return; } docsToRender.forEach(doc => { const tr = document.createElement('tr'); const formattedDate = doc.date ? new Date(doc.date + 'T00:00:00').toLocaleDateString() : 'N/A'; tr.innerHTML = `<td>${doc.name}</td><td>${doc.type}</td><td>${formattedDate}</td><td>${doc.sizeMB} MB</td><td class="document-actions"><button class="view-btn" data-path="${doc.path}"><i class="fas fa-eye"></i> Ver</button><button class="download-btn" data-path="${doc.path}" data-name="${doc.name}"><i class="fas fa-download"></i> Descargar</button></td>`; tbody.appendChild(tr); }); tbody.querySelectorAll('.view-btn').forEach(btn => btn.onclick = (e) => { alert(`Ver: ${e.currentTarget.dataset.path}`); }); tbody.querySelectorAll('.download-btn').forEach(btn => btn.onclick = (e) => { alert(`Descargar: ${e.currentTarget.dataset.name}`); }); } function applyFiltersAndSort() { const searchTerm = document.getElementById('documentSearch').value.toLowerCase(); const selectedType = document.getElementById('documentType').value; const dateFrom = document.getElementById('filterDateFrom').value; const dateTo = document.getElementById('filterDateTo').value; const sortBy = document.getElementById('sortFilesBy').value; let filtered = documentsData.filter(doc => { const nameMatch = doc.name.toLowerCase().includes(searchTerm); const typeMatch = selectedType ? doc.type.toLowerCase() === selectedType.toLowerCase() : true; let dateDoc = doc.date ? new Date(doc.date + 'T00:00:00Z') : null; let dateFromObj = dateFrom ? new Date(dateFrom + 'T00:00:00Z') : null; let dateToObj = dateTo ? new Date(dateTo + 'T00:00:00Z') : null; if (dateToObj) dateToObj.setDate(dateToObj.getDate() + 1); const dateMatch = (!dateFromObj || (dateDoc && dateDoc >= dateFromObj)) && (!dateToObj || (dateDoc && dateDoc < dateToObj)); return nameMatch && typeMatch && dateMatch; }); switch (sortBy) { case 'name_asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break; case 'name_desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break; case 'date_new': filtered.sort((a, b) => new Date(b.date) - new Date(a.date)); break; case 'date_old': filtered.sort((a, b) => new Date(a.date) - new Date(b.date)); break; case 'size_asc': filtered.sort((a, b) => a.rawSize - b.rawSize); break; case 'size_desc': filtered.sort((a, b) => b.rawSize - a.rawSize); break; } renderDocumentsTable(filtered); } const applyFiltersButton = document.getElementById('applyLibraryFilters'); if (applyFiltersButton) applyFiltersButton.onclick = applyFiltersAndSort;['documentSearch', 'documentType', 'filterDateFrom', 'filterDateTo', 'sortFilesBy'].forEach(id => { const el = document.getElementById(id); if (el) { if (id === 'documentSearch') el.oninput = applyFiltersAndSort; else el.onchange = applyFiltersAndSort; } }); renderDocumentsTable(documentsData); }

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

    const sidebarExpandBtnDesktop = document.getElementById('sidebarExpandBtn');
    if (sidebarExpandBtnDesktop) {
        sidebarExpandBtnDesktop.onclick = function () {
            if (window.innerWidth > 768) toggleSidebar();
        };
    }

    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.onclick = function (e) {
            e.preventDefault();
            const moduleId = this.dataset.module;
            const parentModuleId = this.dataset.moduleParent;

            if (window.innerWidth > 768 && !document.getElementById('sidebar').classList.contains('collapsed')) {
                if (!this.closest('.nav-item-has-children.open')) {
                    document.querySelectorAll('.sidebar-nav .nav-item-has-children.open').forEach(openLi => {
                        if (openLi !== this.closest('.nav-item-has-children')) {
                            openLi.classList.remove('open');
                        }
                    });
                }
            }

            if (moduleId) {
                activateModule(moduleId, this.classList.contains('submenu-link'));
                const parentLi = this.closest('.nav-item-has-children');
                if (parentLi && !parentLi.classList.contains('open')) {
                    if (!(window.innerWidth > 768 && document.getElementById('sidebar').classList.contains('collapsed'))) {
                        parentLi.classList.add('open');
                    }
                }
            } else if (parentModuleId) {
                const parentLi = this.closest('.nav-item-has-children');
                if (window.innerWidth > 768 && document.getElementById('sidebar').classList.contains('collapsed')) {
                    toggleSidebar();
                    if (parentLi) setTimeout(() => parentLi.classList.add('open'), 50);
                } else {
                    if (parentLi) parentLi.classList.toggle('open');
                }
            }
        };
    });

    document.querySelectorAll('.breadcrumb-link-main-module').forEach(link => {
        link.onclick = function (e) { /* ... (sin cambios) ... */ e.preventDefault(); const mainModuleId = this.dataset.mainModule; const parentNavLink = document.querySelector(`.nav-link[data-module-parent="${mainModuleId}"]`); if (parentNavLink) { const parentLi = parentNavLink.closest('.nav-item-has-children'); if (parentLi && !parentLi.classList.contains('open')) parentLi.classList.add('open'); const firstSubmenuItem = parentLi.querySelector('.submenu-link'); if (firstSubmenuItem && firstSubmenuItem.dataset.module) { activateModule(firstSubmenuItem.dataset.module, true); } else { console.warn("No se encontró el primer submódulo para:", mainModuleId); } } }
    });

    // Listener para re-evaluar el estado del sidebar en cambios de tamaño de ventana
    window.addEventListener('resize', applyInitialSidebarState);
    // applyInitialSidebarState(); // Llamar al cargar si es necesario antes del login (pero mejor después)
};

function initCharts() { /* ... (como en la respuesta anterior, con dataset.chartsInitialized) ... */ const indicadoresModule = document.getElementById('indicadoresModule'); if (!indicadoresModule || !indicadoresModule.classList.contains('active') || indicadoresModule.dataset.chartsInitialized === 'true') { return; } console.log("Inicializando gráficos..."); const chartsToCreate = [{ id: 'defectsChart', type: 'bar', data: { labels: ['Perfilería', 'Pintura', 'Troquelados', 'Felpa', 'Vidrio', 'Despachos'], datasets: [{ label: '% de Defectos', data: [2.3, 1.7, 3.5, 0.9, 1.2, 0.5], backgroundColor: '#004282', borderWidth: 1 }] }, options: { scales: { y: { beginAtZero: true, title: { display: true, text: 'Porcentaje (%)' } } } } }, { id: 'timeChart', type: 'line', data: { labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'], datasets: [{ label: 'Tiempo promedio (min)', data: [12, 15, 10, 9, 11], borderColor: '#0056b3', backgroundColor: 'rgba(0, 86, 179, 0.1)', tension: 0.4, fill: true }] }, options: { scales: { y: { beginAtZero: true } } } }, { id: 'approvalChart', type: 'pie', data: { labels: ['Aprobados', 'Rechazados', 'Pendientes'], datasets: [{ data: [85, 10, 5], backgroundColor: ['#28a745', '#dc3545', '#ffc107'] }] }, options: {} }, { id: 'trendChart', type: 'line', data: { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'], datasets: [{ label: 'Calidad General', data: [92, 94, 91, 95, 97], borderColor: '#004282', backgroundColor: 'transparent' }, { label: 'Meta', data: [90, 90, 90, 90, 90], borderColor: '#a5a7a8', borderDash: [5, 5], backgroundColor: 'transparent' }] }, options: { scales: { y: { min: 85, max: 100, title: { display: true, text: 'Puntuación (%)' } } } } }]; let chartsCreated = 0; chartsToCreate.forEach(chartConfig => { const ctx = document.getElementById(chartConfig.id)?.getContext('2d'); if (ctx) { new Chart(ctx, { type: chartConfig.type, data: chartConfig.data, options: chartConfig.options }); chartsCreated++; } }); if (chartsCreated > 0) { indicadoresModule.dataset.chartsInitialized = 'true'; console.log(chartsCreated + " gráficos inicializados."); } }
