import React, { useEffect, useRef } from 'react';
import './GirthResonanceGauge.css';

interface GirthResonanceGaugeProps {
  value: number;
}

export const GirthResonanceGauge: React.FC<GirthResonanceGaugeProps> = ({ value }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const size = 220;
    canvas.width = size;
    canvas.height = size;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw gauge background
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    
    // Draw outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 20;
    ctx.stroke();
    
    // Define gauge angles (180-degree sweep)
    const startAngle = Math.PI * 0.8;  // -144 degrees
    const endAngle = Math.PI * 2.2;    // +144 degrees
    const angleRange = endAngle - startAngle;
    
    // Draw gauge zones
    const drawGaugeZone = (start: number, end: number, color: string) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, start, end);
      ctx.strokeStyle = color;
      ctx.lineWidth = 15;
      ctx.stroke();
    };
    
    // Critical zones
    drawGaugeZone(startAngle, startAngle + angleRange * 0.25, 'rgba(255, 49, 49, 0.7)');  // Red zone
    drawGaugeZone(startAngle + angleRange * 0.25, startAngle + angleRange * 0.5, 'rgba(255, 165, 0, 0.7)');  // Orange zone
    drawGaugeZone(startAngle + angleRange * 0.5, startAngle + angleRange * 0.75, 'rgba(255, 210, 0, 0.7)');  // Yellow zone
    drawGaugeZone(startAngle + angleRange * 0.75, endAngle, 'rgba(57, 255, 20, 0.7)');  // Green zone
    
    // Calculate needle angle based on value (180-degree sweep)
    const valueAngle = startAngle + (angleRange * (value / 100));
    
    // Draw value arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Add glow effect to value arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.filter = 'blur(8px)';
    ctx.stroke();
    ctx.filter = 'none';
    
    // Draw needle
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(valueAngle);
    
    // Needle base
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#00f0ff';
    ctx.fill();
    
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 15;
    
    // Needle pointer
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(0, -radius - 10);
    ctx.lineTo(5, 0);
    ctx.fillStyle = '#00f0ff';
    ctx.fill();
    
    ctx.restore();
    
    // Draw value text
    ctx.font = 'bold 32px "Share Tech Mono", monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.fillText(`${value.toFixed(1)}%`, centerX, centerY + 60);
    ctx.shadowBlur = 0;
    
    // Draw tick marks and labels
    const drawTicks = () => {
      const tickCount = 10;
      const tickLength = 10;
      
      for (let i = 0; i <= tickCount; i++) {
        const tickAngle = startAngle + (angleRange * (i / tickCount));
        const tickStartRadius = radius - 20;
        const tickEndRadius = tickStartRadius - tickLength;
        
        // Draw tick mark
        ctx.beginPath();
        ctx.moveTo(
          centerX + Math.cos(tickAngle) * tickStartRadius,
          centerY + Math.sin(tickAngle) * tickStartRadius
        );
        ctx.lineTo(
          centerX + Math.cos(tickAngle) * tickEndRadius,
          centerY + Math.sin(tickAngle) * tickEndRadius
        );
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw tick label
        const labelRadius = tickEndRadius - 15;
        const labelValue = i * 10;
        ctx.font = '12px "Share Tech Mono", monospace';
        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labelX = centerX + Math.cos(tickAngle) * labelRadius;
        const labelY = centerY + Math.sin(tickAngle) * labelRadius;
        ctx.fillText(labelValue.toString(), labelX, labelY);
      }
    };
    
    drawTicks();
    
  }, [value]);
  
  return (
    <div className="girth-gauge-container">
      <canvas ref={canvasRef} className="girth-gauge"></canvas>
    </div>
  );
};