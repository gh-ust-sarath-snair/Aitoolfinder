/* --- Global Configuration --- */
const API = 'http://localhost:8080';
let ADMIN_KEY = null;
let CURRENT_TOOL = null;
let CURRENT_TOOL_NAME = null;
let CURRENT_FILTER = '';
const toolCache = new Map();

/* --- Auth Module --- */
const enc = v => btoa(v);
const dec = v => atob(v);
const togglePassword = () => {
    const el = document.getElementById('adminKey');
    el.type = el.type === 'password' ? 'text' : 'password';
};

const saveKey = (k) => { sessionStorage.setItem('ADMIN_KEY', enc(k)); ADMIN_KEY = k; };
const loadKey = () => {
    const k = sessionStorage.getItem('ADMIN_KEY');
    if (k) ADMIN_KEY = dec(k);
    return !!ADMIN_KEY;
};

async function login() {
    const keyVal = document.getElementById('adminKey').value;
    try {
        const r = await fetch(`${API}/adminchecker`, { headers: { 'X-ADMIN-KEY': keyVal } });
        if (!r.ok) throw '';
        saveKey(keyVal);
        init();
    } catch (e) { alert('Invalid Admin Key'); }
}

function logout() {
    sessionStorage.clear();
    ADMIN_KEY = null;
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('authWrapper').classList.remove('hidden');
}

/* --- Tool Logic --- */
async function fetchToolName(id) {
    if (!id) return 'Unknown ID';
    if (toolCache.has(id)) return toolCache.get(id);
    try {
        const r = await fetch(`${API}/tools/${id}`);
        const data = await r.json();
        const name = data.name || 'Unknown Tool';
        toolCache.set(id, name);
        return name;
    } catch (e) { return 'Fetch Error'; }
}

function showTools() {
    setActive('nav-tools');
    showView('toolsView');
    document.getElementById('toolsMainTitle').innerText = "Tools";
    document.getElementById('toolsListWrapper').classList.remove('hidden');
    document.getElementById('addToolBtn').classList.remove('hidden');
    document.getElementById('inlineReviewsWrapper').classList.add('hidden');
    document.getElementById('backToToolsBtn').classList.add('hidden');

    fetch(`${API}/tools`)
        .then(r => r.json())
        .then(d => {
            const table = document.getElementById('toolsTable');
            table.innerHTML = '';
            d.tools.forEach(t => {
                toolCache.set(t.id, t.name);
                table.innerHTML += `
                    <tr>
                        <td>${t.name}</td><td>${t.category}</td><td>${t.pricingType}</td><td>${t.averageRating}</td>
                        <td class="actions">
                            <button class="small" onclick="loadReviews('${t.id}', '${t.name}')">Reviews</button>
                            <button class="small update-btn" onclick="openUpdateModal('${t.id}','${t.name}','${t.useCase}','${t.category}','${t.pricingType}')">Update</button>
                            <button class="small danger" onclick="deleteTool('${t.id}')">Delete</button>
                        </td>
                    </tr>`;
            });
        });
}

/* --- Review Logic --- */
function showReviews() { setActive('nav-reviews'); showView('reviewsView'); fetchGlobalReviews(CURRENT_FILTER); }

function filterReviews(btn, status) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    CURRENT_FILTER = status;
    fetchGlobalReviews(status);
}

async function fetchGlobalReviews(status) {
    const url = status ? `${API}/admin/reviews?status=${status}` : `${API}/admin/reviews`;
    const r = await fetch(url, { headers: { 'X-ADMIN-KEY': ADMIN_KEY } });
    const d = await r.json();
    const table = document.getElementById('reviewsTable');
    table.innerHTML = '';
    if (!d.reviews || d.reviews.length === 0) {
        table.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px;">No reviews found.</td></tr>`;
        return;
    }
    for (const review of d.reviews) {
        const name = await fetchToolName(review.toolId);
        renderReviewRow(review, table, 'global', name);
    }
}

