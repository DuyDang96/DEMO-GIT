/**
 * MoneyNote - Personal Finance Tracker Application
 * Pure Vanilla JavaScript implementation with LocalStorage
 */

// =============================================================================
// 1. DEFAULT DATA CONFIGURATION (Pre-populated for October 2026)
// =============================================================================
const CATEGORY_META = {
    'Ăn uống': { letter: 'Ă', bgClass: 'cat-an-uong', color: '#1d4ed8', type: 'expense' },
    'Hóa đơn': { letter: 'H', bgClass: 'cat-hoa-don', color: '#2563eb', type: 'expense' },
    'Đi lại': { letter: 'Đ', bgClass: 'cat-di-lai', color: '#60a5fa', type: 'expense' },
    'Mua sắm': { letter: 'M', bgClass: 'cat-mua-sam', color: '#ea580c', type: 'expense' },
    'Học tập': { letter: 'H', bgClass: 'cat-hoc-tap', color: '#f59e0b', type: 'expense' },
    'Giải trí': { letter: 'G', bgClass: 'cat-giai-tri', color: '#94a3b8', type: 'expense' },
    'Lương': { letter: 'L', bgClass: 'cat-luong', color: '#15803d', type: 'income' },
    'Học bổng': { letter: 'H', bgClass: 'cat-hoc-bong', color: '#0f766e', type: 'income' },
    'Thưởng': { letter: 'T', bgClass: 'cat-luong', color: '#15803d', type: 'income' },
    'Khác': { letter: 'K', bgClass: 'cat-khac', color: '#64748b', type: 'expense' }
};

// 16 default transactions matching exactly the screenshots for Oct 2026
const DEFAULT_TRANSACTIONS = [
    { id: 'tx-1', date: '2026-10-28', type: 'expense', category: 'Ăn uống', note: 'Cà phê với nhóm', amount: 45000 },
    { id: 'tx-2', date: '2026-10-27', type: 'expense', category: 'Đi lại', note: 'Đổ xăng', amount: 80000 },
    { id: 'tx-3', date: '2026-10-25', type: 'expense', category: 'Học tập', note: 'Mua giáo trình JavaScript', amount: 150000 },
    { id: 'tx-4', date: '2026-10-24', type: 'income', category: 'Lương', note: 'Lương part-time tháng 10', amount: 3500000 },
    { id: 'tx-5', date: '2026-10-22', type: 'expense', category: 'Hóa đơn', note: 'Tiền điện nước', amount: 420000 },
    { id: 'tx-6', date: '2026-10-20', type: 'expense', category: 'Mua sắm', note: 'Áo khoác', amount: 350000 },
    { id: 'tx-7', date: '2026-10-18', type: 'expense', category: 'Giải trí', note: 'Vé xem phim', amount: 110000 },
    { id: 'tx-8', date: '2026-10-15', type: 'income', category: 'Học bổng', note: 'Học bổng kỳ 1', amount: 5000000 },
    { id: 'tx-9', date: '2026-10-14', type: 'expense', category: 'Ăn uống', note: 'Ăn tối cùng bạn bè', amount: 450000 },
    { id: 'tx-10', date: '2026-10-12', type: 'expense', category: 'Ăn uống', note: 'Đi chợ siêu thị', amount: 895000 },
    { id: 'tx-11', date: '2026-10-08', type: 'expense', category: 'Ăn uống', note: 'Ăn uống cuối tuần', amount: 600000 },
    { id: 'tx-12', date: '2026-10-06', type: 'expense', category: 'Học tập', note: 'Khóa học online', amount: 320000 },
    { id: 'tx-13', date: '2026-10-05', type: 'expense', category: 'Mua sắm', note: 'Giày sneaker', amount: 280000 },
    { id: 'tx-14', date: '2026-10-04', type: 'expense', category: 'Hóa đơn', note: 'Cước truyền hình & Internet', amount: 730000 },
    { id: 'tx-15', date: '2026-10-02', type: 'expense', category: 'Đi lại', note: 'Bảo dưỡng xe định kỳ', amount: 650000 },
    { id: 'tx-16', date: '2026-10-01', type: 'expense', category: 'Giải trí', note: 'Gói nghe nhạc & phim', amount: 150000 }
];

