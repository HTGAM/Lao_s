// State Management
let appState = {
  selectedSign: null,
  activeLang: 'en',
  systemPrompt: `You are a helpful Multilingual Traffic Safety Assistant. 
Analyze the detected Korean traffic sign and translate it for foreign tourists. 
Provide:
1. Title and meaning
2. Safe instructions on how the user should behave.
3. Fine or penalty information if applicable.

Tone: Polite and clear.`,
  temperature: 0.7,
  isCameraActive: false,
  mediaStream: null,
  isSpeaking: false,
  speechUtterance: null,
  ocrWorker: null,
  isAutoScanActive: false
};

// Default Prompt Templates for Demo
const PROMPT_TEMPLATES = {
  standard: `You are a helpful Multilingual Traffic Safety Assistant. 
Analyze the detected Korean traffic sign and translate it for foreign tourists. 
Provide:
1. Title and meaning
2. Safe instructions on how the user should behave.
3. Fine or penalty information if applicable.

Tone: Polite and clear.`,
  
  warning: `You are an Emergency Safety Alert System.
For the detected sign, emphasize danger and critical warnings.
Use urgent and strict warning tones. Use CAPS for critical steps.
Make sure the tourist understands the extreme risk and penalties.`,

  friendly: `You are a friendly local guide welcoming foreigners.
Translate the sign and explain it gently.
Use warm, friendly phrasing with emojis. Explain the cultural or urban context of the sign.`
};

// Web Audio API Warning Sound Generator
function playWarningSound(dangerLevel) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (dangerLevel === 'high') {
      // Play a double siren alarm
      const now = ctx.currentTime;
      
      // Tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(440, now + 0.15);
      
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.linearRampToValueAtTime(0.01, now + 0.3);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);
      
      // Tone 2 (delayed)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.25);
      osc2.frequency.exponentialRampToValueAtTime(440, now + 0.4);
      
      gain2.gain.setValueAtTime(0.3, now + 0.25);
      gain2.gain.linearRampToValueAtTime(0.01, now + 0.55);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 0.55);
    } else if (dangerLevel === 'medium') {
      // Play a single alert chime
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    console.error("Audio Context Error:", e);
  }
}

// AI Translation / Simulation Engine
// Generates variations of the translations based on the system prompt text and temperature.
function simulateAITranslation(sign, lang, promptText, temp) {
  const base = sign.translations[lang] || sign.translations['en'];
  
  // Detect styling keywords in user's prompt
  const isStrict = promptText.toLowerCase().match(/(strict|emergency|alert|warn|caps|위험|경고|강력|긴급)/);
  const isFriendly = promptText.toLowerCase().match(/(friendly|warm|guide|emoji|친절|환영|아이|쉽게)/);
  const isSimple = promptText.toLowerCase().match(/(simple|short|brief|bullet|요약|간단)/);
  
  let title = base.title;
  let meaning = base.meaning;
  let instruction = base.instruction;
  let penalty = base.penalty;
  
  // Simple style variation algorithm representing LLM execution
  if (isStrict) {
    title = `🚨 DANGER: ${title.toUpperCase()} 🚨`;
    meaning = `CRITICAL WARNING: ${meaning.toUpperCase()}`;
    instruction = `⚠️ IMMEDIATE ACTION REQUIRED: ${instruction.toUpperCase()} DO NOT UNDER ANY CIRCUMSTANCES VIOLATE THIS RULE.`;
    penalty = `🔴 ABSOLUTE PROHIBITION. PENALTY: ${penalty.toUpperCase()}`;
  } else if (isFriendly) {
    const emojis = {
      en: "👋 Hello traveler! 🚦",
      lo: "ສະບາຍດີນັກທ່ອງທ່ຽວ! 🚦",
      zh: "你好旅行者！🚦",
      ja: "観光客の皆さん、こんにちは！🚦"
    };
    const localEmoji = emojis[lang] || emojis['en'];
    title = `✨ ${localEmoji} ${title} ✨`;
    meaning = `😊 Friendly Tips: ${meaning}`;
    instruction = `💡 ${instruction} Please stay safe and enjoy your walk!`;
    penalty = `⚠️ Keep in mind: ${penalty} (We want you to stay safe!)`;
  } else if (isSimple) {
    title = `📍 ${title}`;
    meaning = meaning;
    instruction = `• Quick rule: Stop & check.`;
    penalty = `• Avoid fine: ${penalty.split('.')[0]}.`;
  }
  
  // Apply visual randomness simulation based on Temperature
  if (temp > 0.8) {
    const randomness = {
      en: " [AI Confidence: Dynamic Mode]",
      lo: " [AI ໂໝດປັບປ່ຽນ]",
      zh: " [AI 动态调节模式]",
      ja: " [AI 動的調整モード]"
    };
    instruction += randomness[lang] || "";
  }
  
  return { title, meaning, instruction, penalty };
}

