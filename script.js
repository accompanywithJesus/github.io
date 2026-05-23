const intro = document.querySelector("#intro");
const reflection = document.querySelector("#reflection");
const startButton = document.querySelector("#startButton");
const introDay = document.querySelector("#introDay");
const devotionDay = document.querySelector("#devotionDay");
const devotionTitle = document.querySelector("#devotionTitle");
const devotionSelect = document.querySelector("#devotionSelect");
const scriptureText = document.querySelector("#scriptureText");
const scriptureRef = document.querySelector("#scriptureRef");
const meditationText = document.querySelector("#meditationText");
const todayLine = document.querySelector("#todayLine");
const prayerText = document.querySelector("#prayerText");
const journalInput = document.querySelector("#journalInput");
const saveButton = document.querySelector("#saveButton");
const saveMessage = document.querySelector("#saveMessage");
const historyList = document.querySelector("#historyList");
const clearCurrentButton = document.querySelector("#clearCurrentButton");
const musicButton = document.querySelector("#musicButton");
const backgroundMusic = document.querySelector("#backgroundMusic");
const musicMessage = document.querySelector("#musicMessage");

const journalStorageKey = "daily-devotion-journals";
const legacyStorageKey = "thursday-reflection-journal";
const devotions = window.DEVOTIONS ?? [];
let currentDevotion = getInitialDevotion();

function getTodayKey() {
  const now = new Date();
  const koreaDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const year = koreaDate.getFullYear();
  const month = String(koreaDate.getMonth() + 1).padStart(2, "0");
  const day = String(koreaDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getInitialDevotion() {
  const todayKey = getTodayKey();
  const todayDevotion = devotions.find((devotion) => devotion.date === todayKey);
  return todayDevotion ?? devotions[devotions.length - 1];
}

function getJournals() {
  try {
    return JSON.parse(localStorage.getItem(journalStorageKey)) ?? {};
  } catch {
    return {};
  }
}

function setJournals(journals) {
  localStorage.setItem(journalStorageKey, JSON.stringify(journals));
}

function migrateLegacyJournal() {
  const legacyJournal = localStorage.getItem(legacyStorageKey);
  const journals = getJournals();

  if (legacyJournal && !journals["2026-05-21"]) {
    journals["2026-05-21"] = legacyJournal;
    setJournals(journals);
  }
}

function createParagraph(text) {
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  return paragraph;
}

function renderDevotion(devotion) {
  currentDevotion = devotion;
  document.title = `${devotion.day} 묵상 - ${devotion.title}`;
  introDay.textContent = `${devotion.day} 묵상`;
  devotionDay.textContent = devotion.day;
  devotionTitle.textContent = devotion.title;
  scriptureText.textContent = `“${devotion.scripture.text}”`;
  scriptureRef.textContent = devotion.scripture.reference;
  meditationText.replaceChildren(...devotion.meditation.map(createParagraph));
  todayLine.textContent = devotion.todayLine;
  prayerText.textContent = devotion.prayer;
  devotionSelect.value = devotion.date;
  renderCurrentJournal();
}

function renderDevotionOptions() {
  devotionSelect.replaceChildren(
    ...devotions.map((devotion) => {
      const option = document.createElement("option");
      option.value = devotion.date;
      option.textContent = `${devotion.day} · ${devotion.title}`;
      return option;
    }),
  );
}

function renderCurrentJournal() {
  const journals = getJournals();
  journalInput.value = journals[currentDevotion.date] ?? "";
  saveMessage.textContent = journalInput.value
    ? "이 날짜에 남긴 기록을 불러왔어요."
    : "";
  renderHistory();
}

function renderHistory() {
  const journals = getJournals();
  const writtenDates = Object.keys(journals).filter((date) => journals[date].trim());

  if (writtenDates.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-history";
    empty.textContent = "아직 남긴 기록이 없어요. 오늘의 마음을 한 줄부터 적어보세요.";
    historyList.replaceChildren(empty);
    return;
  }

  const items = writtenDates
    .sort((a, b) => b.localeCompare(a))
    .map((date) => {
      const devotion = devotions.find((item) => item.date === date);
      const item = document.createElement("article");
      item.className = "history-item";

      const title = document.createElement("strong");
      title.textContent = devotion ? `${devotion.day} · ${devotion.title}` : date;

      const dateText = document.createElement("span");
      dateText.textContent = date;

      const content = document.createElement("p");
      content.textContent = journals[date];

      item.append(title, dateText, content);
      return item;
    });

  historyList.replaceChildren(...items);
}

startButton.addEventListener("click", () => {
  intro.classList.add("hidden");
  reflection.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

devotionSelect.addEventListener("change", () => {
  const selected = devotions.find((devotion) => devotion.date === devotionSelect.value);
  if (selected) {
    renderDevotion(selected);
  }
});

musicButton.addEventListener("click", async () => {
  if (backgroundMusic.paused) {
    try {
      await backgroundMusic.play();
      musicButton.textContent = "배경 음악 끄기";
      musicMessage.textContent = "기도 반주가 재생되고 있어요.";
    } catch {
      musicMessage.textContent = "브라우저가 재생을 막았어요. 버튼을 한 번 더 눌러보세요.";
    }
    return;
  }

  backgroundMusic.pause();
  musicButton.textContent = "배경 음악 켜기";
  musicMessage.textContent = "기도 반주를 잠시 멈췄어요.";
});

saveButton.addEventListener("click", () => {
  const journal = journalInput.value.trim();

  if (!journal) {
    saveMessage.textContent = "짧아도 괜찮아요. 오늘의 마음을 한 줄 남겨보세요.";
    journalInput.focus();
    return;
  }

  const journals = getJournals();
  journals[currentDevotion.date] = journal;
  setJournals(journals);
  saveMessage.textContent = "이 날짜의 기록을 이 기기에 남겨두었어요.";
  renderHistory();
});

clearCurrentButton.addEventListener("click", () => {
  const journals = getJournals();
  delete journals[currentDevotion.date];
  setJournals(journals);
  journalInput.value = "";
  saveMessage.textContent = "이 날짜의 기록을 지웠어요.";
  renderHistory();
});

migrateLegacyJournal();
renderDevotionOptions();
renderDevotion(currentDevotion);
