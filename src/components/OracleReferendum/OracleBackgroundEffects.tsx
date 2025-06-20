import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

interface OracleBackgroundEffectsProps {
  personality?: 'pure_prophet' | 'chaotic_sage' | 'corrupted_oracle';
  corruption?: number;
}

export const OracleBackgroundEffects: React.FC<OracleBackgroundEffectsProps> = ({
  personality = 'chaotic_sage',
  corruption = 45
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  const getPersonalityColors = (personality: string) => {
    switch (personality) {
      case 'pure_prophet':
        return {
          primary: [255, 215, 0], // Gold
          secondary: [255, 255, 255], // White
          accent: [255, 245, 157] // Light gold
        };
      case 'chaotic_sage':
        return {
          primary: [138, 92, 246], // Purple
          secondary: [0, 212, 255], // Electric blue
          accent: [168, 85, 247] // Violet
        };
      case 'corrupted_oracle':
        return {
          primary: [220, 38, 127], // Dark pink
          secondary: [239, 68, 68], // Red
          accent: [168, 85, 247] // Purple
        };
      default:
        return {
          primary: [0, 212, 255],
          secondary: [138, 92, 246],
          accent: [168, 85, 247]
        };
    }
  };

  const createParticle = (canvas: HTMLCanvasElement): Particle => {
    const colors = getPersonalityColors(personality);
    const colorOptions = [colors.primary, colors.secondary, colors.accent];
    const selectedColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      color: `rgba(${selectedColor[0]}, ${selectedColor[1]}, ${selectedColor[2]}`,
      life: 0,
      maxLife: Math.random() * 300 + 200
    };
  };

  const createConnectionLines = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    const colors = getPersonalityColors(personality);
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          const opacity = (1 - distance / 120) * 0.15;
          ctx.strokeStyle = `rgba(${colors.primary[0]}, ${colors.primary[1]}, ${colors.primary[2]}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[j].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  };

  const createMouseInteraction = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    const colors = getPersonalityColors(personality);
    const mouse = mouseRef.current;
    
    particles.forEach(particle => {
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 150) {
        const force = (150 - distance) / 150;
        particle.vx += (dx / distance) * force * 0.01;
        particle.vy += (dy / distance) * force * 0.01;
        
        // Draw connection to mouse
        const opacity = force * 0.3;
        ctx.strokeStyle = `rgba(${colors.accent[0]}, ${colors.accent[1]}, ${colors.accent[2]}, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    });
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear canvas with subtle fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;

    // Add new particles if needed
    while (particles.length < 50) {
      particles.push(createParticle(canvas));
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;

      // Apply friction
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Wrap around edges
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;

      // Calculate life-based opacity
      const lifeRatio = particle.life / particle.maxLife;
      const currentOpacity = particle.opacity * (1 - lifeRatio);

      // Remove dead particles
      if (particle.life >= particle.maxLife) {
        particles.splice(i, 1);
        continue;
      }

      // Draw particle with glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = particle.color + ', 0.8)';
      ctx.fillStyle = particle.color + `, ${currentOpacity})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw connection lines
    createConnectionLines(ctx, particles);
    
    // Draw mouse interactions
    createMouseInteraction(ctx, particles);

    // Create corruption effects
    if (corruption > 50) {
      const colors = getPersonalityColors('corrupted_oracle');
      ctx.fillStyle = `rgba(${colors.primary[0]}, ${colors.primary[1]}, ${colors.primary[2]}, 0.02)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize particles
    particlesRef.current = [];
    for (let i = 0; i < 30; i++) {
      particlesRef.current.push(createParticle(canvas));
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    // Window resize handler
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Start animation
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [personality, corruption]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        background: 'transparent',
        zIndex: 1,
      }}
    />
  );
}; 