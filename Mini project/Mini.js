// ==========================================
// 1. MẢNG DỮ LIỆU CÔNG VIỆC (TODOS ARRAY)
// ==========================================
const DEFAULT_TODOS = [
    { id: 1, text: 'gghh', completed: true },
    { id: 2, text: 'gggg', completed: false }
];

// Khởi tạo mảng dữ liệu (lấy từ LocalStorage nếu có, ngược lại dùng mảng mặc định)
let todos = JSON.parse(localStorage.getItem('mini_todos')) || DEFAULT_TODOS;

// Biến lưu id công việc đang ở chế độ chỉnh sửa (null nếu không sửa)
let editingId = null;

// Biến lưu id công việc đang chờ xác nhận xóa
let taskToDeleteId = null;

// Các phần tử DOM
const taskInput = document.getElementById('task-input');
const btnAdd = document.getElementById('btn-add');
const errorMsg = document.getElementById('error-msg');
const todoList = document.getElementById('todo-list');
const completedCountEl = document.getElementById('completed-count');
const totalCountEl = document.getElementById('total-count');
const allCompletedBadge = document.getElementById('all-completed-badge');

// Các phần tử DOM của Hộp thoại Xóa
const deleteModal = document.getElementById('delete-modal');
const deleteTaskTitleEl = document.getElementById('delete-task-title');
const btnCancelDelete = document.getElementById('btn-cancel-delete');
const btnConfirmDelete = document.getElementById('btn-confirm-delete');

// Lưu mảng vào LocalStorage
function saveTodos() {
    localStorage.setItem('mini_todos', JSON.stringify(todos));
}

// Cập nhật số đếm ở footer & kiểm tra điều kiện hoàn thành tất cả
function updateStatus() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;

    // 1. Tự động đếm và hiển thị số công việc đã hoàn thành / tổng số công việc
    totalCountEl.textContent = total;
    completedCountEl.textContent = completed;

    // 2. Khi tất cả công việc đã hoàn thành (ít nhất có 1 việc và hoàn thành 100%)
    if (total > 0 && completed === total) {
        allCompletedBadge.classList.add('show');
    } else {
        allCompletedBadge.classList.remove('show');
    }
}

