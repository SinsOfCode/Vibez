// Default editable content
const defaultData = {
  startDate: "2024-04-06T00:00:00",
  slides: [
    {
      title: "The Beginning",
      text: "This was the moment everything changed.",
      image: "images/slide1.jpg"
    },
    {
      title: "Us",
      text: "Every laugh, every late night, every memory.",
      image: "images/slide2.jpg"
    },
    {
      title: "Why You",
      text: "Because life feels right with you.",
      image: "images/slide3.jpg"
    }
  ]
};

if (!localStorage.getItem("vibeData")) {
  localStorage.setItem("vibeData", JSON.stringify(defaultData));
}

function getData() {
  return JSON.parse(localStorage.getItem("vibeData"));
}

// Index page
function goYes() {
  window.location.href = "home.html";
}

const noBtn = document.getElementById("noBtn");
if (noBtn) {
  noBtn.addEventListener("mouseover", () => {
    noBtn.style.left = Math.random() * 200 - 100 + "px";
    noBtn.style.top = Math.random() * 200 - 100 + "px";
  });
}

// Timer
function startTimer() {
  const data = getData();
  const start = new Date(data.startDate);

  setInterval(() => {
    const now = new Date();
    let diff = Math.floor((now - start) / 1000);

    const days = Math.floor(diff / 86400);
    diff %= 86400;
    const hours = Math.floor(diff / 3600);
    diff %= 3600;
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;

    document.getElementById("timer").innerText =
      `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
  }, 1000);
}

// Slideshow
let currentSlide = 0;

function loadSlide() {
  const data = getData();
  const slide = data.slides[currentSlide];

  document.getElementById("slideTitle").innerText = slide.title;
  document.getElementById("slideText").innerText = slide.text;
  document.getElementById("slideImg").src = slide.image;
}

function nextSlide() {
  const data = getData();
  if (currentSlide < data.slides.length - 1) {
    currentSlide++;
    loadSlide();
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    currentSlide--;
    loadSlide();
  }
}
