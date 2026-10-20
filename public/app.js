// Hàm hỗ trợ chuyển File sang chuỗi Base64
// function fileToBase64(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = (error) => reject(error);
//   });
// }



const list = document.getElementById("task-list-item-container");
const emptyState = document.getElementById("task-empty-state-container");

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

function updateMetrics(todoList) {
  const todoTotal = todoList.length;
  const todoDone = todoList.filter((t) => t.done).length;
  const todoPending = todoTotal - todoDone;
  const percent = todoTotal > 0 ? Math.round((todoDone / todoTotal) * 100) : 0;

  //Cập nhật các thông số lớn
  document.getElementById("task-summary-total-count").textContent = String(todoTotal).padStart(2, "0");
  document.getElementById("task-summary-pending-count").textContent = String(todoPending).padStart(2, "0");
  document.getElementById("task-summary-completed-count").textContent = String(todoDone).padStart(2, "0");

  // Cập nhật số trên các nút lọc
  document.getElementById("task-filter-counter-all").textContent = todoTotal;
  document.getElementById("task-filter-counter-pending").textContent = todoPending;
  document.getElementById("task-filter-counter-completed").textContent = todoDone;

  // Cập nhật thanh tiến độ:
  document.getElementById("task-progress-percentage-label").textContent = `${percent}%`;
  document.getElementById("task-progress-fill-bar").style.width = `${percent}%`;
}

//Sidebar - Theo dõi
trackingCompletedList = document.getElementById("tracking-completed-list")
trackingPendingList = document.getElementById("tracking-pending-list")
trackingCompletedEmpty = document.getElementById("tracking-completed-empty")
trackingPendingEmpty = document.getElementById("tracking-pending-empty")

function renderTrackingList(todos) {
  const completedTodos = todos.filter((t) => t.done);
  const pendingTodos = todos.filter((t) => !t.done);
  //Sidebar - Theo dõi - Đã hoàn thành
  if (completedTodos.length === 0) {
    trackingCompletedList.innerHTML = "";
    trackingCompletedEmpty.style.display = "block";
  }
  else {
    trackingCompletedEmpty.style.display = "none";
    trackingCompletedList.innerHTML = completedTodos.map(todo =>
      `<article class="task-item-card task-item-card-completed">
          <div class="task-item-information-column">
            <div class="task-item-metadata-row">
              <span class="task-item-identifier-badge">ID: #${String(todo.id).padStart(2, "0")}</span>
              <span class="task-item-status-tag task-item-status-tag-completed">ĐÃ HOÀN THÀNH</span>
              <span class="task-item-topic-badge">${todo.topic || "Chưa phân loại"}</span>
            </div>
            <h3 class="task-item-title-text" style ="text-decoration: none" >${todo.title}</h3>
          </div>
        </article>`
    ).join("");
  }

  //Sidebar - Theo dõi - Chưa hoàn thành
  if (pendingTodos.length === 0) {
    trackingPendingList.innerHTML = "";
    trackingPendingEmpty.style.display = "block";
  }
  else {
    trackingPendingEmpty.style.display = "none";
    trackingPendingList.innerHTML = pendingTodos.map(todo =>
      `<article class="task-item-card task-item-card-pending">
          <div class="task-item-information-column">
            <div class="task-item-metadata-row">
              <span class="task-item-identifier-badge">ID: #${String(todo.id).padStart(2, "0")}</span>
              <span class="task-item-status-tag task-item-status-tag-pending">CHƯA HOÀN THÀNH</span>
              <span class="task-item-topic-badge">${todo.topic || "Chưa phân loại"}</span>
            </div>
            <h3 class="task-item-title-text">${todo.title}</h3>
          </div>
        </article>`
    ).join("");
  }
}

// Chức năng sắp xếp theo lựa chọn
const sortSelect = document.getElementById("task-sorting-select-field");
const sortCaption = document.getElementById("task-list-current-sort-caption");

function changeMiliSecond(card) {
  const deadline = card.getAttribute("data-task-deadline");
  const time = card.getAttribute("data-task-time") || "23:59";
  return new Date(`${deadline}T${time}`).getTime();
}

