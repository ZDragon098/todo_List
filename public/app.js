fetch("/todos")
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));


// Chỉnh lại Fomat ngày tháng
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// THông báo
const toastElement = document.getElementById("task-notification-toast-element");
const toastMessage = document.getElementById("task-notification-toast-message");
let toastTimeout;

function showToast(message = "Tạo thành công", duration = 1500) {
  toastMessage.textContent = message;
  toastElement.classList.add("is-visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastElement.classList.remove("is-visible");
  }, duration);
}


// GET todos
const list = document.getElementById("task-list-item-container");
async function loadTodos() {
  try {
    // Gửi request đến server để lấy danh sách todos
    const res = await fetch("/todos");
    // Chuyển đổi dữ liệu từ JSON sang đối tượng JavaScript
    const todos = await res.json();
    // Tạo HTML từ danh sách todos
    // const html = todos.map(todo => `<article><h2>${todo.title} - ${todo.deadline} - ${todo.time} - ${todo.description} - ${todo.topic} - ${todo.done}</h2></article>`).join("");
    const html = todos.map(todo => {
      const isCompleted = todo.done;
      const cardClass = isCompleted ? "task-item-card task-item-card-completed" : "task-item-card";
      const statusAttr = isCompleted ? "completed" : "pending";
      const statusTagClass = isCompleted ? "task-item-status-tag-completed" : "task-item-status-tag-pending";
      const statusText = isCompleted ? "ĐÃ HOÀN THÀNH" : "CHƯA HOÀN THÀNH";
      const formattedId = String(todo.id).padStart(2, "0");

      return `
            <article id="task-item-card-element-${todo.id}" class="${cardClass}"
              data-task-identifier="${todo.id}"
              data-task-status="${statusAttr}"
              data-task-topic="${todo.topic || 'Khác'}"
              data-task-deadline="${todo.deadline || ''}"
              data-task-time="${todo.time || ''}">

              <div class="task-item-selection-wrapper">
                <label class="task-item-checkbox-container" for="task-item-checkbox-input-${todo.id}">
                  <input type="checkbox" id="task-item-checkbox-input-${todo.id}" class="task-item-checkbox-input"
                    ${isCompleted ? "checked" : ""} title="Đánh dấu hoàn thành">
                  <span class="task-item-checkbox-visual-box">
                    <svg class="task-item-checkbox-checkmark-svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                </label>
              </div>

              <div class="task-item-information-column">
                <div class="task-item-metadata-row">
                  <span class="task-item-identifier-badge">ID: #${formattedId}</span>
                  <span class="task-item-status-tag ${statusTagClass}">${statusText}</span>

                  <span class="task-item-topic-badge">
                    ${todo.topic || "Chưa phân loại"}
                  </span>

                  ${todo.deadline ? `
                  <span class="task-item-deadline-badge task-item-deadline-badge-normal">
                    Hạn chót: ${formatDate(todo.deadline)}
                  </span>` : ""}

                  ${todo.time ? `
                  <span class="task-item-time-badge" title="Giờ thực hiện">
                    ${todo.time}
                  </span>` : ""}
                </div>
                <h3 id="task-item-title-text-${todo.id}" class="task-item-title-text">${todo.title}</h3>
                ${todo.description ? `<p class="task-item-description-text">${todo.description}</p>` : ""}
              </div>

              <div class="task-item-actions-wrapper">
                <button type="button" class="task-item-action-button task-item-edit-action-button" data-id="${todo.id}">
                  <span class="task-action-text-label">Sửa</span>
                </button>
                <button type="button" class="task-item-action-button task-item-delete-action-button" data-id="${todo.id}">
                  <span class="task-action-text-label">Xóa</span>
                </button>
              </div>
            </article>
            `;
    }).join("");
    // Hiển thị danh sách todos trên trang web
    list.innerHTML = html;
  }
  catch (err) {
    console.error("Lỗi khi tải danh sách ", err);
  }
}
loadTodos();

// POST todos/:id
async function createTodo() {
  const res = await fetch("/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: inputTitle.value,
      deadline: document.getElementById("task-creation-deadline-input-field").value,
      time: document.getElementById("task-creation-time-input-field").value,
      description: document.getElementById("task-creation-description-input-field").value,
      topic: document.getElementById("task-creation-topic-select-field").value
    })
  });
  const data = await res.json();
  console.log(data);
  await loadTodos();
  showToast("Tạo thành công!");
}

const form = document.getElementById("task-creation-form");
const inputTitle = document.getElementById("task-creation-input-field");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  createTodo();
});






//PATCH todos/:id






// DELETE todos/:id

//Tạo các biến của Modal Xác nhận xóa
const deleteModalBackdrop = document.getElementById("task-delete-confirmation-modal-backdrop");
const deleteCloseBtn = document.getElementById("task-delete-confirmation-close-icon-button");
const deleteCancelBtn = document.getElementById("task-delete-confirmation-cancel-button");
const deleteConfirmBtn = document.getElementById("task-delete-confirmation-confirm-button");

// Tạo các biến hiển thị thông tin sẽ xóa
const  deletePreviewId  = document.getElementById("task-delete-target-identifier-badge");
const deletePreviewTopic = document.getElementById("task-delete-target-topic-badge");
const deletePreviewTitle = document.getElementById("task-delete-target-title-text");

let todoIdToDelete = null;
function openDeleteModal(id, title, topic){
  todoIdToDelete = id;
  //testContent: là một thuộc tính trong JS, nó lấy ra hoặc thay đổi nội dung chữ nằm bên trong 1 thẻ HTML
  //padStart(x, "y"): là điền thêm "y" vào nếu có ít hơn x chữ số
  deletePreviewId.textContent = `ID: #${String(id).padStart(2, "0")}`;
  deletePreviewTopic.textContent = `Chủ đề: ${topic}`;
  deletePreviewTitle.textContent = `Tiêu đề: ${title}`;

  //Hiển thị modal bằng class 'is-visible' trong style.css
  deleteModalBackdrop.classList.add('is-visible');
  deleteModalBackdrop.setAttribute("aria-hidden", "false");
}

function closeDeleteModal() {
  todoIdToDelete = null;
  deleteModalBackdrop.classList.remove("is-visible");
  deleteModalBackdrop.setAttribute("aria-hidden", "true");
}

// Mở Modal Xóa - Click vào bút Xóa
list.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".task-item-delete-action-button");

  const card = deleteBtn.closest(".task-item-card");
  const id = card.getAttribute("data-task-identifier");
  const topic = card.getAttribute("data-task-topic");
  const title = card.querySelector(".task-item-title-text").textContent;

  openDeleteModal(id, title, topic);
})

// Đóng modal khi bấm "Không, Giữ lại" hoặc "x" hoặc bấm ra nền tối
deleteCancelBtn.addEventListener("click", closeDeleteModal);
deleteCloseBtn.addEventListener("click", closeDeleteModal);
deleteModalBackdrop.addEventListener("click", (e) => {
  if (e.target == deleteModalBackdrop) {
    closeDeleteModal();
  }
})

// Goi API DELETE/:id khi bấm nút "Chắc chắn xóa"
deleteConfirmBtn.addEventListener("click", async () => {
  if (!todoIdToDelete) return;
  try {
    const res = await fetch(`todos/${todoIdToDelete}`, { method: "DELETE" });
    closeDeleteModal();
    showToast("Xóa thành công",1500);
  }
  catch(err) {
    console.error("Lỗi khi xóa", err);
    showToast("Lỗi khi xóa", 1500);
  }
  loadTodos();
});