// ==========================================
// 2. RENDER DANH SÁCH TỪ MẢNG DỮ LIỆU
// ==========================================
function renderTodos() {
    // Xóa nội dung danh sách cũ
    todoList.innerHTML = '';

    // Nếu mảng rỗng thì hiển thị thông báo
    if (todos.length === 0) {
        todoList.innerHTML = '<li class="empty-state">Chưa có công việc nào. Hãy thêm công việc mới!</li>';
        updateStatus();
        return;
    }

    // Duyệt qua từng công việc trong mảng dữ liệu để render
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.dataset.id = todo.id;

        // KIỂM TRA NẾU ĐANG Ở CHẾ ĐỘ SỬA CỦA CÔNG VIỆC NÀY
        if (todo.id === editingId) {
            li.className = 'todo-item editing';
            li.innerHTML = `
                <div class="edit-wrapper">
                    <input 
                        type="text" 
                        class="edit-input" 
                        id="edit-input-${todo.id}" 
                        value="${escapeHtml(todo.text)}"
                        onkeydown="handleEditKeydown(event, ${todo.id})"
                        oninput="handleEditInput(${todo.id})"
                        autocomplete="off"
                    >
                    <span class="edit-error-msg" id="edit-error-${todo.id}">⚠️ Tên công việc không được để trống!</span>
                </div>
                <div class="todo-actions">
                    <button type="button" class="btn-action btn-save" onclick="saveEdit(${todo.id})">
                        💾 Lưu
                    </button>
                    <button type="button" class="btn-action btn-cancel" onclick="cancelEdit()">
                        ❌ Hủy
                    </button>
                </div>
            `;
        } else {
            // CHẾ ĐỘ HIỂN THỊ BÌNH THƯỜNG
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <div class="todo-content">
                    <input 
                        type="checkbox" 
                        id="todo-${todo.id}" 
                        class="todo-checkbox" 
                        ${todo.completed ? 'checked' : ''} 
                        onchange="toggleTodo(${todo.id})"
                    >
                    <label for="todo-${todo.id}" class="todo-text">${escapeHtml(todo.text)}</label>
                </div>
                <div class="todo-actions">
                    <button type="button" class="btn-action btn-edit" onclick="startEdit(${todo.id})">
                        ✏️ Sửa
                    </button>
                    <button type="button" class="btn-action btn-delete" onclick="deleteTodo(${todo.id})">
                        🗑️ Xóa
                    </button>
                </div>
            `;
        }

        todoList.appendChild(li);
    });

    // Cập nhật số đếm ở footer
    updateStatus();
}

// ==========================================
// 3. CHỨC NĂNG SỬA CÔNG VIỆC
// ==========================================

// 1. Chuyển sang chế độ chỉnh sửa
function startEdit(id) {
    editingId = id;
    renderTodos();

    // Tự động focus vào ô input chỉnh sửa và bôi đen nội dung để tiện gõ
    const editInput = document.getElementById(`edit-input-${id}`);
    if (editInput) {
        editInput.focus();
        editInput.select();
    }
}

// 2. Lưu chỉnh sửa
function saveEdit(id) {
    const editInput = document.getElementById(`edit-input-${id}`);
    if (!editInput) return;

    const newText = editInput.value.trim();

    // Validate: Không cho phép lưu nội dung rỗng
    if (!newText) {
        const errorEl = document.getElementById(`edit-error-${id}`);
        if (errorEl) errorEl.classList.add('show');
        editInput.classList.add('input-error');
        editInput.focus();
        return;
    }

    // Cập nhật tên công việc trong mảng dữ liệu
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.text = newText;
        saveTodos();
    }

    // Thoát chế độ sửa và render lại danh sách
    editingId = null;
    renderTodos();
}

// 3. Hủy chỉnh sửa
function cancelEdit() {
    editingId = null;
    renderTodos();
}

// 4. Xử lý phím Enter (Lưu) và Escape (Hủy)
function handleEditKeydown(e, id) {
    if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit(id);
    } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
    }
}

// 5. Khi người dùng nhập lại thì ẩn lỗi
function handleEditInput(id) {
    const errorEl = document.getElementById(`edit-error-${id}`);
    const editInput = document.getElementById(`edit-input-${id}`);
    if (errorEl && errorEl.classList.contains('show')) {
        errorEl.classList.remove('show');
        editInput.classList.remove('input-error');
    }
}

// =======================================================
// 4. CHỨC NĂNG: ĐÁNH DẤU HOÀN THÀNH / CHƯA HOÀN THÀNH
// =======================================================
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Cập nhật trạng thái trong mảng dữ liệu
    todo.completed = !todo.completed;
    saveTodos();

    // Render lại danh sách và cập nhật footer
    renderTodos();
}

// ==========================================
// 5. CHỨC NĂNG: THÊM CÔNG VIỆC MỚI
// ==========================================
function handleAddTodo() {
    const taskText = taskInput.value.trim();

    // Validate: Không cho phép thêm công việc rỗng
    if (!taskText) {
        showError('⚠️ Vui lòng nhập tên công việc!');
        return;
    }

    // Tạo công việc mới với completed = false
    const newTodo = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    // Thêm vào mảng dữ liệu
    todos.push(newTodo);
    saveTodos();

    // Thoát chế độ sửa (nếu đang mở sửa ở task nào đó)
    editingId = null;

    // Cập nhật danh sách công việc
    renderTodos();

    // Xóa nội dung trong ô input
    taskInput.value = '';

    // Tự động focus vào ô input để tiếp tục nhập
    taskInput.focus();

    // Ẩn lỗi nếu đang hiển thị
    hideError();
}

// ==========================================
// 6. CHỨC NĂNG XÓA CÔNG VIỆC (MODAL CAO CẤP)
// ==========================================

// Mở hộp thoại xác nhận xóa
function deleteTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Lưu lại ID công việc cần xóa
    taskToDeleteId = id;

    // Cập nhật tên công việc vào nội dung modal
    deleteTaskTitleEl.textContent = `"${todo.text}"`;

    // Mở modal với hiệu ứng làm mờ nền
    deleteModal.classList.add('active');
}

// Đóng hộp thoại xác nhận xóa
function closeDeleteModal() {
    taskToDeleteId = null;
    deleteModal.classList.remove('active');
}

// Thực hiện xóa sau khi người dùng bấm "Xác Nhận Xóa"
function confirmDelete() {
    if (taskToDeleteId === null) return;

    // Nếu đang chỉnh sửa công việc này thì thoát chế độ sửa
    if (editingId === taskToDeleteId) {
        editingId = null;
    }

    // Xóa công việc khỏi mảng dữ liệu
    todos = todos.filter(t => t.id !== taskToDeleteId);
    saveTodos();

    // Render lại danh sách và cập nhật số lượng ở footer
    renderTodos();

    // Đóng modal
    closeDeleteModal();
}

function showError(message) {
    errorMsg.textContent = message || '⚠️ Vui lòng nhập tên công việc!';
    errorMsg.classList.add('show');
    taskInput.classList.add('input-error');
    taskInput.focus();
}

function hideError() {
    errorMsg.classList.remove('show');
    taskInput.classList.remove('input-error');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// 7. SỰ KIỆN LẮNG NGHE (EVENT LISTENERS)
// ==========================================
// Click nút "Thêm"
btnAdd.addEventListener('click', handleAddTodo);

// Nhấn Enter trong ô input thêm mới
taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        handleAddTodo();
    }
});

// Bắt đầu nhập ở ô thêm mới thì ẩn lỗi
taskInput.addEventListener('input', () => {
    if (errorMsg.classList.contains('show')) {
        hideError();
    }
});

// Sự kiện cho Modal Xóa:
// 1. Nút Hủy
btnCancelDelete.addEventListener('click', closeDeleteModal);

// 2. Nút Xác Nhận Xóa
btnConfirmDelete.addEventListener('click', confirmDelete);

// 3. Click vào lớp nền mờ ngoài hộp thoại để đóng
deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
        closeDeleteModal();
    }
});

// 4. Phím tắt cho Modal: Escape để Hủy, Enter để Xác Nhận Xóa
window.addEventListener('keydown', (e) => {
    if (!deleteModal.classList.contains('active')) return;

    if (e.key === 'Escape') {
        closeDeleteModal();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        confirmDelete();
    }
});

// ==========================================
// KHỞI CHẠY LẦN ĐẦU
// ==========================================
renderTodos();
taskInput.focus();