function loadReviews(id, name) {
    CURRENT_TOOL = id; CURRENT_TOOL_NAME = name;
    document.getElementById('toolsMainTitle').innerText = `Review for ${name}`;
    document.getElementById('toolsListWrapper').classList.add('hidden');
    document.getElementById('addToolBtn').classList.add('hidden');
    document.getElementById('inlineReviewsWrapper').classList.remove('hidden');
    document.getElementById('backToToolsBtn').classList.remove('hidden');

    fetch(`${API}/admin/reviews/tool/${id}`, { headers: { 'X-ADMIN-KEY': ADMIN_KEY } })
        .then(r => r.json())
        .then(d => {
            const table = document.getElementById('inlineReviewsTable');
            table.innerHTML = '';
            if (!d.reviews || d.reviews.length === 0) {
                table.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:40px;">No reviews exist.</td></tr>`;
                return;
            }
            d.reviews.forEach(r => renderReviewRow(r, table, 'inline'));
        });
}

function renderReviewRow(r, targetTable, type, toolName = '') {
    const actions = `<div class="actions">
        <button class="small success" onclick="updateReviewStatus('${r.id}','APPROVED','${type}')">Approve</button>
        <button class="small danger" onclick="updateReviewStatus('${r.id}','REJECTED','${type}')">Reject</button>
    </div>`;
    const toolCell = type === 'global' ? `<td><span class="tool-tag">${toolName}</span></td>` : '';
    targetTable.innerHTML += `<tr>${toolCell}<td>${r.rating}/5</td><td>${r.comment}</td><td>${getStatusPill(r.status)}</td><td>${actions}</td></tr>`;
}

async function updateReviewStatus(id, status, type) {
    await fetch(`${API}/admin/reviews/${id}/${status}`, { method: 'PATCH', headers: { 'X-ADMIN-KEY': ADMIN_KEY } });
    type === 'inline' ? loadReviews(CURRENT_TOOL, CURRENT_TOOL_NAME) : fetchGlobalReviews(CURRENT_FILTER);
}

/* --- UI Helpers --- */
function getStatusPill(s) {
    const status = (s || 'pending').toLowerCase();
    return `<span class="pill pill-${status}">${status}</span>`;
}
function setActive(id) { document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function showView(id) { document.querySelectorAll('.view').forEach(v => v.classList.add('hidden')); document.getElementById(id).classList.remove('hidden'); }

/* --- Modals & CRUD --- */
function openToolModal() { document.getElementById('toolModal').classList.remove('hidden'); }
function closeToolModal() { document.getElementById('toolModal').classList.add('hidden'); }
function openUpdateModal(id, n, u, c, p) {
    CURRENT_UPDATE_TOOL = id;
    document.getElementById('updateToolName').value = n;
    document.getElementById('updateToolUseCase').value = u;
    document.getElementById('updateToolCategory').value = c;
    document.getElementById('updateToolPricing').value = p;
    document.getElementById('updateToolModal').classList.remove('hidden');
}
function closeUpdateModal() { document.getElementById('updateToolModal').classList.add('hidden'); }

async function createTool() {
    const payload = {
        name: document.getElementById('toolName').value,
        useCase: document.getElementById('toolUseCase').value,
        category: document.getElementById('toolCategory').value,
        pricingType: document.getElementById('toolPricing').value
    };
    await fetch(`${API}/admin/tools`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-ADMIN-KEY': ADMIN_KEY }, body: JSON.stringify(payload) });
    closeToolModal(); showTools();
}

let CURRENT_UPDATE_TOOL = null;
async function updateTool() {
    const payload = {
        name: document.getElementById('updateToolName').value,
        useCase: document.getElementById('updateToolUseCase').value,
        category: document.getElementById('updateToolCategory').value,
        pricingType: document.getElementById('updateToolPricing').value
    };
    await fetch(`${API}/admin/tools/${CURRENT_UPDATE_TOOL}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-ADMIN-KEY': ADMIN_KEY }, body: JSON.stringify(payload) });
    closeUpdateModal(); showTools();
}

async function deleteTool(id) {
    if (!confirm('Delete tool?')) return;
    await fetch(`${API}/admin/tools/${id}`, { method: 'DELETE', headers: { 'X-ADMIN-KEY': ADMIN_KEY } });
    showTools();
}

/* --- Init --- */
function init() {
    document.getElementById('authWrapper').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    showTools();
}
window.onload = () => { if (loadKey()) init(); else document.getElementById('authWrapper').classList.remove('hidden'); };