// App State
let state = {
    currentYear: 2026,
    currentMonth: 10, // 1 - 12
    userName: 'Minh',
    budgetLimits: JSON.parse(localStorage.getItem('moneynote_budgets')) || { '2026-10': 6000000 },
    transactions: JSON.parse(localStorage.getItem('moneynote_transactions')) || DEFAULT_TRANSACTIONS,
    filterType: 'all', // 'all', 'income', 'expense'
    filterCategory: 'all',
    searchQuery: '',
    showAllTransactions: false,
    editingTxId: null,
    deletingTxId: null
};

// =============================================================================
// 2. DOM ELEMENT REFERENCES
// =============================================================================
const currentMonthDisplay = document.getElementById('current-month-display');
const btnPrevMonth = document.getElementById('btn-prev-month');
const btnNextMonth = document.getElementById('btn-next-month');
const searchInput = document.getElementById('search-input');
const btnOpenAddModal = document.getElementById('btn-open-add-modal');

// Metrics
const metricTotalIncome = document.getElementById('metric-total-income');
const metricIncomeCount = document.getElementById('metric-income-count');
const metricTotalExpense = document.getElementById('metric-total-expense');
const metricExpenseCount = document.getElementById('metric-expense-count');
const metricTotalBalance = document.getElementById('metric-total-balance');

// Budget
const budgetSpentDisplay = document.getElementById('budget-spent-display');
const budgetLimitDisplay = document.getElementById('budget-limit-display');
const budgetProgressBar = document.getElementById('budget-progress-bar');
const budgetAlertBox = document.getElementById('budget-alert-box');
const budgetAlertText = document.getElementById('budget-alert-text');
const btnOpenBudgetModal = document.getElementById('btn-open-budget-modal');

// Table & Filters
const btnExportCsv = document.getElementById('btn-export-csv');
const segmentedBtns = document.querySelectorAll('.segmented-btn');
const categoryFilterSelect = document.getElementById('category-filter-select');
const transactionTableBody = document.getElementById('transaction-table-body');
const btnToggleViewAll = document.getElementById('btn-toggle-view-all');

// Category Breakdown
const catSummaryTotal = document.getElementById('cat-summary-total');
const categoryBreakdownContainer = document.getElementById('category-breakdown-container');

// Modals
const txModal = document.getElementById('tx-modal');
const modalTxTitle = document.getElementById('modal-tx-title');
const btnCloseTxModal = document.getElementById('btn-close-tx-modal');
const btnCancelTxModal = document.getElementById('btn-cancel-tx-modal');
const modalTypeExpense = document.getElementById('modal-type-expense');
const modalTypeIncome = document.getElementById('modal-type-income');
const txForm = document.getElementById('tx-form');
const txIdInput = document.getElementById('tx-id-input');
const txAmountInput = document.getElementById('tx-amount-input');
const txCategorySelect = document.getElementById('tx-category-select');
const txDateInput = document.getElementById('tx-date-input');
const txNoteInput = document.getElementById('tx-note-input');

const budgetModal = document.getElementById('budget-modal');
const btnCloseBudgetModal = document.getElementById('btn-close-budget-modal');
const btnCancelBudgetModal = document.getElementById('btn-cancel-budget-modal');
const budgetForm = document.getElementById('budget-form');
const budgetLimitInput = document.getElementById('budget-limit-input');

const confirmDeleteModal = document.getElementById('confirm-delete-modal');
const deleteTxDescText = document.getElementById('delete-tx-desc-text');
const btnCancelDeleteModal = document.getElementById('btn-cancel-delete-modal');
const btnConfirmDeleteTx = document.getElementById('btn-confirm-delete-tx');

const darkModeToggle = document.getElementById('dark-mode-toggle');
const toastEl = document.getElementById('toast');
const toastMsg = document.getElementById('toast-message');

// Modal form state
let activeModalType = 'expense';

// =============================================================================
// 3. UTILITY FUNCTIONS
// =============================================================================
// Format currency to VND standard: "5.230.000 đ"
function formatVND(amount) {
    if (isNaN(amount)) amount = 0;
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ';
}

// Format date display: "28/10/2026"
function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

// Show Toast notification
let toastTimeout;
function showToast(message) {
    clearTimeout(toastTimeout);
    toastMsg.textContent = message;
    toastEl.classList.add('show');
    toastTimeout = setTimeout(() => {
        toastEl.classList.remove('show');
    }, 2800);
}