function sortTodos() {
  const sortValue = sortSelect.value;

  const cards = Array.from(list.querySelectorAll(".task-item-card"));
  //cardList = cards.map(t => t.done);
  cards.sort((a, b) => {
    const statusA = a.getAttribute("data-task-status");
    const statusB = b.getAttribute("data-task-status");
    if (statusA != statusB) return statusA == "completed" ? 1 : -1;

    const idA = Number(a.getAttribute("data-task-identifier"));
    const idB = Number(b.getAttribute("data-task-identifier"));
    if (sortValue == "identifier-descending") {
      return idB - idA;
    }
    else if (sortValue == "identifier-ascending") {
      return idA - idB;
    }
    else if(sortValue === "deadline-approaching") {
      return changeMiliSecond(a) - changeMiliSecond(b);
    }
  });

  cards.forEach((card) => list.appendChild(card))

  const captionMap = {
    "identifier-descending": "SẮP XẾP: THEO MÃ ID GIẢM DẦN",
    "identifier-ascending": "SẮP XẾP: THEO MÃ ID TĂNG DẦN",
    "deadline-approaching": "SẮP XẾP: SẮP ĐẾN HẠN TRƯỚC",
  }
  if (sortCaption) {
    sortCaption.textContent = captionMap[sortValue];
  }
}
sortSelect.addEventListener("change", sortTodos);


// GET todos
async function loadTodos() {
  try {
    // Gửi request đến server để lấy danh sách todos
    const res = await fetch("/todos");
    // if (res.length == 0) {
    //   list.innerHTML = " ";
    //   emptyState.style.display = "block";
    //   return;
    // }
    // emptyState.style.display = "none";
    // Chuyển đổi dữ liệu từ JSON sang đối tượng JavaScript
    const todos = await res.json();
    if (todos.length == 0) {
      list.innerHTML = " ";
      emptyState.style.display = "block";
      return;
    }
    emptyState.style.display = "none";
    updateMetrics(todos);
    renderTrackingList(todos);
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
    sortTodos();
  }
  catch (err) {
    console.error("Lỗi khi tải danh sách ", err);
  }
}
loadTodos();

// POST todos/:id
async function createTodo() {
  // const fileInput = document.getElementById("task-creation-file-input");
  // const file = fileInput.files[0];
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

// Tích chọn checkbox
list.addEventListener("change", async (e) => {
  const checkbox = e.target;
  const card = checkbox.closest(".task-item-card");
  const id = card.getAttribute("data-task-identifier");
  const isDone = checkbox.checked;

  try {
    const res = await fetch(`/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ done: isDone })
    });
    await loadTodos();
    showToast(isDone ? "Đã hoàn thành" : "Chuyển về trạng thái đang làm", 1500);
  }
  catch (err) {
    console.error("Lỗi khi đổi trạng thái", err);
    showToast(
      "Lỗi khi thay đổi trạng thái", 1500
    );
  }
});
// Sủa thông tin qua Modal sửa
// Lấy các phần tử của Modal Chỉnh sửa từ index.html
const editModalBackdrop = document.getElementById("task-edit-modal-dialog-backdrop");
const editModalForm = document.getElementById("task-edit-modal-form");
const editCloseBtn = document.getElementById("task-edit-modal-close-icon-button");
const editCancelBtn = document.getElementById("task-edit-modal-cancel-button");

// Các ô input bên trong Modal Chỉnh sửa
const editIdInput = document.getElementById("task-edit-modal-identifier-input");
const editTitleInput = document.getElementById("task-edit-modal-title-input");
const editDeadlineInput = document.getElementById("task-edit-modal-deadline-input-field");
const editTimeInput = document.getElementById("task-edit-modal-time-input-field");
const editTopicInput = document.getElementById("task-edit-modal-topic-input-field");
const editDescInput = document.getElementById("task-edit-modal-description-textarea-field");

// Biến lưu ID của công việc đang được mở để sửa
let todoIdToEdit = null;

// Hàm mở Modal Sửa và điền sẵn dữ liệu hiện tại của công việc vào các ô input
function openEditModal(todoData) {
  todoIdToEdit = todoData.id;
  editIdInput.value = `#${String(todoData.id).padStart(2, "0")}`;
  editTitleInput.value = todoData.title || "";
  editDeadlineInput.value = todoData.deadline || "";
  editTimeInput.value = todoData.time || "";
  editTopicInput.value = todoData.topic || "";
  editDescInput.value = todoData.description || "";

  editModalBackdrop.classList.add("is-visible");
}

// Hàm đóng Modal Sửa
function closeEditModal() {
  todoIdToEdit = null;
  editModalBackdrop.classList.remove("is-visible");
}


// Lắng nghe sự kiện bấm nút "Sửa" trên từng thẻ công việc
list.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".task-item-edit-action-button");
  if (!editBtn) return;
  // Lấy thẻ <article> chứa công việc vừa bấm
  const card = editBtn.closest(".task-item-card");

  // Đọc lại các thông tin hiện tại của công việc từ thẻ <article>
  const descElement = card.querySelector(".task-item-description-text");
  const todoData = {
    id: card.getAttribute("data-task-identifier"),
    title: card.querySelector(".task-item-title-text").textContent,
    topic: card.getAttribute("data-task-topic"),
    deadline: card.getAttribute("data-task-deadline"),
    time: card.getAttribute("data-task-time"),
    description: descElement ? descElement.textContent : ""
  };
  openEditModal(todoData)
})
// Lắng nghe sự kiện bấm nút "Lưu Thay Đổi" (submit form sửa)
editModalForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Ngăn trang web tự tải lại
    try {
      const updatedData = {
          title: editTitleInput.value.trim(),
          deadline: editDeadlineInput.value,
          time: editTimeInput.value,
          topic: editTopicInput.value,
          description: editDescInput.value.trim()
      };

      const res = await fetch(`/todos/${todoIdToEdit}`, {
          method: "PATCH",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedData)
      });

      // Đóng modal, tải lại danh sách và hiện thông báo 1 giây
      closeEditModal();
      await loadTodos();
      showToast("Cập nhật thành công!", 1500);

    } catch (err) {
        console.error("Lỗi khi cập nhật công việc:", err);
        showToast("Lỗi khi cập nhật!", 1500);
    }
});

