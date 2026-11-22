const API_BASE_URL = "/todos";

// Lấy tasks
async function getTodos() {
  const res = await fetch(API_BASE_URL);
  return await res.json();
}

// Tạo tasks
async function createTodo(todoData) {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todoData),
  });
  return await res.json();
}

// Chỉnh sửa Tasks
async function updateTodo(id, updatedFields) {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedFields),
  });
  return await res.json();
}

// Xoá Tasks
async function deleteTodo(id) {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  return true;
}
