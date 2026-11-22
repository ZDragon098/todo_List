// Modal patch
const editModalBackdrop = document.getElementById("task-edit-modal-dialog-backdrop");
const editModalForm = document.getElementById("task-edit-modal-form");
const editCloseBtn = document.getElementById("task-edit-modal-close-icon-button");
const editCancelBtn = document.getElementById("task-edit-modal-cancel-button");

const editIdInput = document.getElementById("task-edit-modal-identifier-input");
const editTitleInput = document.getElementById("task-edit-modal-title-input");
const editDeadlineInput = document.getElementById("task-edit-modal-deadline-input-field");
const editTimeInput = document.getElementById("task-edit-modal-time-input-field");
const editTopicInput = document.getElementById("task-edit-modal-topic-input-field");
const editDescInput = document.getElementById("task-edit-modal-description-textarea-field");

let todoIdToEdit = null;

function openEditModal(todoData) {
  todoIdToEdit = todoData.id;
  editIdInput.value = `#${String(todoData.id).padStart(2, "0")}`;
  editTitleInput.value = todoData.title || "";
  editDeadlineInput.value = todoData.deadline || "";
  editTimeInput.value = todoData.time || "";
  editTopicInput.value = todoData.topic || "";
  editDescInput.value = todoData.description || "";

  editModalBackdrop.classList.add("is-visible");
  editModalBackdrop.setAttribute("aria-hidden", "false");
}

function closeEditModal() {
  todoIdtoEdit = null;
  editModalBackdrop.classList.remove("is-visible");
  editModalBackdrop.setAttribute("aria-hidden", "true");
}

if (editCancelBtn) editCancelBtn.addEventListener("click", closeEditModal);
if (editCloseBtn) editCloseBtn.addEventListener("click", closeEditModal);
if (editModalBackdrop) {
  editModalBackdrop.addEventListener("click", (e) => {
    if (e.target === editModalBackdrop) closeEditModal();
  });
}

// Modal Delete
const deleteModalBackdrop = document.getElementById("task-delete-confirmation-modal-backdrop");
const deleteCloseBtn = document.getElementById("task-delete-confirmation-close-icon-button");
const deleteCancelBtn = document.getElementById("task-delete-confirmation-cancel-button");
const deleteConfirmBtn = document.getElementById("task-delete-confirmation-confirm-button");

const deletePreviewId = document.getElementById("task-delete-target-identifier-badge");
const deletePreviewTopic = document.getElementById("task-delete-target-topic-badge");
const deletePreviewTitle = document.getElementById("task-delete-target-title-text");


function openDeleteModal(id, title, topic) {
  todoIdToDelete = id;
  if (deletePreviewId) deletePreviewId.textContent = `ID: #${String(id).padStart(2, "0")}`;
  if (deletePreviewTopic) deletePreviewTopic.textContent = `Chủ đề: ${topic || "Khác"}`;
  if (deletePreviewTitle) deletePreviewTitle.textContent = `Tiêu đề: ${title || ""}`;

  if (deleteModalBackdrop) {
    deleteModalBackdrop.classList.add("is-visible");
    deleteModalBackdrop.setAttribute("aria-hidden", "false");
  }
}
function closeDeleteModal() {
  todoIdToDelete = null;
  if (deleteModalBackdrop) {
    deleteModalBackdrop.classList.remove("is-visible");
    deleteModalBackdrop.setAttribute("aria-hidden", "true");
  }
}

if (deleteCancelBtn) deleteCancelBtn.addEventListener("click", closeDeleteModal);
if (deleteCloseBtn) deleteCloseBtn.addEventListener("click", closeDeleteModal);
if (deleteModalBackdrop) {
  deleteModalBackdrop.addEventListener("click", (e) => {
    if (e.target === deleteModalBackdrop) closeDeleteModal();
  });
}
