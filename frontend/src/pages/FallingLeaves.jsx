// FallingLeaves.jsx
import React, { useRef, useEffect } from "react";
import leaf1 from "/leaves/yellow_orange.png";
import leaf2 from "/leaves/red.png";
import leaf3 from "/leaves/red_orange.png";

export default function FallingLeaves({ count = 40 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // précharger les images
    const images = [leaf1, leaf2, leaf3].map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    class Leaf {
      constructor() {
        this.reset(true);
      }
      reset(init = false) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : -50 - Math.random() * 150;
        this.size = 20 + Math.random() * 40;
        this.speedY = 0.5 + Math.random() * 2.5;
        this.speedX = -1 + Math.random() * 2;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = -0.02 + Math.random() * 0.04;
        this.opacity = 0.7 + Math.random() * 0.3;
        this.image = images[Math.floor(Math.random() * images.length)];
      }
      update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y * 0.01) * 1.4 + this.speedX;
        this.angle += this.spin;
        if (this.y > H + 60 || this.x < -100 || this.x > W + 100) this.reset();
      }
      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    const leaves = Array.from({ length: count }, () => new Leaf());
    let rafId;
    const render = () => {
      ctx.clearRect(0, 0, W, H);
      for (let l of leaves) {
        l.update();
        l.draw(ctx);
      }
      rafId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}
    />
  );
}
