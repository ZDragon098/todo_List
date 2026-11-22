// Tạo giao diện HTML

const listContainer = document.getElementById("task-list-item-container");
const emptyStateContainer = document.getElementById(
  "task-empty-state-container",
);

//Tracking element
const trackingCompletedList = document.getElementById(
  "tracking-completed-list",
);
const trackingPendingList = document.getElementById("tracking-pending-list");
const trackingCompletedEmpty = document.getElementById(
  "tracking-completed-empty",
);
const trackingPendingEmpty = document.getElementById("tracking-pending-empty");

// Render danh sách công việc
function renderTodoList(todos) {
  if (!listContainer) return;

  if (!todos || todos.lenght === 0) {
    listContainer.innerHTML = "";
    if (emptyStateContainer) emptyStateContainer.style.display = "block";
    return;
  }

  if (emptyStateContainer) emptyStateContainer.style.display = "none";

  const html = todos
    .map((todo) => {
      const isCompleted = todo.done;
      const cardClass = isCompleted
        ? "task-item-card task-item-card-completed"
        : "task-item-card";
      const statusAttr = isCompleted ? "completed" : "pending";
      const statusTagClass = isCompleted
        ? "task-item-status-tag-completed"
        : "task-item-status-tag-pending";
      const statusText = isCompleted ? "ĐÃ HOÀN THÀNH" : "CHƯA HOÀN THÀNH";
      const formattedId = String(todo.id).padStart(2, "0");

      return `
            <article id="task-item-card-element-${todo.id}" class="${cardClass}"
              data-task-identifier="${todo.id}"
              data-task-status="${statusAttr}"
              data-task-topic="${todo.topic || "Khác"}"
              data-task-deadline="${todo.deadline || ""}"
              data-task-time="${todo.time || ""}">

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
                  ${
                    todo.deadline
                      ? `
                  <span class="task-item-deadline-badge task-item-deadline-badge-normal">
                    Hạn chót: ${typeof formatDate === "function" ? formatDate(todo.deadline) : todo.deadline}
                  </span>`
                      : ""
                  }

                  ${
                    todo.time
                      ? `
                  <span class="task-item-time-badge" title="Giờ thực hiện">
                    ${todo.time}
                  </span>`
                      : ""
                  }
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
    })
    .join("");

  listContainer.innerHTML = html;
}
