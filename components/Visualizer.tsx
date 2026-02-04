
import React, { useRef, useEffect, useState } from 'react';
import { Particle } from '../types';
import { COLORS } from '../constants';

interface VisualizerProps {
  scrollProgress: number;
}

const FRAME_COUNT = 120;

// 이미지 경로 생성 (실제 파일명: ezgif-frame-001.jpg 형식을 따름)
const getFramePath = (index: number) => {
  // index는 0부터 시작하므로 +1 해주고, 3자리로 패딩 (001, 002, ...)
  const frameNumber = String(index + 1).padStart(3, '0');
  return `/ezgif-881ad5836acc154d-jpg/ezgif-frame-${frameNumber}.jpg`;
};

const Visualizer: React.FC<VisualizerProps> = ({ scrollProgress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const particles = useRef<Particle[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [introProgress, setIntroProgress] = useState(0); // 0 to 1 for intro animation
  const [isIntroDone, setIsIntroDone] = useState(false);

  // 인트로 애니메이션 효과 (첫 로드 시 영상처럼 재생)
  useEffect(() => {
    if (imagesLoaded && !isIntroDone) {
      let start: number | null = null;
      const duration = 3000; // 3초간 자동 재생

      const animateIntro = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / duration;

        if (progress < 1) {
          setIntroProgress(progress);
          requestAnimationFrame(animateIntro);
        } else {
          setIntroProgress(1);
          setIsIntroDone(true);
        }
      };
      requestAnimationFrame(animateIntro);
    }
  }, [imagesLoaded, isIntroDone]);

  // 대기 입자(황금 가루) 초기화
  useEffect(() => {
    const count = 50;
    const pts: Particle[] = [];
    for (let i = 0; i < count; i++) {
      pts.push({
        x: Math.random(),
        y: Math.random(),
        baseSize: 1 + Math.random() * 2,
        size: 0,
        color: i % 2 === 0 ? COLORS.accent : COLORS.primary,
        angle: Math.random() * Math.PI * 2,
        velocity: 0.02 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2,
      });
    }
    particles.current = pts;
  }, []);

  // 이미지 프리로딩 및 에러 처리
  useEffect(() => {
    let count = 0;
    const images: HTMLImageElement[] = [];

    const handleLoad = () => {
      count++;
      setLoadedCount(count);
      if (count === FRAME_COUNT) {
        setImagesLoaded(true);
      }
    };

    const handleError = (e: any) => {
      console.warn(`이미지 최종 로드 실패: ${images.indexOf(e.target)} (${e.target.src})`);
      handleLoad(); // 실패해도 진행은 시킴
    };

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = handleLoad;
      img.onerror = handleError;
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const { width, height } = canvas;

      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, 0, width, height);

      // 인트로 중에는 인트로 진행도 사용, 그 이후에는 스크롤 진행도 사용
      const activeProgress = isIntroDone ? scrollProgress : introProgress;

      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.floor(activeProgress * (FRAME_COUNT - 1))
      );

      const currentImg = imagesRef.current[frameIndex];

      // 핵심 수정: 'broken' 상태 방지 (naturalWidth 검증)
      if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
        const imgRatio = currentImg.width / currentImg.height;
        const canvasRatio = width / height;

        let drawWidth, drawHeight;
        if (canvasRatio > imgRatio) {
          drawHeight = height * 0.8;
          drawWidth = drawHeight * imgRatio;
        } else {
          drawWidth = width * 0.8;
          drawHeight = drawWidth / imgRatio;
        }

        const x = (width / 2) - drawWidth / 2;
        const y = (height / 2) - drawHeight / 2;

        ctx.save();
        // 미세한 부유 효과
        const floatY = Math.sin(Date.now() * 0.001) * 15;

        // 제품 뒤 광채 효과
        const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, drawWidth);
        glow.addColorStop(0, `${COLORS.primary}22`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        // 이미지 렌더링
        ctx.shadowBlur = 50;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.drawImage(currentImg, x, y + floatY, drawWidth, drawHeight);

        ctx.restore();
      }

      // 입자 시뮬레이션
      particles.current.forEach((p, i) => {
        const time = Date.now() * 0.0005;
        const px = (p.x * width + Math.cos(time + i) * 50) % width;
        const py = (p.y * height + Math.sin(time + i) * 50) % height;

        ctx.beginPath();
        ctx.arc(px, py, p.baseSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.15 + Math.sin(time * 3 + p.phase) * 0.1;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [scrollProgress, imagesLoaded, introProgress, isIntroDone]);

  return (
    <div className="fixed inset-0 w-full h-full" style={{ background: COLORS.background }}>
      {!imagesLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] bg-black">
          <div className="w-16 h-16 border-2 border-[#FFB300]/20 border-t-[#FFB300] rounded-full animate-spin mb-6" />
          <div className="text-center">
            <h3 className="text-[#FFB300] font-premium text-2xl tracking-[0.2em] mb-2 uppercase">Golden Crunch</h3>
            <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase">
              고해상도 시네마틱 데이터 구성 중 ({Math.floor((loadedCount / FRAME_COUNT) * 100)}%)
            </p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-none"
        style={{
          opacity: imagesLoaded ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out'
        }}
      />

      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
};

export default Visualizer;