// Đóng Modal Sửa khi bấm nút "Hủy Bỏ", nút "X" hoặc bấm ra ngoài vùng nền tối
editCancelBtn.addEventListener("click", closeEditModal);
editCloseBtn.addEventListener("click", closeEditModal);
editModalBackdrop.addEventListener("click", (e) => {
    if (e.target === editModalBackdrop) {
        closeEditModal();
    }
});

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
  deleteModalBackdrop.classList.add('is-visible'); //classList.add(): Thêm class CSS vào phần tử HTML
  deleteModalBackdrop.setAttribute("aria-hidden", "false");
}

function closeDeleteModal() {
  todoIdToDelete = null;
  deleteModalBackdrop.classList.remove("is-visible"); //classList.remove(): xóa class CSS của phần tử HTML để modal bị ẩn
  deleteModalBackdrop.setAttribute("aria-hidden", "true");//
}

// Mở Modal Xóa - Click vào bút Xóa
list.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".task-item-delete-action-button");
  if (!deleteBtn) return;

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
    const res = await fetch(`/todos/${todoIdToDelete}`, { method: "DELETE" });
    closeDeleteModal();
    await loadTodos();
    showToast("Xóa thành công",1500);
  }
  catch(err) {
    console.error("Lỗi khi xóa", err);
    showToast("Lỗi khi xóa", 1500);
  }
});

// Lọc trạng thái All, Pending, Complete
const filterAllBtn = document.getElementById("task-filter-all-button");
const filterPendingBtn = document.getElementById("task-filter-pending-button");
const filterCompletedBtn = document.getElementById("task-filter-completed-button");
const filterButtons = [filterAllBtn, filterPendingBtn, filterCompletedBtn];

function filterStatus(status) {
  filterButtons.forEach(btn => {
    btn.classList.remove("task-filter-option-button-active");
    btn.setAttribute("aria-selected", "false");
  });

  // if (status == "all" || status == "pending" || status == "completed") {
  //   filterAllBtn.classList.add("task-filter-option-button-active");
  //   filterAllBtn.setAttribute("aria-selected", "true");
  // }
  if (status === "all") {
      filterAllBtn.classList.add("task-filter-option-button-active");
      filterAllBtn.setAttribute("aria-selected", "true");
  } else if (status === "pending") {
      filterPendingBtn.classList.add("task-filter-option-button-active");
      filterPendingBtn.setAttribute("aria-selected", "true");
  } else if (status === "completed") {
      filterCompletedBtn.classList.add("task-filter-option-button-active");
      filterCompletedBtn.setAttribute("aria-selected", "true");
  }

  const cards = list.querySelectorAll(".task-item-card");
  let cnt = 0;
  cards.forEach(card => {
    const cardStatus = card.getAttribute("data-task-status");
    if (status === "all" || cardStatus === status) {
      card.style.display = "flex";
      cnt++;
    }
    else {
      card.style.display = "none";
    }
  });
  //emptyState.style.display = cnt > 0 ? "block" : "none";
  // loadTodos();
}

filterAllBtn.addEventListener("click", () => filterStatus("all"))
filterPendingBtn.addEventListener("click", () => filterStatus("pending"))
filterCompletedBtn.addEventListener("click",() => filterStatus("completed"))