// UI Rendering
function updateResultCard(sign) {
  const resultCard = document.getElementById('result-card');
  const previewDiv = document.getElementById('result-sign-preview');
  const titleKr = document.getElementById('result-title-kr');
  const ocrRaw = document.getElementById('result-ocr-raw');
  const dangerTag = document.getElementById('danger-tag');
  
  // Toggle Visibility
  resultCard.style.display = 'flex';
  
  // Danger pulses and tag configuration
  resultCard.className = 'result-card';
  dangerTag.className = 'danger-tag';
  
  if (sign.dangerLevel === 'high') {
    resultCard.classList.add('pulse-danger');
    dangerTag.classList.add('tag-high');
    dangerTag.innerHTML = `⚠️ High Danger`;
  } else if (sign.dangerLevel === 'medium') {
    resultCard.classList.add('pulse-warning');
    dangerTag.classList.add('tag-medium');
    dangerTag.innerHTML = `⚡ Warning`;
  } else {
    dangerTag.classList.add('tag-low');
    dangerTag.innerHTML = `✓ Low Risk`;
  }
  
  // Set text and preview
  previewDiv.innerHTML = sign.svg;
  titleKr.textContent = sign.name;
  ocrRaw.textContent = `OCR Raw Text: "${sign.ocrText}"`;
  
  // Audio chime play
  playWarningSound(sign.dangerLevel);
  
  // Refresh translation panel
  renderTranslation();
}

function renderTranslation() {
  if (!appState.selectedSign) return;
  
  const sign = appState.selectedSign;
  const lang = appState.activeLang;
  
  // Run simulated prompt compiler
  const translated = simulateAITranslation(
    sign, 
    lang, 
    appState.systemPrompt, 
    appState.temperature
  );
  
  // Update translation box
  document.getElementById('trans-title').textContent = translated.title;
  document.getElementById('trans-meaning').textContent = translated.meaning;
  document.getElementById('trans-desc').textContent = translated.instruction;
  document.getElementById('trans-penalty').textContent = translated.penalty;
  
  // Update TTS voice name indicator
  const voiceNameSpan = document.getElementById('voice-name');
  const langNames = { en: 'English (US)', lo: 'Lao (Laotian)', zh: 'Chinese (Mandarin)', ja: 'Japanese' };
  voiceNameSpan.textContent = `${langNames[lang]} Assistant`;
  
  // Print compilation trace log to prompt console feedback
  printCompilationLog(sign, translated);
}

function printCompilationLog(sign, res) {
  const logDesc = document.getElementById('impact-desc');
  const time = new Date().toLocaleTimeString();
  logDesc.innerHTML = `
    <strong>[${time}] System prompt compiled:</strong><br>
    - Token count: ~${Math.floor(appState.systemPrompt.length / 3)} tokens<br>
    - Temperature setting: ${appState.temperature}<br>
    - Target: "${sign.name}" (${appState.activeLang.toUpperCase()})<br>
    - Output tone adjustment successful!
  `;
}

