const landing = document.getElementById("landing");
const formScreen = document.getElementById("formScreen");
const startButton = document.getElementById("startButton");
const backToHome = document.getElementById("backToHome");
const form = document.getElementById("applicationForm");
const steps = [...document.querySelectorAll(".form-step")];
const progressBar = document.getElementById("progressBar");
const stepTitle = document.getElementById("stepTitle");
const stepCounter = document.getElementById("stepCounter");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const submitButton = document.getElementById("submitButton");
const reviewBox = document.getElementById("reviewBox");
const message = document.getElementById("message");
const phoneInput = form.elements.phone;

const titles = ["1. 기본정보","2. 지원정보","3. 경력사항","4. 확인 및 제출"];
let currentStep = 1;

startButton.addEventListener("click", () => {
  landing.classList.remove("active");
  formScreen.classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
});

backToHome.addEventListener("click", () => {
  formScreen.classList.remove("active");
  landing.classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
});

phoneInput.addEventListener("input", () => {
  const n = phoneInput.value.replace(/\D/g,"").slice(0,11);
  if (n.length <= 3) phoneInput.value = n;
  else if (n.length <= 7) phoneInput.value = `${n.slice(0,3)}-${n.slice(3)}`;
  else phoneInput.value = `${n.slice(0,3)}-${n.slice(3,7)}-${n.slice(7)}`;
});

function updateStep(){
  steps.forEach((step,i)=>step.classList.toggle("active",i===currentStep-1));
  progressBar.style.width = `${currentStep*25}%`;
  stepTitle.textContent = titles[currentStep-1];
  stepCounter.textContent = `${currentStep} / 4`;
  prevButton.style.visibility = currentStep===1 ? "hidden" : "visible";
  nextButton.style.display = currentStep===4 ? "none" : "block";
  submitButton.style.display = currentStep===4 ? "block" : "none";
  if(currentStep===4) buildReview();
  window.scrollTo({top:0,behavior:"smooth"});
}

function validateCurrentStep(){
  const section = steps[currentStep-1];
  const required = [...section.querySelectorAll("[required]")];
  let firstInvalid = null;
  required.forEach(el=>{
    el.classList.remove("invalid");
    if(!el.checkValidity()){
      el.classList.add("invalid");
      firstInvalid ||= el;
    }
  });
  if(currentStep===1 && phoneInput.value.replace(/\D/g,"").length<10){
    phoneInput.classList.add("invalid");
    firstInvalid ||= phoneInput;
  }
  if(firstInvalid){
    firstInvalid.focus();
    return false;
  }
  return true;
}

nextButton.addEventListener("click",()=>{
  if(!validateCurrentStep()) return;
  currentStep++;
  updateStep();
});

prevButton.addEventListener("click",()=>{
  if(currentStep>1){ currentStep--; updateStep(); }
});

function buildReview(){
  const labels = [
    ["이름",form.elements.name.value],
    ["연락처",form.elements.phone.value],
    ["생년월일",form.elements.birthDate.value],
    ["주소",form.elements.address.value],
    ["지원분야",form.elements.position.value],
    ["희망근무지",form.elements.workLocation.value],
    ["최종학력",form.elements.education.value || "미입력"],
    ["경력사항",form.elements.career.value || "미입력"],
    ["자기소개 및 특이사항",form.elements.introduction.value || "미입력"],
  ];
  reviewBox.innerHTML = labels.map(([k,v])=>`<div class="review-item"><small>${k}</small><b>${escapeHtml(v)}</b></div>`).join("");
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
}

function showMessage(text,type){
  message.textContent = text;
  message.className = `message show ${type}`;
}

form.addEventListener("submit",async e=>{
  e.preventDefault();
  if(!validateCurrentStep()) return;
  if(!form.elements.privacyAgreement.checked){
    showMessage("개인정보 수집·이용 동의가 필요합니다.","error");
    return;
  }

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
    privacyAgreement: true
  };

  submitButton.disabled = true;
  submitButton.textContent = "제출 중입니다...";
  showMessage("지원서를 전송하고 있습니다. 잠시 기다려 주세요.","info");

  try{
    await fetch(window.RECRUIT_ENDPOINT,{
      method:"POST",
      mode:"no-cors",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify(payload)
    });
    location.href="thankyou.html";
  }catch(err){
    console.error(err);
    submitButton.disabled = false;
    submitButton.textContent = "지원서 제출하기";
    showMessage("전송하지 못했습니다. 인터넷 연결을 확인해 주세요.","error");
  }
});

updateStep();
