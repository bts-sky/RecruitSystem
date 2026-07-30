const ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbzhnszeo2PzyLazOq6wC_6-pBbkjXHqDs6g4f48rgEMrIj62uV8iWGlnhO26l-KZr1l/exec";
const STORAGE_KEY = "recruitApplicationDraftV2";

const form = document.getElementById("applicationForm");
const submitButton = document.getElementById("submitButton");
const messageBox = document.getElementById("message");
const phoneInput = form.elements.phone;
const textareas = [...form.querySelectorAll("textarea")];

phoneInput.addEventListener("input", () => {
  const numbers = phoneInput.value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 3) phoneInput.value = numbers;
  else if (numbers.length <= 7) phoneInput.value = `${numbers.slice(0,3)}-${numbers.slice(3)}`;
  else phoneInput.value = `${numbers.slice(0,3)}-${numbers.slice(3,7)}-${numbers.slice(7)}`;
  saveDraft();
});

textareas.forEach((area) => {
  const counter = document.querySelector(`[data-count-for="${area.name}"]`);
  const update = () => counter.textContent = area.value.length;
  area.addEventListener("input", () => { update(); saveDraft(); });
  update();
});

[...form.elements].forEach((element) => {
  if (!element.name || element.type === "submit" || element === phoneInput || element.tagName === "TEXTAREA") return;
  element.addEventListener("input", saveDraft);
  element.addEventListener("change", saveDraft);
});

function saveDraft() {
  const data = {};
  [...form.elements].forEach((el) => {
    if (!el.name || el.type === "submit") return;
    data[el.name] = el.type === "checkbox" ? el.checked : el.value;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function restoreDraft() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!data) return;
    Object.entries(data).forEach(([name, value]) => {
      const el = form.elements[name];
      if (!el) return;
      if (el.type === "checkbox") el.checked = Boolean(value);
      else el.value = value;
    });
    textareas.forEach((area) => {
      const counter = document.querySelector(`[data-count-for="${area.name}"]`);
      counter.textContent = area.value.length;
    });
  } catch (_) {}
}

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message show ${type}`;
}

function validateForm() {
  let firstInvalid = null;
  [...form.querySelectorAll("[required]")].forEach((field) => {
    field.classList.remove("invalid");
    if (!field.checkValidity()) {
      field.classList.add("invalid");
      firstInvalid ||= field;
    }
  });

  if (phoneInput.value.replace(/\D/g, "").length < 10) {
    phoneInput.classList.add("invalid");
    firstInvalid ||= phoneInput;
  }

  if (firstInvalid) {
    showMessage("필수 항목을 모두 확인해 주세요.", "error");
    firstInvalid.focus();
    firstInvalid.scrollIntoView({behavior:"smooth",block:"center"});
    return false;
  }
  return true;
}

restoreDraft();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateForm()) return;

  if (!confirm("입력한 내용으로 지원서를 제출하시겠습니까?")) return;

  const payload = {
    name: form.elements.name.value.trim(),
    phone: form.elements.phone.value.trim(),
    birthDate: form.elements.birthDate.value,
    address: form.elements.address.value.trim(),
    position: form.elements.position.value.trim(),
    workLocation: form.elements.workLocation.value.trim(),
    career: form.elements.career.value.trim(),
    education: form.elements.education.value.trim(),
    introduction: form.elements.introduction.value.trim(),
    privacyAgreement: form.elements.privacyAgreement.checked
  };

  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "제출 중입니다...";
  showMessage("지원서를 안전하게 전송하고 있습니다.", "info");

  try {
    await fetch(ENDPOINT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {"Content-Type":"text/plain;charset=utf-8"},
      body: JSON.stringify(payload)
    });

    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.setItem("applicationSubmitted", "yes");
    window.location.href = "thankyou.html";
  } catch (error) {
    console.error(error);
    showMessage("전송하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.", "error");
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = "지원서 제출하기";
  }
});