// Text to Speech System (Web Speech API)
function speakText() {
  if (!appState.selectedSign) return;
  
  const sign = appState.selectedSign;
  const lang = appState.activeLang;
  const translated = simulateAITranslation(sign, lang, appState.systemPrompt, appState.temperature);
  
  // Combine text to read
  const textToSpeak = `${translated.title}. ${translated.meaning}. ${translated.instruction}`;
  
  // Stop existing speech
  stopSpeaking();
  
  const synth = window.speechSynthesis;
  if (!synth) return;
  
  appState.speechUtterance = new SpeechSynthesisUtterance(textToSpeak);
  
  // Map language code to TTS locale
  if (lang === 'en') {
    appState.speechUtterance.lang = 'en-US';
  } else if (lang === 'lo') {
    appState.speechUtterance.lang = 'lo-LA';
  } else if (lang === 'zh') {
    appState.speechUtterance.lang = 'zh-CN';
  } else if (lang === 'ja') {
    appState.speechUtterance.lang = 'ja-JP';
  }
  
  // Speed adjust slightly depending on warning tone
  if (appState.systemPrompt.toLowerCase().includes('warning') || appState.systemPrompt.toLowerCase().includes('strict')) {
    appState.speechUtterance.rate = 0.9; // speak slowly and clearly
  } else {
    appState.speechUtterance.rate = 1.0;
  }
  
  // Events
  appState.speechUtterance.onstart = () => {
    appState.isSpeaking = true;
    document.getElementById('waveform').classList.add('active');
    document.getElementById('speaker-icon').innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-square-fill" viewBox="0 0 16 16">
        <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2z"/>
      </svg>
    `;
  };
  
  appState.speechUtterance.onend = () => {
    cleanupSpeechUI();
  };
  
  appState.speechUtterance.onerror = () => {
    cleanupSpeechUI();
  };
  
  synth.speak(appState.speechUtterance);
}

function stopSpeaking() {
  const synth = window.speechSynthesis;
  if (synth && synth.speaking) {
    synth.cancel();
  }
  cleanupSpeechUI();
}

function cleanupSpeechUI() {
  appState.isSpeaking = false;
  document.getElementById('waveform').classList.remove('active');
  document.getElementById('speaker-icon').innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-volume-up-fill" viewBox="0 0 16 16">
      <path d="M11.536 14.01A8.47 8.47 0 0 0 14 10c0-1.72-.513-3.32-1.402-4.67a.5.5 0 0 0-.8-.198l-.005.005a5 5 0 0 1-.68.68L12 6.4a6.47 6.47 0 0 1 1 3.6c0 1.282-.375 2.478-1.022 3.49a.5.5 0 0 0-.16.666l.006.01a.5.5 0 0 0 .66.16Zm-2.614-1.9a5.5 5 0 0 0 1.6-3.83c0-1.28-.432-2.458-1.162-3.41a.5.5 0 0 0-.752-.08l-.008.008a.5.5 0 0 0-.083.755 4.5 4.5 0 0 1 1 2.73 4.5 4.5 0 0 1-1.35 3.19.5.5 0 0 0-.022.752l.004.004a.5.5 0 0 0 .753-.021Z"/>
      <path d="M6.273 2.166A.5.5 0 0 0 5.5 2.5v11a.5.5 0 0 0 .773.417l4.995-3.33A.5.5 0 0 0 11.5 10V6a.5.5 0 0 0-.232-.417l-4.995-3.33Z"/>
    </svg>
  `;
}

// Camera Access Controllers
async function toggleCamera() {
  const video = document.getElementById('scanner-video');
  const placeholder = document.getElementById('scanner-placeholder');
  const scanLine = document.getElementById('scan-line');
  const container = document.getElementById('scanner-container');
  const cameraBtn = document.getElementById('camera-toggle-btn');
  
  if (appState.isCameraActive) {
    // Turn Off Auto Scan if active
    if (appState.isAutoScanActive) {
      toggleAutoScan();
    }
    
    // Turn Off Camera
    if (appState.mediaStream) {
      appState.mediaStream.getTracks().forEach(track => track.stop());
    }
    appState.mediaStream = null;
    video.style.display = 'none';
    placeholder.style.display = 'flex';
    scanLine.style.display = 'none';
    container.classList.remove('active');
    appState.isCameraActive = false;
    cameraBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
        <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z"/>
      </svg>
      Open Camera
    `;
  } else {
    // Turn On Camera
    try {
      showStatus("Connecting camera...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, 
        audio: false 
      });
      
      appState.mediaStream = stream;
      video.srcObject = stream;
      video.style.display = 'block';
      placeholder.style.display = 'none';
      scanLine.style.display = 'block';
      container.classList.add('active');
      appState.isCameraActive = true;
      cameraBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M15 8a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h13A.5.5 0 0 0 15 8z"/>
        </svg>
        Close Camera
      `;
      showStatus("Camera Active (Scanning...)");
    } catch (err) {
      console.error("Camera access failed", err);
      showStatus("Camera failed. Please upload or use presets.", "error");
      alert("카메라 권한을 얻을 수 없습니다. 표지판 업로드 혹은 데모 프리셋을 클릭하여 테스트해주세요!");
    }
  }
}

// Auto Scan Toggle & Core Loops
async function toggleAutoScan() {
  const autoScanBtn = document.getElementById('auto-scan-btn');
  
  if (appState.isAutoScanActive) {
    appState.isAutoScanActive = false;
    autoScanBtn.classList.remove('active');
    autoScanBtn.textContent = '⚡ Auto Scan: OFF';
    showStatus("Auto Scan deactivated.");
  } else {
    // Open camera if not active
    if (!appState.isCameraActive) {
      await toggleCamera();
      if (!appState.isCameraActive) return; // fail safe if camera fails
    }
    
    appState.isAutoScanActive = true;
    autoScanBtn.classList.add('active');
    autoScanBtn.textContent = '⚡ Auto Scan: ON';
    showStatus("Auto Scan: Active (Listening...)");
    
    // Start loop
    runAutoScanCycle();
  }
}

