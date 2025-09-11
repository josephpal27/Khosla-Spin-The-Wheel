const wheel = document.getElementById("wheel");
    const spinBtn = document.getElementById("spin-btn");
    const claimBtn = document.getElementById("claim-btn");
    const result = document.getElementById("result");

    const prizes = [
      "Better Luck Next Time",
      "You Have Won ₹100 Cashback",
      "You Have Won ₹500 Cashback",
      "You Have Won a Microwave",
      "You Have Won an Iron",
      "You Have Won 10% Discount Coupon",
    ];

    const sliceAngle = 360 / prizes.length;
    let currentRotation = 0;
    let alreadySpun = false; // only 1 spin allowed

    spinBtn.addEventListener("click", () => {
      if (alreadySpun) return;
      alreadySpun = true;

      spinBtn.disabled = true;
      result.textContent = "Good Luck!";

      const randomIndex = Math.floor(Math.random() * prizes.length);
      const targetAngle = 360 - (randomIndex * sliceAngle + sliceAngle / 2);
      const spins = 6; // full rotations
      const totalRotation = spins * 360 + targetAngle;

      gsap.to(wheel, {
        rotation: totalRotation,
        duration: 5,
        ease: "power4.out",
        onComplete: () => {
          currentRotation = totalRotation % 360;
          result.textContent = `🎁 ${prizes[randomIndex]}!`;

          // Bounce effect
          gsap.to(wheel, {
            rotation: "+=5",
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
          });

          spinBtn.disabled = true;
          spinBtn.style.opacity = "0.5"; // faded
          spinBtn.classList.add("hide");

          // Show claim button only if prize is not "Better Luck Next Time"
          if (prizes[randomIndex] === "Better Luck Next Time") {
            claimBtn.disabled = true;
            claimBtn.classList.remove("hide"); // show but disabled
            claimBtn.style.opacity = "0.5"; // visually indicate disabled
          } else {
            claimBtn.disabled = false;
            claimBtn.classList.remove("hide");
            claimBtn.style.opacity = "1";
          }
        },
      });
    });