// Save to LocalStorage
function persistData() {
    localStorage.setItem('moneynote_transactions', JSON.stringify(state.transactions));
    localStorage.setItem('moneynote_budgets', JSON.stringify(state.budgetLimits));
}

// Format input amount with dots
function setupAmountInputFormatter(input) {
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value) {
            e.target.value = new Intl.NumberFormat('vi-VN').format(parseInt(value, 10));
        } else {
            e.target.value = '';
        }
    });
}
setupAmountInputFormatter(txAmountInput);
setupAmountInputFormatter(budgetLimitInput);

// =============================================================================
// 4. CORE RENDER LOGIC
// =============================================================================
function renderApp() {
    renderHeader();
    renderMetricsAndBudget();
    renderTransactionsTable();
    renderCategoryBreakdown();
}

// 1. Header Month
function renderHeader() {
    const formattedMonth = state.currentMonth < 10 ? `0${state.currentMonth}` : state.currentMonth;
    currentMonthDisplay.textContent = `Tháng ${formattedMonth}/${state.currentYear}`;
}

// Get transactions for the currently viewed month
function getMonthTransactions() {
    const monthKey = `${state.currentYear}-${state.currentMonth < 10 ? '0' + state.currentMonth : state.currentMonth}`;
    return state.transactions.filter(t => t.date && t.date.startsWith(monthKey));
}

// 2. Summary Metrics & Budget
function renderMetricsAndBudget() {
    const monthTxs = getMonthTransactions();

    const incomes = monthTxs.filter(t => t.type === 'income');
    const expenses = monthTxs.filter(t => t.type === 'expense');

    const totalIncome = incomes.reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const totalExpense = expenses.reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const balance = totalIncome - totalExpense;

    // Metric Cards
    metricTotalIncome.textContent = formatVND(totalIncome);
    metricIncomeCount.textContent = `${incomes.length} khoản thu`;

    metricTotalExpense.textContent = formatVND(totalExpense);
    metricExpenseCount.textContent = `${expenses.length} khoản chi`;

    metricTotalBalance.textContent = formatVND(balance);

    // Budget
    const monthKey = `${state.currentYear}-${state.currentMonth < 10 ? '0' + state.currentMonth : state.currentMonth}`;
    const budgetLimit = state.budgetLimits[monthKey] || 6000000;

    budgetSpentDisplay.textContent = formatVND(totalExpense);
    budgetLimitDisplay.textContent = formatVND(budgetLimit);

    let pct = budgetLimit > 0 ? Math.round((totalExpense / budgetLimit) * 100) : 0;
    const progressFillPct = Math.min(pct, 100);

    budgetProgressBar.style.width = `${progressFillPct}%`;

    // Alert & remaining amount
    const remaining = budgetLimit - totalExpense;
    if (pct >= 85) {
        budgetProgressBar.style.backgroundColor = '#ea580c'; // warning amber/orange
        budgetAlertBox.style.display = 'flex';
        budgetAlertText.innerHTML = `Bạn đã dùng <strong>${pct}%</strong> ngân sách. Còn lại <strong>${formatVND(remaining)}</strong> cho các ngày cuối tháng.`;
    } else if (pct >= 100) {
        budgetProgressBar.style.backgroundColor = '#dc2626'; // danger red
        budgetAlertBox.style.display = 'flex';
        budgetAlertText.innerHTML = `⚠️ Cảnh báo: Bạn đã vượt quá ngân sách <strong>${formatVND(Math.abs(remaining))}</strong>!`;
    } else {
        budgetProgressBar.style.backgroundColor = '#2563eb';
        budgetAlertBox.style.display = 'flex';
        budgetAlertText.innerHTML = `Bạn đã dùng <strong>${pct}%</strong> ngân sách. Còn lại <strong>${formatVND(remaining)}</strong> trong tháng.`;
    }
}