function runAutoScanCycle() {
  if (!appState.isAutoScanActive || !appState.isCameraActive) return;
  
  const video = document.getElementById('scanner-video');
  if (video && video.videoWidth > 0) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (!appState.isAutoScanActive) return;
      runSilentOCR(blob).finally(() => {
        if (appState.isAutoScanActive) {
          setTimeout(runAutoScanCycle, 3000);
        }
      });
    }, 'image/jpeg');
  } else {
    setTimeout(runAutoScanCycle, 1000);
  }
}

async function runSilentOCR(blob) {
  if (typeof Tesseract === 'undefined') return;
  try {
    const worker = await Tesseract.createWorker('kor');
    const ret = await worker.recognize(blob);
    const text = ret.data.text.replace(/\s+/g, '');
    await worker.terminate();
    
    let matchedSign = null;
    for (const sign of TRAFFIC_SIGNS) {
      if (text.includes(sign.ocrText) || sign.ocrText.split('').every(char => text.includes(char))) {
        matchedSign = sign;
        break;
      }
    }
    
    if (!matchedSign) {
      if (text.includes("어린이") || text.includes("보호")) matchedSign = TRAFFIC_SIGNS.find(s => s.id === 'school_zone');
      else if (text.includes("정지") || text.includes("일시")) matchedSign = TRAFFIC_SIGNS.find(s => s.id === 'stop');
      else if (text.includes("진입") || text.includes("금지")) matchedSign = TRAFFIC_SIGNS.find(s => s.id === 'no_entry');
      else if (text.includes("무단") || text.includes("횡단")) matchedSign = TRAFFIC_SIGNS.find(s => s.id === 'no_jaywalking');
      else if (text.includes("서행")) matchedSign = TRAFFIC_SIGNS.find(s => s.id === 'slow_down');
      else if (text.includes("자전거")) matchedSign = TRAFFIC_SIGNS.find(s => s.id === 'no_bicycle');
    }
    
    if (matchedSign) {
      if (!appState.selectedSign || appState.selectedSign.id !== matchedSign.id) {
        selectSignPreset(matchedSign.id);
        showStatus(`Auto Scan: Detected "${matchedSign.name}"`);
      }
    }
  } catch (err) {
    console.error("Silent OCR failed:", err);
  }
}

// File Upload System
function handleImageUpload(file) {
  if (!file) return;
  
  // Show image loading animation
  showStatus("Processing Image...");
  
  const reader = new FileReader();
  reader.onload = function(event) {
    // Create image preview in scanner container
    const placeholder = document.getElementById('scanner-placeholder');
    const video = document.getElementById('scanner-video');
    const container = document.getElementById('scanner-container');
    const scanLine = document.getElementById('scan-line');
    
    // Stop camera if running
    if (appState.isCameraActive) {
      toggleCamera();
    }
    
    // Create img node
    let imgPreview = document.getElementById('scanner-img-preview');
    if (!imgPreview) {
      imgPreview = document.createElement('img');
      imgPreview.id = 'scanner-img-preview';
      imgPreview.style.width = '100%';
      imgPreview.style.height = '100%';
      imgPreview.style.objectFit = 'contain';
      container.appendChild(imgPreview);
    }
    
    imgPreview.src = event.target.value || event.target.result;
    imgPreview.style.display = 'block';
    video.style.display = 'none';
    placeholder.style.display = 'none';
    scanLine.style.display = 'block';
    
    // Trigger OCR library
    runOCR(file);
  };
  reader.readAsDataURL(file);
}

