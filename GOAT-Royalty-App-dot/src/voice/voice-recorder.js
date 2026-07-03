// ============================================================
// GOAT Voice Recorder — Audio Recording with Waveform Visualization
// Real-time Recording · Waveform Display · Vertical Timeline Ruler
// Built for Harvey Miller (DJ Speedy)
// ============================================================

const GOATVoiceRecorder = (() => {
  let audioCtx = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;
  let isPlaying = false;
  let analyser = null;
  let animationId = null;
  let audioSource = null;
  let audioBuffer = null;
  let playStartTime = 0;
  let playbackRate = 1.0;
  
  // Recording settings
  const SAMPLE_RATE = 44100;
  const CHANNELS = 1; // Mono for voice
  const BIT_DEPTH = 16;
  
  // Ruler settings
  let zoomLevel = 1.0;
  let scrollPosition = 0;
  const TIME_SCALE = 100; // pixels per second
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RECORDING ENGINE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  async function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
  }
  
  async function startRecording() {
    try {
      await initAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: SAMPLE_RATE,
          channelCount: CHANNELS
        } 
      });
      
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        await processRecording(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(100); // Collect chunks every 100ms
      isRecording = true;
      
      // Start waveform visualization
      setupAnalyser(stream);
      
      return true;
    } catch (e) {
      console.error('Recording error:', e);
      throw new Error('Could not access microphone: ' + e.message);
    }
  }
  
  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    }
  }
  
  async function processRecording(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    console.log('Recording processed:', audioBuffer.duration.toFixed(2), 'seconds');
    return audioBuffer;
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WAVEFORM ANALYSIS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  function setupAnalyser(stream) {
    const source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    startLiveVisualization();
  }
  
  function startLiveVisualization() {
    const canvas = document.getElementById('voiceWaveformCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
      if (!isRecording) return;
      
      animationId = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, height);
      
      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#76B900';
      ctx.beginPath();
      
      const sliceWidth = width / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      
      // Draw ruler
      drawVerticalRuler(ctx, width, height);
    }
    
    draw();
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VERTICAL RULER (VOICE CODE)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  function drawVerticalRuler(ctx, width, height) {
    const rulerX = width - 60;
    const rulerWidth = 50;
    
    // Draw ruler background
    ctx.fillStyle = '#2d2d3a';
    ctx.fillRect(rulerX, 0, rulerWidth, height);
    
    // Draw border
    ctx.strokeStyle = '#4a4a5a';
    ctx.lineWidth = 1;
    ctx.strokeRect(rulerX, 0, rulerWidth, height);
    
    // Draw time markers
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    
    const duration = audioBuffer ? audioBuffer.duration : 10;
    const pixelsPerSecond = height / duration;
    const minorInterval = 0.5; // 0.5 seconds
    const majorInterval = 1.0; // 1 second
    
    for (let t = 0; t <= duration; t += 0.1) {
      const y = (t / duration) * height;
      const isMajor = t % majorInterval === 0;
      const isMinor = t % minorInterval === 0;
      
      ctx.strokeStyle = isMajor ? '#76B900' : isMinor ? '#666666' : '#444444';
      ctx.lineWidth = isMajor ? 2 : isMinor ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(rulerX, y);
      ctx.lineTo(rulerX + (isMajor ? rulerWidth : isMinor ? rulerWidth * 0.6 : rulerWidth * 0.3), y);
      ctx.stroke();
      
      // Time labels on major marks
      if (isMajor) {
        const timeStr = formatTime(t);
        ctx.fillText(timeStr, rulerX + 5, y + 3);
      }
    }
  }
  
  function drawRecordedWaveform(ctx, canvas) {
    if (!audioBuffer) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;
    
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
    
    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = '#76B900';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      
      const yMin = ((1 + min) * amp);
      const yMax = ((1 + max) * amp);
      
      if (i === 0) {
        ctx.moveTo(i, yMin);
      } else {
        ctx.lineTo(i, yMin);
      }
      ctx.lineTo(i, yMax);
    }
    
    ctx.stroke();
    
    // Draw vertical ruler
    drawVerticalRuler(ctx, width, height);
    
    // Draw playback head if playing
    if (isPlaying) {
      const elapsed = (audioCtx.currentTime - playStartTime) * playbackRate;
      const progress = elapsed / audioBuffer.duration;
      const playheadX = progress * width;
      
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PLAYBACK ENGINE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  function playRecording() {
    if (!audioBuffer) return;
    
    if (audioSource) {
      audioSource.stop();
    }
    
    audioSource = audioCtx.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.playbackRate.value = playbackRate;
    audioSource.connect(audioCtx.destination);
    
    audioSource.start(0);
    playStartTime = audioCtx.currentTime;
    isPlaying = true;
    
    // Start visualization
    startPlaybackVisualization();
    
    audioSource.onended = () => {
      isPlaying = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }
  
  function stopPlayback() {
    if (audioSource) {
      audioSource.stop();
      audioSource = null;
    }
    isPlaying = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  }
  
  function startPlaybackVisualization() {
    const canvas = document.getElementById('voiceWaveformCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    function draw() {
      if (!isPlaying) {
        drawRecordedWaveform(ctx, canvas);
        return;
      }
      
      animationId = requestAnimationFrame(draw);
      drawRecordedWaveform(ctx, canvas);
    }
    
    draw();
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WAV EXPORT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  function exportWAV() {
    if (!audioBuffer) return null;
    
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const dataLength = audioBuffer.length * blockAlign;
    const bufferLength = 44 + dataLength;
    
    const buffer = new ArrayBuffer(bufferLength);
    const view = new DataView(buffer);
    
    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    
    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, format, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
    view.setUint16(32, blockAlign, true); // BlockAlign
    view.setUint16(34, bitDepth, true); // BitsPerSample
    
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Write audio data
    const channelData = [];
    for (let i = 0; i < numChannels; i++) {
      channelData.push(audioBuffer.getChannelData(i));
    }
    
    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        let sample = Math.max(-1, Math.min(1, channelData[ch][i]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, sample, true);
        offset += 2;
      }
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }
  
  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER UI
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  function render(container) {
    container.innerHTML = `
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:42px;margin-bottom:6px">🎤</div>
        <h3 style="font-size:18px;background:linear-gradient(135deg,var(--accent),#76B900);-webkit-background-clip:text;-webkit-text-fill-color:transparent">GOAT Voice Recorder</h3>
        <p style="font-size:12px;color:var(--text-muted)">Real-time Recording · Waveform Visualization · Timeline Ruler</p>
      </div>
      
      <div style="display:flex;gap:12px;margin-bottom:16px">
        <button id="voiceRecordBtn" class="terminal-btn" style="flex:1;background:${isRecording ? '#ef4444' : 'var(--accent)'}" onclick="window._voiceRecord()">
          ${isRecording ? '⏹ Stop Recording' : '🎙️ Start Recording'}
        </button>
        <button id="voicePlayBtn" class="terminal-btn" style="flex:1" onclick="window._voicePlay()" ${!audioBuffer ? 'disabled' : ''}>
          ${isPlaying ? '⏹ Stop Playback' : '▶️ Play Recording'}
        </button>
      </div>
      
      <div style="margin-bottom:12px">
        <label style="font-size:11px;color:var(--text-muted)">Playback Speed</label>
        <input type="range" id="playbackSpeed" min="0.5" max="2" step="0.1" value="1" style="width:100%" onchange="window._setPlaybackSpeed(this.value)">
        <div style="font-size:10px;color:var(--text-muted);text-align:center">${playbackRate.toFixed(1)}x</div>
      </div>
      
      <div style="background:#1a1a2e;border-radius:8px;padding:4px;margin-bottom:12px">
        <canvas id="voiceWaveformCanvas" width="600" height="300" style="width:100%;border-radius:4px"></canvas>
      </div>
      
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted)">
        <span>Duration: <span id="voiceDuration">${audioBuffer ? formatTime(audioBuffer.duration) : '0:00.00'}</span></span>
        <span>Status: <span id="voiceStatus">${isRecording ? '🔴 Recording...' : audioBuffer ? '✅ Ready' : '⚪ Idle'}</span></span>
      </div>
      
      <div style="margin-top:12px">
        <button class="terminal-btn" style="width:100%" onclick="window._exportWAV()" ${!audioBuffer ? 'disabled' : ''}>
          📥 Export as WAV
        </button>
      </div>
    `;
    
    // Initialize canvas
    const canvas = document.getElementById('voiceWaveformCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawVerticalRuler(ctx, canvas.width, canvas.height);
    
    // Redraw waveform if exists
    if (audioBuffer && !isRecording) {
      drawRecordedWaveform(ctx, canvas);
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GLOBAL FUNCTIONS (for onclick handlers)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  window._voiceRecord = async function() {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
    render(document.getElementById('toolPanel').querySelector('[data-tool-content="voice"]') || document.querySelector('.tool-panel-content'));
  };
  
  window._voicePlay = function() {
    if (isPlaying) {
      stopPlayback();
    } else {
      playRecording();
    }
    render(document.getElementById('toolPanel').querySelector('[data-tool-content="voice"]') || document.querySelector('.tool-panel-content'));
  };
  
  window._setPlaybackSpeed = function(value) {
    playbackRate = parseFloat(value);
    if (audioSource) {
      audioSource.playbackRate.value = playbackRate;
    }
  };
  
  window._exportWAV = function() {
    const blob = exportWAV();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `goat-voice-${Date.now()}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EXPORTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  return {
    render,
    startRecording,
    stopRecording,
    playRecording,
    stopPlayback,
    exportWAV,
    getDuration: () => audioBuffer ? audioBuffer.duration : 0
  };
})();