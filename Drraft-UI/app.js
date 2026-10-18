// ============================================================================
// 1. CẤU HÌNH ĐƯỜNG DẪN REST API & DỮ LIỆU MẪU
// ============================================================================

// Đổi thành `true` khi bạn đã có link API thật từ MockAPI.io hoặc JSON-Server
const USE_REAL_REST_API = false; 

// Đường dẫn API của bạn (Ví dụ khi dùng json-server hoặc mockapi.io)
const REST_API_BASE_URL = "https://670000000000000000000000.mockapi.io/api/v1/tasks";

// Dữ liệu mẫu ban đầu (Giúp bạn test giao diện ngay khi chưa bật Server API)
let localTasksDatabase = [
    {
        id: "101",
        title: "Ôn tập kiến thức Fetch API (GET, POST)",
        description: "Xem lại cách dùng async/await và chuyển đổi JSON",
        date: "October 15",
        time: "10:30 PM",
        listId: "1", // 1: My Tasks, 2: Thư viện, 3: Lịch học
        isCompleted: false
    },
    {
        id: "102",
        title: "Mượn sách Lập trình JavaScript nâng cao",
        description: "Tìm ở kệ sách tầng 2 khu công nghệ thông tin",
        date: "October 16",
        time: "09:00 AM",
        listId: "2",
        isCompleted: false
    }
];

// ============================================================================
// 2. TRUY XUẤT CÁC PHẦN TỬ HTML (DOM ELEMENTS) - KHÔNG VIẾT TẮT
// ============================================================================

const openCreateTaskModalButton = document.getElementById("open-create-task-modal-button");
const closeTaskModalButton = document.getElementById("close-task-modal-button");
const createTaskModalOverlay = document.getElementById("create-task-modal-overlay");
const inlineAddTaskButtons = document.querySelectorAll(".inline-add-task-button");

// Các phần tử trong Form tạo công việc
const createTaskForm = document.getElementById("create-task-form");
const taskTitleInput = document.getElementById("task-title-input");
const taskDateInput = document.getElementById("task-date-input");
const taskTimeInput = document.getElementById("task-time-input");
const taskDescriptionTextarea = document.getElementById("task-description-textarea");
const taskTargetListSelect = document.getElementById("task-target-list-select");

// Checkbox ẩn/hiện cột danh sách ở thanh Sidebar bên trái
const sidebarListCheckboxes = document.querySelectorAll(".sidebar-list-checkbox");

// ============================================================================
// 3. CÁC HÀM GỌI REST API (GET, POST, PATCH, DELETE)
// ============================================================================

/**
 * [GET] Lấy danh sách toàn bộ công việc từ Server
 */
async function fetchAllTasksFromServer() {
    try {
        if (USE_REAL_REST_API) {
            const response = await fetch(REST_API_BASE_URL, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            const tasksDataFromApi = await response.json();
            renderAllTasksToBoard(tasksDataFromApi);
        } else {
            // Chạy bằng dữ liệu mẫu nếu chưa gắn link API
            renderAllTasksToBoard(localTasksDatabase);
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu công việc (GET):", error);
    }
}

/**
 * [POST] Thêm một công việc mới lên Server
 */
async function createNewTaskOnServer(newTaskObject) {
    try {
        if (USE_REAL_REST_API) {
            const response = await fetch(REST_API_BASE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTaskObject)
            });
            const createdTask = await response.json();
            console.log("Đã tạo thành công trên API:", createdTask);
        } else {
            // Tạo ID ngẫu nhiên và lưu vào mảng tạm
            newTaskObject.id = Date.now().toString();
            localTasksDatabase.push(newTaskObject);
        }

        // Tải lại danh sách công việc lên giao diện sau khi thêm
        await fetchAllTasksFromServer();
    } catch (error) {
        console.error("Lỗi khi tạo công việc mới (POST):", error);
    }
}

/**
 * [PATCH / PUT] Cập nhật trạng thái hoàn thành của công việc
 */