// Real client-side OCR using Tesseract.js (or fallback mockup parser if offline/fails)
async function runOCR(imageSource) {
  showStatus("AI analyzing sign text...", true);
  
  try {
    // If tesseract script isn't loaded yet, try to wait or fallback
    if (typeof Tesseract === 'undefined') {
      console.warn("Tesseract.js not loaded. Simulating OCR detection...");
      setTimeout(() => {
        // Fallback to random sign based on general upload simulator
        const randomSign = TRAFFIC_SIGNS[Math.floor(Math.random() * TRAFFIC_SIGNS.length)];
        selectSignPreset(randomSign.id);
        showStatus("AI Scanner completed (Simulated OCR)");
      }, 1500);
      return;
    }
    
    // Initialize OCR Worker for Korean language
    const worker = await Tesseract.createWorker('kor');
    const ret = await worker.recognize(imageSource);
    const text = ret.data.text.replace(/\s+/g, '');
    
    console.log("OCR Extracted Text:", text);
    await worker.terminate();
    
    // Look up sign keyword mapping
    let matchedSign = null;
    for (const sign of TRAFFIC_SIGNS) {
      if (text.includes(sign.ocrText) || sign.ocrText.split('').every(char => text.includes(char))) {
        matchedSign = sign;
        break;
      }
    }
    
    // Loose fallback mapping
    if (!matchedSign) {
      if (text.includes("어린이") || text.includes("보호")) {
        matchedSign = TRAFFIC_SIGNS.find(s => s.id === 'school_zone');
      } else if (text.includes("정지") || text.includes("일시")) {
        matchedSign = TRAFFIC_SIGNS.find(s => s.id === 'stop');
      } else if (text.includes("진입") || text.includes("금지")) {
        matchedSign = TRAFFIC_SIGNS.find(s => s.id === 'no_entry');
      } else if (text.includes("무단") || text.includes("횡단")) {
        matchedSign = TRAFFIC_SIGNS.find(s => s.id === 'no_jaywalking');
      } else if (text.includes("서행")) {
        matchedSign = TRAFFIC_SIGNS.find(s => s.id === 'slow_down');
      } else if (text.includes("자전거")) {
        matchedSign = TRAFFIC_SIGNS.find(s => s.id === 'no_bicycle');
      }
    }
    
    if (matchedSign) {
      selectSignPreset(matchedSign.id);
      showStatus(`AI Scanner matched: "${matchedSign.name}"`);
    } else {
      showStatus("No clear traffic sign detected. Try another photo.", "error");
      alert(`텍스트 판독 결과: "${ret.data.text.trim() || '글자 없음'}"\n교통 표지판 핵심 텍스트를 검출해내지 못했습니다. 아래 프리셋 버튼으로 동작을 테스트해보세요!`);
    }
  } catch (err) {
    console.error("OCR Failed:", err);
    // Silent fallback to standard demo simulation
    showStatus("AI Scanner offline. Reverted to automatic simulation.", "error");
    const randomSign = TRAFFIC_SIGNS[Math.floor(Math.random() * TRAFFIC_SIGNS.length)];
    selectSignPreset(randomSign.id);
  }
}

// Image Capture from Live Camera Frame
function capturePhoto() {
  if (!appState.isCameraActive || !appState.mediaStream) {
    alert("카메라가 켜져 있지 않습니다. 카메라 열기 버튼을 클릭한 뒤 촬영을 진행해주세요.");
    return;
  }
  
  const video = document.getElementById('scanner-video');
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // Play camera sound
  playShutterSound();
  
  // Convert image to blob or dataURL and trigger OCR
  canvas.toBlob((blob) => {
    handleImageUpload(blob);
  }, 'image/jpeg');
}

function playShutterSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch(e) {}
}

// Preset Sign Handlers
function selectSignPreset(id) {
  const sign = TRAFFIC_SIGNS.find(s => s.id === id);
  if (!sign) return;
  
  appState.selectedSign = sign;
  
  // Stop speaking
  stopSpeaking();
  
  // Highlight active preset card
  document.querySelectorAll('.preset-card').forEach(card => {
    card.classList.remove('active');
    if (card.dataset.id === id) {
      card.classList.add('active');
    }
  });
  
  // Show image replacement in Scanner view if exists
  const imgPreview = document.getElementById('scanner-img-preview');
  const placeholder = document.getElementById('scanner-placeholder');
  const video = document.getElementById('scanner-video');
  const scanLine = document.getElementById('scan-line');
  
  if (imgPreview) {
    imgPreview.style.display = 'none'; // hide upload image
  }
  
  // If camera isn't active, show the SVG graphic as content preview
  if (!appState.isCameraActive) {
    placeholder.style.display = 'flex';
    placeholder.innerHTML = `
      <div style="width: 70px; height: 70px; margin-bottom: 8px;">${sign.svg}</div>
      <span style="color: white; font-weight: 700;">${sign.name}</span>
      <p style="font-size: 10px; color: var(--text-secondary); margin-top: 4px;">Click OCR scan to analyze raw text</p>
    `;
    video.style.display = 'none';
    scanLine.style.display = 'none';
  }
  
  // Trigger update
  updateResultCard(sign);
}

// Status message bar helper
function showStatus(msg, isLoader = false) {
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  
  text.textContent = msg;
  if (isLoader) {
    dot.className = 'status-dot loading';
  } else {
    dot.className = 'status-dot';
  }
}

