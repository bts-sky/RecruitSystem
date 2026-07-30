const ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbzhnszeo2PzyLazOq6wC_6-pBbkjXHqDs6g4f48rgEMrIj62uV8iWGlnhO26l-KZr1l/exec";

const form = document.getElementById("applicationForm");
const submitButton = document.getElementById("submitButton");
const messageBox = document.getElementById("message");
const phoneInput = form.elements.phone;

phoneInput.addEventListener("input", () => {
  const numbers = phoneInput.value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 3) phoneInput.value = numbers;
  else if (numbers.length <= 7) phoneInput.value = `${numbers.slice(0,3)}-${numbers.slice(3)}`;
  else phoneInput.value = `${numbers.slice(0,3)}-${numbers.slice(3,7)}-${numbers.slice(7)}`;
});

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message show ${type}`;
}

function validateForm() {
  const requiredFields = [...form.querySelectorAll("[required]")];
  let firstInvalid = null;

  requiredFields.forEach((field) => {
    field.classList.remove("invalid");
    if (!field.checkValidity()) {
      field.classList.add("invalid");
      firstInvalid ||= field;
    }
  });

  const phoneNumbers = phoneInput.value.replace(/\D/g, "");
  if (phoneNumbers.length < 10) {
    phoneInput.classList.add("invalid");
    firstInvalid ||= phoneInput;
  }

  if (firstInvalid) {
    showMessage("필수 항목을 확인해 주세요.", "error");
    firstInvalid.focus();
    return false;
  }
  return true;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateForm()) return;

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
  submitButton.textContent = "제출 중...";
  showMessage("지원서를 전송하고 있습니다. 잠시 기다려 주세요.", "info");

  try {
    await fetch(ENDPOINT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    sessionStorage.setItem("applicationSubmitted", "yes");
    window.location.href = "thankyou.html";
  } catch (error) {
    console.error(error);
    showMessage("전송하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.", "error");
    submitButton.disabled = false;
    submitButton.textContent = "지원서 제출";
  }
});
