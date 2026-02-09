const defaultData = {
  startDate: "2024-04-06T00:00",
  donutText: "I LOVE YOU ❤️ I CHOOSE YOU 💖 ",
  slides: [
    {
      title: "The Start",
      text: "The day my world quietly shifted.",
      image: "images/slide1.jpg"
    },
    {
      title: "Moments",
      text: "Every smile, every second, every heartbeat.",
      image: "images/slide2.jpg"
    },
    {
      title: "Forever Energy",
      text: "This is only the beginning.",
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

// Floating hearts
setInterval(() => {
  const heart = document.createElement("div");
  heart.className = "heart";
  heart.innerText = ["💖","🌸","❤️","🌹","💕"][Math.floor(Math.random()*5)];
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = 6 + Math.random() * 6 + "s";
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 12000);
}, 400);

// Timer
function startTimer() {
  const data = getData();
  const start = new Date(data.startDate);

  setInterval(() => {
    const now = new Date();
    let diff = Math.floor((now - start) / 1000);
    const d = Math.floor(diff / 86400);
    diff %= 86400;
    const h = Math.floor(diff / 3600);
    diff %= 3600;
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    document.getElementById("timer").innerText =
      `${d} days ${h} hours ${m} minutes ${s} seconds`;
  }, 1000);
}

// Donut
function buildDonut() {
  const data = getData();
  const donut = document.getElementById("donut");
  donut.innerHTML = "";
  const text = data.donutText;
  const radius = 120;
  [...text].forEach((char, i) => {
    const span = document.createElement("span");
    const angle = (360 / text.length) * i;
    span.style.transform = `rotate(${angle}deg) translate(${radius}px) rotate(${angle * -1}deg)`;
    span.innerText = char;
    donut.appendChild(span);
  });
}

// Slideshow
let currentSlide = 0;
function loadSlide() {
  const data = getData();
  const s = data.slides[currentSlide];
  document.getElementById("slideTitle").innerText = s.title;
  document.getElementById("slideText").innerText = s.text;
  document.getElementById("slideImg").src = s.image;
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