// 3. Transactions Table
function renderTransactionsTable() {
    let list = getMonthTransactions();

    // Sort by date descending (newest first)
    list.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter by Type
    if (state.filterType !== 'all') {
        list = list.filter(t => t.type === state.filterType);
    }

    // Filter by Category
    if (state.filterCategory !== 'all') {
        list = list.filter(t => t.category === state.filterCategory);
    }

    // Filter by Search Query
    if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase().trim();
        list = list.filter(t => 
            (t.note && t.note.toLowerCase().includes(q)) ||
            (t.category && t.category.toLowerCase().includes(q)) ||
            t.amount.toString().includes(q)
        );
    }

    transactionTableBody.innerHTML = '';

    if (list.length === 0) {
        transactionTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table-msg">Không tìm thấy giao dịch nào phù hợp.</td>
            </tr>
        `;
        btnToggleViewAll.style.display = 'none';
        return;
    }

    // Display top 8 or all
    const totalMatching = list.length;
    const displayList = state.showAllTransactions ? list : list.slice(0, 8);

    displayList.forEach(tx => {
        const meta = CATEGORY_META[tx.category] || CATEGORY_META['Khác'];
        const isExpense = tx.type === 'expense';
        const sign = isExpense ? '- ' : '+ ';
        const amountClass = isExpense ? 'expense' : 'income';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="tx-date">${formatDateDisplay(tx.date)}</td>
            <td>
                <div class="category-cell">
                    <span class="category-icon-tag" style="background-color: var(--${meta.bgClass}-bg); color: var(--${meta.bgClass}-text);">
                        ${meta.letter}
                    </span>
                    <span class="category-name">${escapeHtml(tx.category)}</span>
                </div>
            </td>
            <td class="tx-note">${escapeHtml(tx.note || '—')}</td>
            <td class="tx-amount ${amountClass}">${sign}${formatVND(tx.amount)}</td>
            <td class="text-right">
                <div class="tx-actions">
                    <button type="button" class="btn-icon-action" onclick="openEditTxModal('${tx.id}')" title="Chỉnh sửa">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                    </button>
                    <button type="button" class="btn-icon-action delete" onclick="openDeleteTxModal('${tx.id}')" title="Xóa">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        transactionTableBody.appendChild(tr);
    });

    // Toggle view all button text and visibility
    if (totalMatching > 8) {
        btnToggleViewAll.style.display = 'inline-block';
        btnToggleViewAll.textContent = state.showAllTransactions 
            ? 'Thu gọn danh sách' 
            : `Xem tất cả ${totalMatching} giao dịch`;
    } else {
        btnToggleViewAll.style.display = 'none';
    }
}

// 4. Category Breakdown (Right Column)
function renderCategoryBreakdown() {
    const monthTxs = getMonthTransactions();
    const expenses = monthTxs.filter(t => t.type === 'expense');

    const totalExpense = expenses.reduce((acc, t) => acc + Number(t.amount || 0), 0);
    catSummaryTotal.textContent = `Tổng chi ${formatVND(totalExpense)}`;

    // Group expenses by category
    const catMap = {};
    expenses.forEach(t => {
        catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount || 0);
    });

    // Sort categories by amount descending
    const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

    categoryBreakdownContainer.innerHTML = '';

    if (sortedCats.length === 0) {
        categoryBreakdownContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 30px 0; font-size: 14px;">
                Chưa có khoản chi nào trong tháng này.
            </div>
        `;
        return;
    }

    sortedCats.forEach(([catName, amount]) => {
        const meta = CATEGORY_META[catName] || CATEGORY_META['Khác'];
        const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;

        const item = document.createElement('div');
        item.className = 'cat-breakdown-item';
        item.innerHTML = `
            <div class="cat-item-top">
                <span class="cat-item-name">${escapeHtml(catName)}</span>
                <span class="cat-item-amount">${formatVND(amount)} · ${percentage}%</span>
            </div>
            <div class="cat-progress-track">
                <div class="cat-progress-fill" style="width: ${percentage}%; background-color: ${meta.color};"></div>
            </div>
        `;
        categoryBreakdownContainer.appendChild(item);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =============================================================================
// 5. TRANSACTION MODAL (ADD / EDIT)
// =============================================================================
function populateCategorySelect(type, selectedCategory = '') {
    txCategorySelect.innerHTML = '';
    const availableCategories = Object.keys(CATEGORY_META).filter(cat => {
        return CATEGORY_META[cat].type === type;
    });

    availableCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (cat === selectedCategory) option.selected = true;
        txCategorySelect.appendChild(option);
    });
}

function setModalType(type) {
    activeModalType = type;
    if (type === 'expense') {
        modalTypeExpense.classList.add('active');
        modalTypeIncome.classList.remove('active');
    } else {
        modalTypeIncome.classList.add('active');
        modalTypeExpense.classList.remove('active');
    }
    populateCategorySelect(type);
}

