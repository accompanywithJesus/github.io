const intro = document.querySelector("#intro");
const reflection = document.querySelector("#reflection");
const startButton = document.querySelector("#startButton");
const journalInput = document.querySelector("#journalInput");
const saveButton = document.querySelector("#saveButton");
const saveMessage = document.querySelector("#saveMessage");

const storageKey = "thursday-reflection-journal";

startButton.addEventListener("click", () => {
  intro.classList.add("hidden");
  reflection.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("DOMContentLoaded", () => {
  const savedJournal = localStorage.getItem(storageKey);

  if (savedJournal) {
    journalInput.value = savedJournal;
    saveMessage.textContent = "이전에 남긴 기록을 불러왔어요.";
  }
});

saveButton.addEventListener("click", () => {
  const journal = journalInput.value.trim();

  if (!journal) {
    saveMessage.textContent = "짧아도 괜찮아요. 오늘의 마음을 한 줄 남겨보세요.";
    journalInput.focus();
    return;
  }

  localStorage.setItem(storageKey, journal);
  saveMessage.textContent = "오늘의 기록을 이 기기에 남겨두었어요.";
});