async function updateTaskCompletionStatusOnServer(taskId, currentCompletedStatus) {
    const newCompletedStatus = !currentCompletedStatus;

    try {
        if (USE_REAL_REST_API) {
            await fetch(`${REST_API_BASE_URL}/${taskId}`, {
                method: "PUT", // Hoặc "PATCH" tùy thuộc vào thiết kế API của bạn
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isCompleted: newCompletedStatus })
            });
        } else {
            const targetTask = localTasksDatabase.find(function(task) {
                return task.id === String(taskId);
            });
            if (targetTask) {
                targetTask.isCompleted = newCompletedStatus;
            }
        }

        await fetchAllTasksFromServer();
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái công việc (PUT/PATCH):", error);
    }
}

/**
 * [DELETE] Xóa vĩnh viễn một công việc khỏi Server
 */
async function deleteTaskFromServer(taskId) {
    try {
        if (USE_REAL_REST_API) {
            await fetch(`${REST_API_BASE_URL}/${taskId}`, {
                method: "DELETE"
            });
        } else {
            localTasksDatabase = localTasksDatabase.filter(function(task) {
                return task.id !== String(taskId);
            });
        }

        await fetchAllTasksFromServer();
    } catch (error) {
        console.error("Lỗi khi xóa công việc (DELETE):", error);
    }
}

// ============================================================================
// 4. HÀM HIỂN THỊ DỮ LIỆU LÊN GIAO DIỆN (RENDER DOM)
// ============================================================================

function renderAllTasksToBoard(tasksArray) {
    const allColumnCards = document.querySelectorAll(".task-list-column-card");

    allColumnCards.forEach(function(columnCard) {
        const currentColumnListId = columnCard.getAttribute("data-list-id");
        const activeTasksContainer = columnCard.querySelector(".active-tasks-list-container");
        const emptyStateContainer = columnCard.querySelector(".empty-tasks-state-container");
        const completedTasksButtonText = columnCard.querySelector(".toggle-completed-tasks-button span:last-child");

        // Xóa dữ liệu cũ trước khi vẽ lại
        activeTasksContainer.innerHTML = "";

        // Lọc ra các công việc thuộc về cột hiện tại (My Tasks / Thư viện / Lịch học)
        const tasksBelongingToThisColumn = tasksArray.filter(function(task) {
            return String(task.listId) === String(currentColumnListId);
        });

        // Chia thành 2 nhóm: Chưa hoàn thành và Đã hoàn thành
        const uncompletedTasks = tasksBelongingToThisColumn.filter(function(task) {
            return task.isCompleted === false;
        });

        const completedTasks = tasksBelongingToThisColumn.filter(function(task) {
            return task.isCompleted === true;
        });

        // Cập nhật số lượng công việc đã hoàn thành ở dưới đáy cột
        completedTasksButtonText.textContent = `Completed (${completedTasks.length})`;

        // Kiểm tra: Nếu không có việc nào đang làm -> Hiện hình minh họa "All tasks complete"
        if (uncompletedTasks.length === 0) {
            emptyStateContainer.style.display = "flex";
        } else {
            emptyStateContainer.style.display = "none";

            // Duyệt qua từng công việc chưa hoàn thành để tạo thẻ HTML
            uncompletedTasks.forEach(function(task) {
                const taskListItemElement = createTaskHtmlElement(task);
                activeTasksContainer.appendChild(taskListItemElement);
            });
        }
    });
}

/**
 * Hàm tạo thẻ <li> cho từng công việc
 */
function createTaskHtmlElement(taskObject) {
    const listItem = document.createElement("li");
    listItem.className = "single-task-item";
    listItem.setAttribute("data-task-id", taskObject.id);

    // Tạo chuỗi hiển thị ngày giờ nếu người dùng có nhập
    let dateTimeBadgeHtml = "";
    if (taskObject.date || taskObject.time) {
        dateTimeBadgeHtml = `<span class="task-item-datetime-badge">${taskObject.date} ${taskObject.time}</span>`;
    }

    listItem.innerHTML = `
        <button class="complete-task-radio-button" title="Đánh dấu hoàn thành"></button>
        <div class="task-item-content" style="flex: 1;">
            <p class="task-item-title">${taskObject.title}</p>
            ${taskObject.description ? `<p class="task-item-description">${taskObject.description}</p>` : ""}
            ${dateTimeBadgeHtml}
        </div>
        <button class="icon-button delete-task-button" title="Xóa công việc" style="width: 28px; height: 28px;">
            <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
        </button>
    `;

    // Bắt sự kiện bấm nút tròn để Hoàn thành công việc (Gọi API PUT/PATCH)
    const completeButton = listItem.querySelector(".complete-task-radio-button");
    completeButton.addEventListener("click", function() {
        updateTaskCompletionStatusOnServer(taskObject.id, taskObject.isCompleted);
    });

    // Bắt sự kiện bấm nút thùng rác để Xóa công việc (Gọi API DELETE)
    const deleteButton = listItem.querySelector(".delete-task-button");
    deleteButton.addEventListener("click", function() {
        deleteTaskFromServer(taskObject.id);
    });

    return listItem;
}