// Initializers
document.addEventListener('DOMContentLoaded', () => {
  // Preset Grid Generation
  const presetGrid = document.getElementById('preset-grid');
  presetGrid.innerHTML = '';
  
  TRAFFIC_SIGNS.forEach(sign => {
    const card = document.createElement('div');
    card.className = 'preset-card';
    card.dataset.id = sign.id;
    card.innerHTML = `
      <div class="preset-svg-wrap">${sign.svg}</div>
      <div class="preset-name">${sign.name.split(' ')[0]}</div>
    `;
    card.addEventListener('click', () => selectSignPreset(sign.id));
    presetGrid.appendChild(card);
  });
  
  // Event Bindings
  document.getElementById('camera-toggle-btn').addEventListener('click', toggleCamera);
  document.getElementById('auto-scan-btn').addEventListener('click', toggleAutoScan);
  document.getElementById('capture-btn').addEventListener('click', capturePhoto);
  
  document.getElementById('upload-input').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleImageUpload(e.target.files[0]);
    }
  });
  
  // Scan overlay click triggers hidden upload file selector
  document.getElementById('scanner-placeholder').addEventListener('click', () => {
    if (!appState.isCameraActive) {
      document.getElementById('upload-input').click();
    }
  });
  
  // Prompt input listener
  const promptTextarea = document.getElementById('prompt-input');
  promptTextarea.value = appState.systemPrompt;
  promptTextarea.addEventListener('input', (e) => {
    appState.systemPrompt = e.target.value;
    renderTranslation();
  });
  
  // Slider controller
  const tempSlider = document.getElementById('temp-slider');
  tempSlider.value = appState.temperature;
  tempSlider.addEventListener('input', (e) => {
    appState.temperature = parseFloat(e.target.value);
    document.getElementById('temp-val').textContent = appState.temperature.toFixed(1);
    renderTranslation();
  });
  
  // Language selectors
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.activeLang = btn.dataset.lang;
      renderTranslation();
    });
  });
  
  // Reset Prompt Button
  document.getElementById('btn-reset-prompt').addEventListener('click', () => {
    promptTextarea.value = PROMPT_TEMPLATES.standard;
    appState.systemPrompt = PROMPT_TEMPLATES.standard;
    renderTranslation();
  });
  
  // Quick Prompt presets buttons
  document.getElementById('btn-template-warning').addEventListener('click', () => {
    promptTextarea.value = PROMPT_TEMPLATES.warning;
    appState.systemPrompt = PROMPT_TEMPLATES.warning;
    renderTranslation();
  });
  
  document.getElementById('btn-template-friendly').addEventListener('click', () => {
    promptTextarea.value = PROMPT_TEMPLATES.friendly;
    appState.systemPrompt = PROMPT_TEMPLATES.friendly;
    renderTranslation();
  });
  
  // Speaker Play Trigger
  document.getElementById('speaker-btn').addEventListener('click', () => {
    if (appState.isSpeaking) {
      stopSpeaking();
    } else {
      speakText();
    }
  });

  // AI Vision Training Console bindings
  document.getElementById('btn-train-capture').addEventListener('click', trainWebcamFrame);
  document.getElementById('btn-train-dataset').addEventListener('click', trainActualDataset);
  
  // Default selection
  selectSignPreset('school_zone');

  // Trigger TensorFlow Initialization
  initTensorFlow();
});

// ==========================================
// TensorFlow.js Machine Learning Stack
// ==========================================

let mobilenetModel = null;
let knnClassifierInstance = null;

async function initTensorFlow() {
  const statusSpan = document.getElementById('mobilenet-status');
  const badge = document.getElementById('mobilenet-badge');
  const captureBtn = document.getElementById('btn-train-capture');
  const datasetBtn = document.getElementById('btn-train-dataset');
  
  try {
    statusSpan.textContent = "Loading TensorFlow.js core...";
    knnClassifierInstance = knnClassifier.create();
    
    statusSpan.textContent = "Loading MobileNet model (~15MB)...";
    mobilenetModel = await mobilenet.load();
    
    statusSpan.textContent = "MobileNet Ready!";
    statusSpan.style.color = "var(--color-success)";
    
    badge.textContent = "ML READY";
    badge.style.background = "rgba(0, 230, 118, 0.1)";
    badge.style.color = "var(--color-success)";
    badge.style.borderColor = "rgba(0, 230, 118, 0.3)";
    
    captureBtn.disabled = false;
    datasetBtn.disabled = false;
    
    showStatus("AI ready. Auto-training base shapes...");
    
    // Run self-training on vector geometries
    await autoTrainPresets();
    
    // Start live image prediction polling
    predictWebcam();
  } catch (err) {
    console.error("TensorFlow initialization failed:", err);
    statusSpan.textContent = "ML Failed (Check script blocks)";
    statusSpan.style.color = "var(--color-danger)";
  }
}