modalTypeExpense.addEventListener('click', () => setModalType('expense'));
modalTypeIncome.addEventListener('click', () => setModalType('income'));

function openAddTxModal() {
    state.editingTxId = null;
    modalTxTitle.textContent = 'Thêm Giao Dịch Mới';
    txForm.reset();
    txIdInput.value = '';

    // Default date to current active month
    const today = new Date();
    const mm = state.currentMonth < 10 ? `0${state.currentMonth}` : state.currentMonth;
    const dd = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();
    txDateInput.value = `${state.currentYear}-${mm}-${dd}`;

    setModalType('expense');
    txModal.classList.add('active');
    setTimeout(() => txAmountInput.focus(), 150);
}

function openEditTxModal(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    state.editingTxId = id;
    modalTxTitle.textContent = 'Chỉnh Sửa Giao Dịch';
    txIdInput.value = tx.id;
    txAmountInput.value = new Intl.NumberFormat('vi-VN').format(tx.amount);
    txDateInput.value = tx.date;
    txNoteInput.value = tx.note || '';

    setModalType(tx.type);
    populateCategorySelect(tx.type, tx.category);

    txModal.classList.add('active');
    setTimeout(() => txAmountInput.focus(), 150);
}

function closeTxModal() {
    txModal.classList.remove('active');
}

btnOpenAddModal.addEventListener('click', openAddTxModal);
btnCloseTxModal.addEventListener('click', closeTxModal);
btnCancelTxModal.addEventListener('click', closeTxModal);

// Submit Transaction Form
txForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const rawAmount = txAmountInput.value.replace(/\D/g, '');
    const amount = parseInt(rawAmount, 10);
    if (!amount || amount <= 0) {
        alert('Vui lòng nhập số tiền hợp lệ lớn hơn 0!');
        txAmountInput.focus();
        return;
    }

    const category = txCategorySelect.value;
    const date = txDateInput.value;
    const note = txNoteInput.value.trim();

    if (!date) {
        alert('Vui lòng chọn ngày giao dịch!');
        return;
    }

    if (state.editingTxId) {
        // Edit existing
        const index = state.transactions.findIndex(t => t.id === state.editingTxId);
        if (index !== -1) {
            state.transactions[index] = {
                ...state.transactions[index],
                type: activeModalType,
                amount,
                category,
                date,
                note
            };
            showToast('Đã cập nhật giao dịch thành công!');
        }
    } else {
        // Add new
        const newTx = {
            id: 'tx-' + Date.now(),
            type: activeModalType,
            amount,
            category,
            date,
            note
        };
        state.transactions.unshift(newTx);
        showToast('Đã thêm giao dịch thành công!');
    }

    persistData();
    closeTxModal();
    renderApp();
});

// =============================================================================
// 6. DELETE TRANSACTION MODAL
// =============================================================================
function openDeleteTxModal(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    state.deletingTxId = id;
    deleteTxDescText.textContent = `"${tx.note || tx.category}" (${formatVND(tx.amount)})`;
    confirmDeleteModal.classList.add('active');
}

function closeDeleteModal() {
    state.deletingTxId = null;
    confirmDeleteModal.classList.remove('active');
}

btnCancelDeleteModal.addEventListener('click', closeDeleteModal);

btnConfirmDeleteTx.addEventListener('click', () => {
    if (state.deletingTxId) {
        state.transactions = state.transactions.filter(t => t.id !== state.deletingTxId);
        persistData();
        closeDeleteModal();
        renderApp();
        showToast('Đã xóa giao dịch!');
    }
});

// =============================================================================
// 7. MONTHLY BUDGET MODAL
// =============================================================================
function openBudgetModal() {
    const monthKey = `${state.currentYear}-${state.currentMonth < 10 ? '0' + state.currentMonth : state.currentMonth}`;
    const currentLimit = state.budgetLimits[monthKey] || 6000000;
    budgetLimitInput.value = new Intl.NumberFormat('vi-VN').format(currentLimit);
    budgetModal.classList.add('active');
    setTimeout(() => budgetLimitInput.focus(), 150);
}

function closeBudgetModal() {
    budgetModal.classList.remove('active');
}

btnOpenBudgetModal.addEventListener('click', openBudgetModal);
btnCloseBudgetModal.addEventListener('click', closeBudgetModal);
btnCancelBudgetModal.addEventListener('click', closeBudgetModal);

budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawLimit = budgetLimitInput.value.replace(/\D/g, '');
    const limit = parseInt(rawLimit, 10);
    if (!limit || limit <= 0) {
        alert('Vui lòng nhập hạn mức hợp lệ!');
        return;
    }

    const monthKey = `${state.currentYear}-${state.currentMonth < 10 ? '0' + state.currentMonth : state.currentMonth}`;
    state.budgetLimits[monthKey] = limit;
    persistData();
    closeBudgetModal();
    renderMetricsAndBudget();
    showToast('Đã lưu hạn mức ngân sách tháng!');
});

// =============================================================================
// 8. MONTH NAVIGATION (< and >)
// =============================================================================
btnPrevMonth.addEventListener('click', () => {
    if (state.currentMonth === 1) {
        state.currentMonth = 12;
        state.currentYear--;
    } else {
        state.currentMonth--;
    }
    renderApp();
});

btnNextMonth.addEventListener('click', () => {
    if (state.currentMonth === 12) {
        state.currentMonth = 1;
        state.currentYear++;
    } else {
        state.currentMonth++;
    }
    renderApp();
});

// =============================================================================
// 9. SEARCH & FILTERS
// =============================================================================
searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderTransactionsTable();
});

segmentedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        segmentedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.filterType = btn.dataset.filterType;
        renderTransactionsTable();
    });
});

categoryFilterSelect.addEventListener('change', (e) => {
    state.filterCategory = e.target.value;
    renderTransactionsTable();
});

btnToggleViewAll.addEventListener('click', () => {
    state.showAllTransactions = !state.showAllTransactions;
    renderTransactionsTable();
});

// =============================================================================
// 10. EXPORT CSV (UTF-8 BOM supported in MS Excel)
// =============================================================================
btnExportCsv.addEventListener('click', () => {
    const list = getMonthTransactions();
    if (list.length === 0) {
        alert('Không có giao dịch nào để xuất CSV!');
        return;
    }

    // CSV Header with BOM for proper Vietnamese accents display
    let csvContent = '\uFEFFMã GD,Ngày,Loại,Danh mục,Ghi chú,Số tiền (VNĐ)\n';

    list.forEach(tx => {
        const typeStr = tx.type === 'expense' ? 'Chi tiêu' : 'Thu nhập';
        const noteStr = `"${(tx.note || '').replace(/"/g, '""')}"`;
        const amountStr = tx.type === 'expense' ? -tx.amount : tx.amount;
        csvContent += `${tx.id},${formatDateDisplay(tx.date)},${typeStr},${tx.category},${noteStr},${amountStr}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const mm = state.currentMonth < 10 ? `0${state.currentMonth}` : state.currentMonth;
    link.setAttribute('href', url);
    link.setAttribute('download', `MoneyNote_Thang_${mm}_${state.currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Đã xuất file CSV thành công!');
});

// =============================================================================
// 11. DARK MODE TOGGLE & KEYBOARD SHORTCUTS
// =============================================================================
function initDarkMode() {
    const isDark = localStorage.getItem('moneynote_dark_mode') === 'true';
    darkModeToggle.checked = isDark;
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
}

darkModeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('moneynote_dark_mode', 'true');
        showToast('Đã bật Chế độ tối');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('moneynote_dark_mode', 'false');
        showToast('Đã chuyển sang Chế độ sáng');
    }
});

// Close modals on click outside or Escape
window.addEventListener('click', (e) => {
    if (e.target === txModal) closeTxModal();
    if (e.target === budgetModal) closeBudgetModal();
    if (e.target === confirmDeleteModal) closeDeleteModal();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeTxModal();
        closeBudgetModal();
        closeDeleteModal();
    }
});

// Sidebar navigation click handler
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const view = item.dataset.view;
        if (view === 'transactions') {
            state.showAllTransactions = true;
            renderTransactionsTable();
            window.scrollTo({ top: 400, behavior: 'smooth' });
        } else if (view === 'dashboard') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (view === 'statistics') {
            window.scrollTo({ top: 400, behavior: 'smooth' });
        } else if (view === 'settings') {
            openBudgetModal();
        }
    });
});

// Global functions exposed to inline handlers
window.openEditTxModal = openEditTxModal;
window.openDeleteTxModal = openDeleteTxModal;

// =============================================================================
// INITIALIZE APPLICATION
// =============================================================================
initDarkMode();
renderApp();