// ============================================================================
// 5. XỬ LÝ SỰ KIỆN GIAO DIỆN (ĐÓNG/MỞ MODAL, SUBMIT FORM, ẨN/HIỆN CỘT)
// ============================================================================

/**
 * Mở hộp thoại tạo công việc mới và tự động chọn sẵn danh sách tương ứng
 */
function openCreateTaskModal(defaultListId = "1") {
    taskTargetListSelect.value = defaultListId;
    createTaskModalOverlay.classList.remove("hidden-modal");
    taskTitleInput.focus();
}

/**
 * Đóng hộp thoại và xóa trắng dữ liệu trong form
 */
function closeCreateTaskModal() {
    createTaskModalOverlay.classList.add("hidden-modal");
    createTaskForm.reset();
}

// Sự kiện bấm nút "+ Create" ở góc trái trên cùng
openCreateTaskModalButton.addEventListener("click", function() {
    openCreateTaskModal("1");
});

// Sự kiện bấm nút "X" đóng Modal
closeTaskModalButton.addEventListener("click", closeCreateTaskModal);

// Sự kiện bấm ra vùng nền tối bên ngoài để đóng Modal
createTaskModalOverlay.addEventListener("click", function(event) {
    if (event.target === createTaskModalOverlay) {
        closeCreateTaskModal();
    }
});

// Sự kiện bấm nút "Add a task" trên từng cột -> Mở modal và chọn đúng cột đó
inlineAddTaskButtons.forEach(function(button) {
    button.addEventListener("click", function(event) {
        const parentColumnCard = event.target.closest(".task-list-column-card");
        const columnListId = parentColumnCard.getAttribute("data-list-id");
        openCreateTaskModal(columnListId);
    });
});

// Sự kiện khi người dùng bấm nút "Save" trong Form (Gọi API POST)
createTaskForm.addEventListener("submit", async function(event) {
    // Ngăn trình duyệt tự động tải lại trang
    event.preventDefault();

    const newTaskData = {
        title: taskTitleInput.value.trim(),
        description: taskDescriptionTextarea.value.trim(),
        date: taskDateInput.value.trim(),
        time: taskTimeInput.value.trim(),
        listId: taskTargetListSelect.value,
        isCompleted: false
    };

    if (newTaskData.title === "") {
        alert("Vui lòng nhập tiêu đề công việc!");
        return;
    }

    await createNewTaskOnServer(newTaskData);
    closeCreateTaskModal();
});

// Sự kiện bật/tắt các checkbox ở thanh Sidebar bên trái để ẩn/hiện cột tương ứng
sidebarListCheckboxes.forEach(function(checkbox) {
    checkbox.addEventListener("change", function(event) {
        const listMenuItem = event.target.closest(".navigation-menu-item");
        const listId = listMenuItem.getAttribute("data-list-id");
        const correspondingColumn = document.querySelector(`.task-list-column-card[data-list-id="${listId}"]`);

        if (correspondingColumn) {
            if (event.target.checked) {
                correspondingColumn.style.display = "flex";
            } else {
                correspondingColumn.style.display = "none";
            }
        }
    });
});

// ============================================================================
// 6. KHỞI CHẠY ỨNG DỤNG LẦN ĐẦU TIÊN
// ============================================================================

// Mặc định ẩn Modal khi vừa vào trang và gọi API lấy danh sách công việc
closeCreateTaskModal();
fetchAllTasksFromServer();