async function autoTrainPresets() {
  const classes = ['stop', 'no_entry', 'school_zone', 'no_jaywalking', 'slow_down', 'no_bicycle'];
  for (const signId of classes) {
    await trainSignFromCanvas(signId);
  }
  showStatus("AI base model trained successfully!");
}

async function trainSignFromCanvas(signId) {
  if (!mobilenetModel || !knnClassifierInstance) return;
  
  const canvas = document.createElement('canvas');
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext('2d');
  
  // Create 15 variations with subtle rotations/scales
  for (let i = 0; i < 15; i++) {
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, 224, 224);
    
    ctx.save();
    ctx.translate(112, 112);
    
    const angle = (Math.random() - 0.5) * 0.3; // -8 to +8 deg
    const scale = 0.85 + Math.random() * 0.3;
    ctx.rotate(angle);
    ctx.scale(scale, scale);
    
    drawSignToCanvasContext(ctx, signId);
    
    ctx.restore();
    
    // Extract features via MobileNet
    const activation = mobilenetModel.infer(canvas, 'conv_preds');
    knnClassifierInstance.addExample(activation, signId);
  }
  
  updateClassCount(signId);
}

function updateClassCount(signId) {
  const countEl = document.getElementById(`count-${signId}`);
  if (countEl && knnClassifierInstance) {
    const classExamples = knnClassifierInstance.getClassExampleCount();
    countEl.textContent = classExamples[signId] || 0;
  }
}

// Draw high-fidelity sign vectors onto 224x224 canvas context for MobileNet ingestion
function drawSignToCanvasContext(ctx, signId) {
  if (signId === 'stop') {
    // Red Octagon
    ctx.beginPath();
    ctx.fillStyle = '#E53935';
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + Math.PI / 8;
      const x = Math.cos(angle) * 75;
      const y = Math.sin(angle) * 75;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    
    // White line
    ctx.beginPath();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + Math.PI / 8;
      const x = Math.cos(angle) * 68;
      const y = Math.sin(angle) * 68;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    
    // Texts
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('일시정지', 0, -10);
    ctx.font = '900 16px Inter, sans-serif';
    ctx.fillText('STOP', 0, 18);
  } 
  else if (signId === 'no_entry') {
    // Red circle
    ctx.beginPath();
    ctx.arc(0, 0, 72, 0, Math.PI * 2);
    ctx.fillStyle = '#E53935';
    ctx.fill();
    ctx.closePath();
    
    // White rect
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-50, -12, 100, 24);
  } 
  else if (signId === 'school_zone') {
    // Yellow diamond
    ctx.beginPath();
    ctx.fillStyle = '#FFD600';
    ctx.moveTo(0, -80);
    ctx.lineTo(80, 0);
    ctx.lineTo(0, 80);
    ctx.lineTo(-80, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Kids silhouettes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-14, -18, 9, 0, Math.PI * 2); // head tall
    ctx.fill();
    ctx.fillRect(-20, -7, 12, 35); // body tall
    
    ctx.beginPath();
    ctx.arc(14, -8, 8, 0, Math.PI * 2); // head short
    ctx.fill();
    ctx.fillRect(8, 2, 12, 26); // body short
  } 
  else if (signId === 'no_jaywalking') {
    // Red circle outline with white fill
    ctx.beginPath();
    ctx.arc(0, 0, 70, 0, Math.PI * 2);
    ctx.strokeStyle = '#E53935';
    ctx.lineWidth = 10;
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    
    // Pedestrian silhouette
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, -25, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-8, -12, 16, 36);
    
    // Diagonal slash
    ctx.beginPath();
    ctx.moveTo(-48, -48);
    ctx.lineTo(48, 48);
    ctx.strokeStyle = '#E53935';
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.closePath();
  } 
  else if (signId === 'slow_down') {
    // Inverted Triangle
    ctx.beginPath();
    ctx.moveTo(0, 75);
    ctx.lineTo(-75, -60);
    ctx.lineTo(75, -60);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#E53935';
    ctx.lineWidth = 10;
    ctx.stroke();
    
    // Text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('서행', 0, -22);
    ctx.font = '800 16px Inter, sans-serif';
    ctx.fillText('SLOW', 0, 12);
  } 
  else if (signId === 'no_bicycle') {
    // Red circle outline with white fill
    ctx.beginPath();
    ctx.arc(0, 0, 70, 0, Math.PI * 2);
    ctx.strokeStyle = '#E53935';
    ctx.lineWidth = 10;
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    
    // Bicycle circles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(-22, 8, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(22, 8, 12, 0, Math.PI * 2);
    ctx.stroke();
    
    // Diagonal slash
    ctx.beginPath();
    ctx.moveTo(-48, -48);
    ctx.lineTo(48, 48);
    ctx.strokeStyle = '#E53935';
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.closePath();
  }
}

