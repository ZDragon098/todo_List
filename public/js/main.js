// Connect module: api.js, render.js, modal.js, utils.js

const taskCreationForm = document.getElementById("task-creation-form");
const inputCreationTitle = document.getElementById("task-creation-input-field");
const inputCreationDeadline = document.getElementById("task-creation-deadline-input-field");
const inputCreationTime = document.getElementById("task-creation-time-input-field");
const selectCreationTopic = document.getElementById("task-creation-topic-select-field");
const textareaCreationDescription = document.getElementById("task-creation-description-input-field");

const taskListContainer = document.getElementById("task-list-item-container");

async function loadTodos() {
  const todos = await getTodos();
  renderTodoList(todos);
  renderTrackingList(todos);
}


// Submit tao cong viec moi
if (taskCreationForm) {
  taskCreationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titleValue = inputCreationTitle ? inputCreationTitle.value.trim() : "";
    if (!titleValue) {
      showToast("Vui lòng nhập tiêu đề công việc!");
      return;
    }

    const newTodoData = {

      title: titleValue,
      deadline: inputCreationDeadline ? inputCreationDeadline.value : "",
      time: inputCreationTime ? inputCreationTime.value : "",
      topic: selectCreationTopic ? selectCreationTopic.value : "Khác",
      description: textareaCreationDescription ? textareaCreationDescription.value.trim() : "",
    };

    await createTodo(newTodoData);
    taskCreationForm.reset();
    await loadTodos();
    showToast("Tạo thành công");

  });
}

// Checkbox change
if (taskListContainer) {
  taskListContainer.addEventListener("change", async (e) => {
    const checkbox = e.target;
    if (!checkbox.classList.contains("task-item-checkbox-input")) return;

    const card = checkbox.closest(".task-item-card");
    if (!card) return;

    const id = card.getAttribute("data-task-identifier");
    const isDone = checkbox.checked;

    await updateTodo(id, { done: isDone });
    await loadTodos();
    showToast(isDone ? "Đã hoàn thành" : "Đang làm");
  });

  // Sự kiện Click nút Sửa và nút Xoá trên từng thẻ công việc
  taskListContainer.addEventListener("click", (e) => {
    // Nút Sửa
    const editBtn = e.target.closest(".task-item-edit-action-button");
    if (editBtn) {
      const card = e.target.closest(".task-item-card");
      if (!card) return;

      const descElement = card.querySelector(".task-item-description-text");
      const titleElement = card.querySelector(".task-item-title-text");

      const todoData = {
        id: card.getAttribute("data-task-identifier"),
        title: titleElement ? titleElement.textContent : "",
        topic: card.getAttribute("data-task-topic") || "Trống ",
        deadline: card.getAttribute("data-task-deadline") || "",
        time: card.getAttribute("data-task-time") || "",
        description: descElement ? descElement.textContent : ""
      };

      openEditModal(todoData);
      return;
    }

    // Bam nut xoa
    const deleteBtn = e.target.closest(".task-item-delete-action-button");
    if (deleteBtn) {
      const card = deleteBtn.closest(".task-item-card");
      if (!card) return;

      const id = card.getAttribute("data-task-identifier");
      const topic = card.getAttribute("data-task-topic");
      const titleElement = card.querySelector(".task-item-title-text");
      const title = titleElement ? titleElement.textContent : "";

      openDeleteModal(id, title, topic);
      return;
    }
  });
}

// Form sửa công việc
if (editModalForm) {
  editModalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!todoIdToEdit) return;

    const updatedData = {
      title: editTitleInput ? editTitleInput.value.trim() : "",
      deadline: editDeadlineInput ? editDeadlineInput.value : "",
      time: editTimeInput ? editTimeInput.value : "",
      topic: editTopicInput ? editTopicInput.value : "",
      description: editDescInput ? editDescInput.value.trim() : "",
    };

    if (!updatedData.title) {
      showToast("Tiêu đề không được để trống!");
      return;
    }
    await updateTodo(todoIdToEdit, updatedData);
    closeEditModal();
    await loadTodos();
    showToast("Cập nhật thành công!");
  })
}

// Xác nhận xoá công việc
if (deleteConfirmBtn) {
  deleteConfirmBtn.addEventListener("click", async () => {
    if (!todoIdToDelete) return;

    await deleteTodo(todoIdToDelete);
    closeDeleteModal();
    await loadTodos();
    showToast("Xoá thành công");
  })
}

loadTodos();
