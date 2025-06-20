export class ShaderRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private animationId: number | null = null;
  private startTime: number = Date.now();
  private vertices: Float32Array = new Float32Array();
  private vertexBuffer: WebGLBuffer | null = null;
  private particleCount = 12000;
  private isReversing = false;
  private reverseStartTime = 0;
  private onTransitionComplete?: () => void;

  private vertexShaderSource = `
    attribute vec2 a_position;
    attribute float a_seed;
    attribute float a_life;
    
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform float u_slowdown;
    uniform float u_reverse_progress;
    uniform bool u_is_reversing;
    
    varying float v_life;
    varying vec3 v_color;
    varying float v_alpha;
    
    float random(float seed) {
      return fract(sin(seed * 12.9898) * 43758.5453);
    }
    
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    
    void main() {
      float time = u_time * u_slowdown;
      
      // When reversing, we want to go backwards through time
      if (u_is_reversing) {
        time = time - (u_reverse_progress * time * 2.0);
      }
      
      // Create swirling motion with much tighter radius
      float angle = a_seed * 6.28318 + time * (0.3 + random(a_seed) * 0.7);
      float radius = 0.02 + random(a_seed + 1.0) * 0.05;
      float spiral = time * 0.15 + a_seed * 1.0;
      
      // Controlled spiral outward motion - keep it centered
      radius += spiral * 0.15;
      
      // Add secondary motion for complexity but keep it tight
      float secondaryAngle = angle * 0.5 + time * 0.8;
      float secondaryRadius = radius * 0.2;
      
      vec2 pos = vec2(
        cos(angle) * radius + cos(secondaryAngle) * secondaryRadius + sin(time * 0.2 + a_seed) * 0.08,
        sin(angle) * radius + sin(secondaryAngle) * secondaryRadius + cos(time * 0.15 + a_seed) * 0.08
      );
      
      // Reduced drift to keep particles more centered
      pos.y += sin(time * 0.4 + a_seed * 4.0) * 0.15;
      pos.x += cos(time * 0.3 + a_seed * 2.0) * 0.1;
      
      // During reverse, particles accelerate towards center and fade
      if (u_is_reversing) {
        float centerPull = u_reverse_progress * u_reverse_progress;
        pos = mix(pos, vec2(0.0), centerPull);
      }
      
      gl_Position = vec4(pos, 0.0, 1.0);
      
      // Larger particle sizes for better visibility in condensed area
      float baseSize = 4.0 + random(a_seed + 2.0) * 12.0;
      float pulse = 1.0 + sin(time * 2.0 + a_seed * 5.0) * 0.6;
      
      // During reverse, particles shrink
      if (u_is_reversing) {
        baseSize *= (1.0 - u_reverse_progress * 0.8);
      }
      
      gl_PointSize = baseSize * pulse;
      
      // Brighter, more vibrant colors
      float hue = fract(a_seed * 0.8 + time * 0.08);
      float saturation = 0.8 + random(a_seed + 3.0) * 0.8;
      float brightness = 0.9 + random(a_seed + 4.0) * 0.1;
      
      v_color = hsv2rgb(vec3(hue, saturation, brightness));
      
      // Higher alpha values since particles are more concentrated
      float dist = length(pos);
      float centerGlow = 1.0 - smoothstep(0.0, 0.5, dist);
      float baseAlpha = (0.7 + centerGlow * 0.3) * (0.8 + random(a_seed + 5.0) * 0.2);
      
      // During reverse, fade out particles
      if (u_is_reversing) {
        baseAlpha *= (1.0 - u_reverse_progress);
      }
      
      v_alpha = baseAlpha;
      v_life = a_life;
    }
  `;

  private fragmentShaderSource = `
    precision mediump float;
    
    varying vec3 v_color;
    varying float v_alpha;
    varying float v_life;
    
    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      
      // Create a bright, glowing particle with soft edges
      float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
      alpha = pow(alpha, 0.8);
      
      // Add intense sparkle effect
      float sparkle = 1.0 + sin(v_life * 15.0) * 0.5 + cos(v_life * 8.0) * 0.5;
      
      // Boost the overall brightness significantly
      vec3 finalColor = v_color * sparkle * 2.0;
      float finalAlpha = alpha * v_alpha * 1.3;
      
      gl_FragColor = vec4(finalColor, finalAlpha);
    }
  `;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('WebGL not supported');
    }
    this.gl = gl;
    
    this.resizeCanvas();
    this.initShaders();
    this.createParticles();
    
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) {
      throw new Error('Unable to create shader');
    }
    
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error('Shader compilation error: ' + info);
    }
    
    return shader;
  }

  private initShaders() {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, this.vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, this.fragmentShaderSource);
    
    this.program = this.gl.createProgram();
    if (!this.program) {
      throw new Error('Unable to create program');
    }
    
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);
    
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(this.program);
      throw new Error('Program linking error: ' + info);
    }
    
    // Validate the program
    this.gl.validateProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.VALIDATE_STATUS)) {
      const info = this.gl.getProgramInfoLog(this.program);
      console.warn('Program validation warning: ' + info);
    }
    
    this.gl.useProgram(this.program);
    
    // Enhanced blending for brighter particles
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
  }

  private createParticles() {
    const data = [];
    
    for (let i = 0; i < this.particleCount; i++) {
      // Position (will be calculated in vertex shader)
      data.push(0, 0);
      
      // Seed for randomization
      data.push(Math.random() * 1000);
      
      // Life (for animation timing)
      data.push(Math.random());
    }
    
    this.vertices = new Float32Array(data);
    
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertices, this.gl.STATIC_DRAW);
    
    if (!this.program) return;
    
    // Setup attributes with proper error checking
    const positionLoc = this.gl.getAttribLocation(this.program, 'a_position');
    const seedLoc = this.gl.getAttribLocation(this.program, 'a_seed');
    const lifeLoc = this.gl.getAttribLocation(this.program, 'a_life');
    
    const stride = 4 * 4; // 4 floats * 4 bytes
    
    // Only enable and setup attributes that exist (not -1)
    if (positionLoc !== -1) {
      this.gl.enableVertexAttribArray(positionLoc);
      this.gl.vertexAttribPointer(positionLoc, 2, this.gl.FLOAT, false, stride, 0);
    }
    
    if (seedLoc !== -1) {
      this.gl.enableVertexAttribArray(seedLoc);
      this.gl.vertexAttribPointer(seedLoc, 1, this.gl.FLOAT, false, stride, 8);
    }
    
    if (lifeLoc !== -1) {
      this.gl.enableVertexAttribArray(lifeLoc);
      this.gl.vertexAttribPointer(lifeLoc, 1, this.gl.FLOAT, false, stride, 12);
    }
    
    // Debug logging to see which attributes are found
    console.log('WebGL Attribute Locations:', {
      position: positionLoc,
      seed: seedLoc,
      life: lifeLoc
    });
  }

  private render() {
    if (!this.program) return;
    
    const currentTime = (Date.now() - this.startTime) / 1000;
    
    // Calculate slowdown factor (gradually slows down over time)
    const slowdownStart = 3.0;
    const slowdownDuration = 4.0;
    let slowdownFactor = 1.0;
    
    if (currentTime > slowdownStart && !this.isReversing) {
      const progress = Math.min((currentTime - slowdownStart) / slowdownDuration, 1.0);
      const eased = 1.0 - Math.pow(progress, 2.0);
      slowdownFactor = 0.1 + eased * 0.9;
    }
    
    // Calculate reverse progress
    let reverseProgress = 0.0;
    if (this.isReversing) {
      const reverseTime = (Date.now() - this.reverseStartTime) / 1000;
      const reverseDuration = 2.5; // 2.5 seconds for reverse animation
      reverseProgress = Math.min(reverseTime / reverseDuration, 1.0);
      
      // Use easing for smooth transition
      reverseProgress = reverseProgress * reverseProgress * (3.0 - 2.0 * reverseProgress);
      
      // Speed up during reverse
      slowdownFactor = 0.1 + (1.0 - reverseProgress) * 0.9;
      
      // Check if reverse animation is complete
      if (reverseProgress >= 1.0 && this.onTransitionComplete) {
        this.onTransitionComplete();
        return;
      }
    }
    
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    // Set uniforms
    const timeLoc = this.gl.getUniformLocation(this.program, 'u_time');
    const resolutionLoc = this.gl.getUniformLocation(this.program, 'u_resolution');
    const slowdownLoc = this.gl.getUniformLocation(this.program, 'u_slowdown');
    const reverseProgressLoc = this.gl.getUniformLocation(this.program, 'u_reverse_progress');
    const isReversingLoc = this.gl.getUniformLocation(this.program, 'u_is_reversing');
    
    this.gl.uniform1f(timeLoc, currentTime);
    this.gl.uniform2f(resolutionLoc, this.canvas.width, this.canvas.height);
    this.gl.uniform1f(slowdownLoc, slowdownFactor);
    this.gl.uniform1f(reverseProgressLoc, reverseProgress);
    this.gl.uniform1i(isReversingLoc, this.isReversing ? 1 : 0);
    
    // Draw particles
    this.gl.drawArrays(this.gl.POINTS, 0, this.particleCount);
    
    this.animationId = requestAnimationFrame(() => this.render());
  }

  public startReverse(onComplete?: () => void) {
    this.isReversing = true;
    this.reverseStartTime = Date.now();
    this.onTransitionComplete = onComplete;
  }

  public start() {
    this.render();
  }

  public destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.vertexBuffer) {
      this.gl.deleteBuffer(this.vertexBuffer);
    }
    
    if (this.program) {
      this.gl.deleteProgram(this.program);
    }
    
    window.removeEventListener('resize', () => this.resizeCanvas());
  }
}
 