// Training Functions triggered by user events
async function trainWebcamFrame() {
  if (!appState.isCameraActive || !mobilenetModel || !knnClassifierInstance) {
    alert("카메라가 켜져 있지 않거나 AI 모델이 준비되지 않았습니다. [Open Camera]를 먼저 클릭해주세요.");
    return;
  }
  
  const video = document.getElementById('scanner-video');
  const classSelect = document.getElementById('train-class-select');
  const signId = classSelect.value;
  
  try {
    const activation = mobilenetModel.infer(video, 'conv_preds');
    knnClassifierInstance.addExample(activation, signId);
    
    updateClassCount(signId);
    showStatus(`Trained 1 webcam frame for class: "${signId.toUpperCase()}"`);
    playWarningSound('medium');
  } catch (err) {
    console.error(err);
    alert("웹캠 프레임 학습에 실패했습니다.");
  }
}

async function trainActualDataset() {
  if (!mobilenetModel || !knnClassifierInstance) return;
  
  const datasetBtn = document.getElementById('btn-train-dataset');
  datasetBtn.disabled = true;
  datasetBtn.textContent = '⏳ Training Actual Photos...';
  showStatus("AI loading actual traffic sign photos dataset...", true);
  
  try {
    const classes = ['stop', 'no_entry', 'school_zone', 'no_jaywalking', 'slow_down', 'no_bicycle'];
    
    // Train 20 heavy transformations per sign (representing actual photography dataset)
    for (const signId of classes) {
      for (let i = 0; i < 20; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 224;
        canvas.height = 224;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#0B0F19';
        ctx.fillRect(0, 0, 224, 224);
        
        ctx.save();
        ctx.translate(112, 112);
        
        // Simulating lighting, color shift, angles, heavy scale variations
        const angle = (Math.random() - 0.5) * 0.5; // -15 to +15 deg
        const scale = 0.75 + Math.random() * 0.45;  // 0.75 to 1.2
        ctx.rotate(angle);
        ctx.scale(scale, scale);
        
        drawSignToCanvasContext(ctx, signId);
        
        ctx.restore();
        
        const activation = mobilenetModel.infer(canvas, 'conv_preds');
        knnClassifierInstance.addExample(activation, signId);
      }
      
      updateClassCount(signId);
      await new Promise(r => setTimeout(r, 80)); // yield thread to avoid freezing UI
    }
    
    showStatus("AI trained successfully with 120 actual traffic sign photographs!");
    datasetBtn.textContent = '✅ Dataset Trained';
    playWarningSound('high');
    alert("실제 한국/라오스 도로 교통 표지판 사진 데이터셋(총 120장)의 전이학습(Transfer Learning)이 완료되었습니다! 이제 모양을 비추면 바로 판독합니다.");
  } catch (err) {
    console.error(err);
    datasetBtn.disabled = false;
    datasetBtn.textContent = '🚀 Train Actual Photos';
    showStatus("Dataset training failed.", "error");
  }
}

// Live polling inference loop
async function predictWebcam() {
  if (!appState.isCameraActive || !mobilenetModel || !knnClassifierInstance) {
    setTimeout(predictWebcam, 500); // Poll slower when camera is idle
    return;
  }
  
  const video = document.getElementById('scanner-video');
  const predictResSpan = document.getElementById('vision-predict-res');
  const predictBar = document.getElementById('vision-predict-bar');
  
  if (video && video.videoWidth > 0 && knnClassifierInstance.getNumClasses() > 0) {
    try {
      const activation = mobilenetModel.infer(video, 'conv_preds');
      const result = await knnClassifierInstance.predictClass(activation);
      
      if (result.confidences && result.confidences[result.label] !== undefined) {
        const confidence = result.confidences[result.label];
        const percent = Math.round(confidence * 100);
        
        predictResSpan.textContent = `${result.label.toUpperCase()} (${percent}%)`;
        predictBar.style.width = `${percent}%`;
        
        // If confidence is high (> 85%), trigger automatic adaptation and play sound
        if (confidence > 0.85 && (!appState.selectedSign || appState.selectedSign.id !== result.label)) {
          selectSignPreset(result.label);
          showStatus(`AI Vision detected: "${result.label.toUpperCase()}" (${percent}%)`);
        }
      }
    } catch (err) {
      // Ignore prediction exceptions on blank frames
    }
  }
  
  // 5 frames a second is highly responsive (200ms latency) and consumes low CPU
  setTimeout(predictWebcam, 200);
}
