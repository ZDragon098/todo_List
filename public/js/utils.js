function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth()).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

const toastElement = document.getElementById("task-notification-toast-element");
const toastMessage = document.getElementById("task-notification-toast-message")

function showToast(message, time){
  toastMessage.textContent = message;
  toastElement.classList.add("is-visible");
  setTimeout(() => {
    toastElement.classList.remove("is-visible");
  }, time);
}

function changeMileSecond(card) {
  const dealine = card.getAttribute("data-task-deadline");
  const time = card.getAttribute("data-task-time") || "23:59"
  return new Date(`${dealine}T${time}`).getTime();
}
