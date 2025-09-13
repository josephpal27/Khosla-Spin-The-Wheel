const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.querySelector("#final-value p");
const claimBtn = document.getElementById("claim-btn");
const submitBtn = document.getElementById("submit-btn");
const uniqueIdInput = document.getElementById("unique-id");

// Disable spin button on load
spinBtn.disabled = true;

// Notyf instance for notifications
const notyf = new Notyf({
  duration: 2000,
  position: { x: "end", y: "top" },
});

// Labels & Images
const labels = ["10%", "", "₹100", "Microwave", "₹500", "Iron"];
const imageSrcs = [
  "assets/images/voucher.png",
  "assets/images/oops.png",
  "assets/images/money.png",
  "assets/images/oven.png",
  "assets/images/money.png",
  "assets/images/iron.png",
];

// Custom messages for each slice
const messages = [
  "🎁 You Have Won 10% Discount Coupon!",
  "Better Luck Next Time!",
  "🎁 You Have Won ₹100 Cashback!",
  "🎁 You Have Won Microwave!",
  "🎁 You Have Won ₹500 Cashback!",
  "🎁 You Have Won Iron!",
];

// Preload images
function preloadImages(sources) {
  return Promise.all(
    sources.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
      });
    })
  );
}

preloadImages(imageSrcs).then((loadedImgs) => {
  const data = [16, 16, 16, 16, 16, 16];
  const pieColors = ["#fe504f", "#fff", "#fe504f", "#fff", "#fe504f", "#fff"];

  // Chart.js Wheel
  const myChart = new Chart(wheel, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: pieColors,
        },
      ],
    },
    options: {
      responsive: true,
      animation: { duration: 0 },
      plugins: {
        tooltip: false,
        legend: false,
      },
    },
    plugins: [
      {
        id: "imagesAndText",
        afterDraw: (chart) => {
          const {
            ctx,
            chartArea: { left, right, top, bottom },
          } = chart;
          const meta = chart.getDatasetMeta(0);
          ctx.save();

          const centerX = (left + right) / 2;
          const centerY = (top + bottom) / 2;
          const radius = Math.min(right - left, bottom - top) / 2;

          const fontSize = window.innerWidth < 768 ? 12 : 15;
          ctx.font = `bold ${fontSize}px Poppins`;

          meta.data.forEach((arc, i) => {
            const img = loadedImgs[i];
            const angle = (arc.startAngle + arc.endAngle) / 2;
            const imgRadius = radius - 70;

            const x = centerX + imgRadius * Math.cos(angle);
            const y = centerY + imgRadius * Math.sin(angle);

            if (img) {
              ctx.drawImage(img, x - 20, y - 20, 35, 35);
              const bgColor = pieColors[i];
              ctx.fillStyle = bgColor === "#fe504f" ? "#fff" : "#000";
              ctx.textAlign = "center";
              ctx.fillText(labels[i], x, y + 35);
            }
          });

          // Outer yellow border
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius - 2, 0, 2 * Math.PI);
          ctx.lineWidth = 5;
          ctx.strokeStyle = "#fed700";
          ctx.stroke();

          // Center circle
          ctx.beginPath();
          ctx.arc(centerX, centerY, 33, 0, 2 * Math.PI);
          ctx.fillStyle = "#fed700";
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = "#fff";
          ctx.stroke();

          ctx.restore();
        },
      },
    ],
  });

  // Spin Animation
  spinBtn.addEventListener("click", () => {
    spinBtn.disabled = true;
    finalValue.innerHTML = `<p style="color:#fff;">Good Luck!</p>`;
    finalValue.classList.add("show");

    const randomDegree = Math.floor(Math.random() * 360);
    const totalRotation = 360 * 10 + randomDegree;
    const duration = 5000;
    let start = null;

    function animate(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentRotation = easedProgress * totalRotation;

      myChart.options.rotation = currentRotation % 360;
      myChart.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const finalDegree = randomDegree % 360;
        myChart.options.rotation = finalDegree;
        myChart.update();

        const segAngle = 360 / labels.length;
        const index = Math.floor(
          (labels.length - finalDegree / segAngle) % labels.length
        );

        finalValue.innerHTML = `<p style="color:#fff;">${messages[index]}</p>`;
        spinBtn.classList.add("hide"); // Hide spin button
        claimBtn.classList.remove("hide"); // Show claim button
      }
    }

    requestAnimationFrame(animate);
  });
});

// Static frontend verification with dynamic reset
submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const code = uniqueIdInput.value.trim();

  if (!code) {
    notyf.error("Please enter unique code!");
    spinBtn.disabled = true;
    return;
  }

  if (code === "1234") {
    notyf.success("Code Verified!");
    spinBtn.disabled = false; // Enable spin button
    spinBtn.classList.remove("hide"); // Show spin button
    claimBtn.classList.add("hide"); // Hide claim button if it was shown
    finalValue.innerHTML = ""; // Clear previous result
    finalValue.classList.remove("show");
  } else {
    notyf.error("Invalid Code!");
    spinBtn.disabled = true; // Keep spin button disabled
  }
});
