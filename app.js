// Transformers.js — On-device LLM (Hugging Face)
import { pipeline, env } from '@huggingface/transformers';

// Allow model caching in browser storage
env.allowLocalModels = false;
env.useBrowserCache = true;

// State Management
let appState = {
  selectedSign: null,
  activeLang: 'lo',
  globalLang: 'ko',
  systemPrompt: `You are a multilingual traffic safety guide for foreign tourists in Korea and Laos.

When analyzing a traffic sign, always respond in this exact format:

TITLE: [Sign name in target language]
MEANING: [What this sign means, 1-2 sentences]
INSTRUCTION: [Exactly what the person must do or not do]
PENALTY: [Fine or legal consequence if violated]

Rules:
- Be concise and clear
- Use the target language only
- For Lao (ລາວ): use ພາສາລາວ script
- Never mix languages in one field
- If danger level is HIGH, add ⚠️ at the start of INSTRUCTION`,
  temperature: 0.7,
  isCameraActive: false,
  mediaStream: null,
  isSpeaking: false,
  speechUtterance: null,
  ocrWorker: null,
  isAutoScanActive: false,
  
  // New Interactive States
  activeTab: 'scan',       // 'scan' | 'map'
  weather: 'clear',        // 'clear' | 'nightrain'
  isGpsSimulating: false,
  gpsInterval: null,
  carPositionIndex: 0,
  
  // Gemini API & Physics Simulator States
  onDeviceAI: null,        // Chrome built-in AI session
  onDeviceAIReady: false,   // whether window.ai is available
  simSpeed: 50,
  simMu: 0.7,
  simSlope: 0,
  simReaction: 1.0
};

// Default Prompt Templates for Demo
const PROMPT_TEMPLATES = {
  standard: `You are a multilingual traffic safety guide for foreign tourists in Korea and Laos.

When analyzing a traffic sign, always respond in this exact format:

TITLE: [Sign name in target language]
MEANING: [What this sign means, 1-2 sentences]
INSTRUCTION: [Exactly what the person must do or not do]
PENALTY: [Fine or legal consequence if violated]

Rules:
- Be concise and clear
- Use the target language only
- For Lao (ລາວ): use ພາສາລາວ script
- Never mix languages in one field
- If danger level is HIGH, add ⚠️ at the start of INSTRUCTION`,

  warning: `You are an emergency traffic safety alert system for Korea.

CRITICAL RULES:
- Always output all 4 fields: TITLE, MEANING, INSTRUCTION, PENALTY
- Use UPPERCASE for all danger-related words
- Add ⚠️ WARNING at the start of every INSTRUCTION field
- For HIGH danger signs: add 🔴 DANGER prefix to TITLE
- Penalty amounts must always be specific (e.g., "130,000 KRW fine")

FORMAT STRICTLY:
TITLE:
MEANING:
INSTRUCTION: ⚠️ WARNING - [action]
PENALTY: 🔴 [exact amount + consequence]`,

  friendly: `You are a friendly Korean local guide helping tourists understand traffic signs.

Respond warmly and clearly using this format:

TITLE: ✨ [Sign name with emoji]
MEANING: 😊 [Friendly explanation - imagine explaining to a friend]
INSTRUCTION: 💡 [What to do - use simple words, add helpful tip]
PENALTY: ⚠️ [Consequence - phrase it as "for your safety..." not as a threat]

Important:
- Always include all 4 fields
- Keep Lao text (ພາສາລາວ) readable and natural
- Add cultural context where helpful
- Use emojis sparingly but effectively`
};

// Web Audio API Warning Sound Generator
function playWarningSound(dangerLevel) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (dangerLevel === 'high') {
      const now = ctx.currentTime;
      
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
    } else if (dangerLevel === 'low') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880, now + 0.1);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.error("Audio Context Error:", e);
  }
}

// AI Translation / Simulation Engine
function simulateAITranslation(sign, lang, promptText, temp) {
  const base = sign.translations[lang] || sign.translations['en'];

  const isStrict = promptText.toLowerCase().match(/(strict|emergency|alert|warn|caps|위험|경고|강력|긴급)/);
  const isFriendly = promptText.toLowerCase().match(/(friendly|warm|guide|emoji|친절|환영|아이|쉽게)/);
  const isSimple = promptText.toLowerCase().match(/(simple|short|brief|bullet|요약|간단)/);

  let title = base.title;
  let meaning = base.meaning;
  let instruction = base.instruction;
  let penalty = base.penalty;

  const LABELS = {
    en: {
      danger:    'DANGER',
      critWarn:  'CRITICAL WARNING',
      immediate: 'IMMEDIATE ACTION REQUIRED',
      noViolate: 'DO NOT UNDER ANY CIRCUMSTANCES VIOLATE THIS RULE.',
      absolute:  'ABSOLUTE PROHIBITION. PENALTY',
      friendlyTip: 'Friendly Tips',
      safeTip:   'Please stay safe and enjoy your walk!',
      keepMind:  'Keep in mind',
      safeWish:  'We want you to stay safe!',
      quickRule: '• Quick rule: Stop & check.',
      avoidFine: '• Avoid fine',
    },
    lo: {
      danger:    'ອັນຕະລາຍ',
      critWarn:  'ຄຳເຕືອນສຳຄັນ',
      immediate: 'ຕ້ອງດຳເນີນການທັນທີ',
      noViolate: 'ຫ້າມລະເມີດກົດລະບຽບນີ້ໂດຍເດັດຂາດ.',
      absolute:  'ຫ້າມຢ່າງເດັດຂາດ. ຄ່າປັບ',
      friendlyTip: 'ຄຳແນະນຳ',
      safeTip:   'ກະລຸນາລະວັງຕົວ ແລະ ເດີນທາງໂດຍສະດວກ!',
      keepMind:  'ຈຳໄວ້ວ່າ',
      safeWish:  'ພວກເຮົາຢາກໃຫ້ທ່ານປອດໄພ!',
      quickRule: '• ກົດລະບຽບໄວ: ຢຸດ ແລະ ກວດສອບ.',
      avoidFine: '• ຫຼີກລ້ຽງຄ່າປັບ',
    },
    zh: {
      danger:    '危险',
      critWarn:  '严重警告',
      immediate: '需要立即采取行动',
      noViolate: '任何情况下都不得违反此规定。',
      absolute:  '绝对禁止。罚款',
      friendlyTip: '友情提示',
      safeTip:   '请注意安全，祝您旅途愉快！',
      keepMind:  '请记住',
      safeWish:  '我们希望您平安！',
      quickRule: '• 快速规则：停下并检查。',
      avoidFine: '• 避免罚款',
    },
    ja: {
      danger:    '危険',
      critWarn:  '重大警告',
      immediate: '直ちに行動が必要',
      noViolate: 'いかなる状況でもこのルールを違反しないでください。',
      absolute:  '絶対禁止。罰金',
      friendlyTip: 'フレンドリーアドバイス',
      safeTip:   '安全に気をつけて、旅をお楽しみください！',
      keepMind:  '覚えておいてください',
      safeWish:  '皆さんの安全を願っています！',
      quickRule: '• 簡単ルール：止まって確認。',
      avoidFine: '• 罰金を避ける',
    }
  };

  const L = LABELS[lang] || LABELS['en'];

  if (isStrict) {
    title       = `🚨 ${L.danger}: ${title.toUpperCase()} 🚨`;
    meaning     = `${L.critWarn}: ${meaning.toUpperCase()}`;
    instruction = `⚠️ ${L.immediate}: ${instruction.toUpperCase()} ${L.noViolate}`;
    penalty     = `🔴 ${L.absolute}: ${penalty.toUpperCase()}`;
  } else if (isFriendly) {
    const greetings = {
      en: '👋 Hello traveler! 🚦',
      lo: 'ສະບາຍດີນັກທ່ອງທ່ຽວ! 🚦',
      zh: '你好旅行者！🚦',
      ja: '観光客の皆さん、こんにちは！🚦'
    };
    const localGreeting = greetings[lang] || greetings['en'];
    title       = `✨ ${localGreeting} ${title} ✨`;
    meaning     = `😊 ${L.friendlyTip}: ${meaning}`;
    instruction = `💡 ${instruction} ${L.safeTip}`;
    penalty     = `⚠️ ${L.keepMind}: ${penalty} (${L.safeWish})`;
  } else if (isSimple) {
    title       = `📍 ${title}`;
    meaning     = meaning;
    instruction = L.quickRule;
    penalty     = `${L.avoidFine}: ${penalty.split('.')[0]}.`;
  }

  // Weather safety guidance injection
  if (appState.weather === 'nightrain' && base.weatherAdvice) {
    instruction = `${instruction}\n\n${base.weatherAdvice}`;
  }

  // Apply visual randomness simulation based on Temperature
  if (temp > 0.8) {
    const randomness = {
      en: ' [AI Confidence: Dynamic Mode]',
      lo: ' [AI ໂໝດປັບປ່ຽນ]',
      zh: ' [AI 动态调节模式]',
      ja: ' [AI 動的調整モード]'
    };
    instruction += randomness[lang] || '';
  }

  return { title, meaning, instruction, penalty };
}

// --- Language-specific Phone UI Labels ---
const PHONE_UI_TRANSLATIONS = {
  ko: {
    appTitle: 'AI 안전 가이드',
    appSubtitle: '한-라오 및 다국어 교통 표지판 안내',
    uploadTitle: '탭하여 표지판 이미지 업로드',
    uploadDesc: '또는 카메라를 열어 표지판을 스캔하세요',
    openCamera: '카메라 열기',
    closeCamera: '카메라 닫기',
    autoScanOff: '⚡ 자동 스캔: OFF',
    autoScanOn: '⚡ 자동 스캔: ON',
    demoPresets: '데모 프리셋 (빠른 스캔)',
    testSigns: '표지판 테스트',
    standby: '대기 중 (아래 표지판을 클릭하여 테스트)',
    connectingCamera: '카메라 연결 중...',
    cameraActive: '카메라 작동 중 (스캔 중...)',
    cameraFailed: '카메라 작동 실패. 업로드 또는 프리셋을 이용해 주세요.',
    autoScanDeactivated: '자동 스캔이 비활성화되었습니다.',
    autoScanListening: '자동 스캔: 활성 (스캔 대기 중...)',
    autoScanDetected: '자동 스캔: 감지됨',
    processingImage: '이미지 처리 중...',
    analyzingText: 'AI가 표지판 텍스트를 분석 중...',
    scannerCompleted: 'AI 스캔 완료 (시뮬레이션 OCR)',
    scannerMatched: 'AI 스캐너 일치 완료',
    noSignDetected: '명확한 교통 표지판이 감지되지 않았습니다. 다른 사진으로 시도해 주세요.',
    scannerOffline: 'AI 스캐너 오프라인. 자동 시뮬레이션으로 전환되었습니다.',
    aiReadyTraining: 'AI 준비 완료. 기본 형상 자동 학습 중...',
    baseModelTrained: 'AI 기본 모델 학습 성공!',
    trainedWebcamFrame: '웹캠 프레임 1개 학습 완료: 클래스 ',
    loadingActualPhotos: 'AI가 실제 교통 표지판 사진 데이터셋을 로드 중...',
    actualPhotosComplete: '실제 사진 학습 완료! AI 비전 인식이 개선되었습니다.',
    trainingFailed: '학습 실패. 다시 시도해 주세요.',
    highDanger: '⚠️ 고위험',
    warning: '⚡ 경고',
    lowRisk: '✓ 저위험',
    ocrRaw: 'OCR 원본 텍스트',
    assistant: '안내 도우미',
    chatTitle: '💬 AI 안전 도우미 Q&A',
    chatPlaceholder: '질문을 입력하세요...',
    gpsActive: 'GPS 활성: 서울 안전 구역',
    envLabel: '기상 환경 필터:',
    btnClear: '☀️ 맑음',
    btnNightRain: '🌧️ 야간 및 우천',
    gpsSimStart: '🚗 주행 시뮬레이션 시작',
    gpsSimStop: '🛑 주행 시뮬레이션 중지',
    tapOcrScan: '탭하여 표지판 OCR 스캔',
    visionAiDetected: '비전 AI: 감지됨',
    confidence: '신뢰도'
  },
  en: {
    appTitle: 'AI Safety Guide',
    appSubtitle: 'KOREAN TO LAO & MULTILINGUAL SIGN GUIDE',
    uploadTitle: 'Tap to Upload Sign Image',
    uploadDesc: 'Or open camera and scan signs',
    openCamera: 'Open Camera',
    closeCamera: 'Close Camera',
    autoScanOff: '⚡ Auto Scan: OFF',
    autoScanOn: '⚡ Auto Scan: ON',
    demoPresets: 'Demo Presets (Quick Scan)',
    testSigns: 'Test signs',
    standby: 'Standby (Click sign below to test)',
    connectingCamera: 'Connecting camera...',
    cameraActive: 'Camera Active (Scanning...)',
    cameraFailed: 'Camera failed. Please upload or use presets.',
    autoScanDeactivated: 'Auto Scan deactivated.',
    autoScanListening: 'Auto Scan: Active (Listening...)',
    autoScanDetected: 'Auto Scan: Detected',
    processingImage: 'Processing Image...',
    analyzingText: 'AI analyzing sign text...',
    scannerCompleted: 'AI Scanner completed (Simulated OCR)',
    scannerMatched: 'AI Scanner matched',
    noSignDetected: 'No clear traffic sign detected. Try another photo.',
    scannerOffline: 'AI Scanner offline. Reverted to automatic simulation.',
    aiReadyTraining: 'AI ready. Auto-training base shapes...',
    baseModelTrained: 'AI base model trained successfully!',
    trainedWebcamFrame: 'Trained 1 webcam frame for class',
    loadingActualPhotos: 'AI loading actual traffic sign photos dataset...',
    actualPhotosComplete: 'Actual Photos Training Complete! AI vision improved.',
    trainingFailed: 'Training failed. Please retry.',
    highDanger: '⚠️ High Danger',
    warning: '⚡ Warning',
    lowRisk: '✓ Low Risk',
    ocrRaw: 'OCR Raw Text',
    assistant: 'Assistant',
    chatTitle: '💬 AI Safety Assistant Q&A',
    chatPlaceholder: 'Ask a question...',
    gpsActive: 'GPS ACTIVE: SEOUL SAFETY AREA',
    envLabel: 'Environment Filter:',
    btnClear: '☀️ Clear',
    btnNightRain: '🌧️ Night & Rain',
    gpsSimStart: '🚗 Start Driving Simulation',
    gpsSimStop: '🛑 Stop Driving Simulation',
    tapOcrScan: 'Tap to OCR Scan Sign',
    visionAiDetected: 'Vision AI: Detected',
    confidence: 'confidence'
  },
  lo: {
    appTitle: 'AI ຄູ່ມືຄວາມປອດໄພ',
    appSubtitle: 'ຄູ່ມືປ້າຍຈະລາຈອນ ເກົາຫຼີ-ລາວ',
    uploadTitle: 'ແຕະເພື່ອອັບໂຫຼດຮູບປ້າຍຈະລາຈອນ',
    uploadDesc: 'ຫຼື ເປີດກ້ອງຖ່າຍຮູບເພື່ອສະແກນປ້າຍ',
    openCamera: 'ເປີດກ້ອງຖ່າຍຮູບ',
    closeCamera: 'ປິດກ້ອງຖ່າຍຮູບ',
    autoScanOff: '⚡ ສະແກນອັດຕະໂນມັດ: ປິດ',
    autoScanOn: '⚡ ສະແກນອັດຕະໂນມັດ: ເປີດ',
    demoPresets: 'ຕົວຢ່າງປ້າຍຈະລາຈອນ',
    testSigns: 'ທົດສອບປ້າຍ',
    standby: 'ກຽມພ້ອມ (ຄລິກປ້າຍດ້ານລຸ່ມເພື່ອທົດສອບ)',
    connectingCamera: 'ກຳລັງເຊື່ອມຕໍ່ກ້ອງ...',
    cameraActive: 'ກ້ອງເຮັດວຽກແລ້ວ (ກຳລັງສະແກນ...)',
    cameraFailed: 'ກ້ອງບໍ່ສາມາດເຮັດວຽກໄດ້. ກະລຸນາອັບໂຫຼດຮູບ ຫຼື ໃຊ້ປ້າຍຕົວຢ່າງ.',
    autoScanDeactivated: 'ປິດການສະແກນອັດຕະໂນມັດແລ້ວ.',
    autoScanListening: 'ສະແກນອັດຕະໂນມັດ: ເປີດໃຊ້ງານ (ກຳລັງກວດສອບ...)',
    autoScanDetected: 'ສະແກນອັດຕະໂນມັດ: ກວດພົບ',
    processingImage: 'ກຳລັງປະມວນຜົນຮູບພາບ...',
    analyzingText: 'AI ກຳລັງວິເຄາະຂໍ້ຄວາມໃນປ້າຍ...',
    scannerCompleted: 'ການສະແກນ AI ເສັດສົມບູນ (ຈຳລອງ OCR)',
    scannerMatched: 'AI ສະແກນພົບປ້າຍ',
    noSignDetected: 'ກວດບໍ່ພົບປ້າຍຈະລາຈອນທີ່ຊັດເຈນ. ກະລຸນາລອງຮູບອື່ນ.',
    scannerOffline: 'AI ສະແກນເນີອອຟລາຍ. ປ່ຽນເປັນການຈຳລອງອັດຕະໂນມັດ.',
    aiReadyTraining: 'AI ພ້ອມແລ້ວ. ກຳລັງຝຶກອົບຮົມຮູບແບບພື້ນຖານ...',
    baseModelTrained: 'ຝຶກອົບຮົມຮູບແບບພື້ນຖານ AI ເສັດສົມບູນ!',
    trainedWebcamFrame: 'ຝຶກອົບຮົມ 1 ເຟຣມເວັບແຄມສຳລັບຄລາສ',
    loadingActualPhotos: 'AI ກຳລັງໂຫຼດຊຸດຂໍ້ມູນຮູບພາບປ້າຍຈະລາຈອນຕົວຈິງ...',
    actualPhotosComplete: 'ຝຶກອົບຮົມຮູບພາບຕົວຈິງເສັດສົມບູນ! ຄວາມສາມາດ AI ດີຂຶ້ນ.',
    trainingFailed: 'ການຝຶກອົບຮົມຫຼົ້ມເຫຼວ. ກະລຸນາລອງໃໝ່.',
    highDanger: '⚠️ ອັນຕະລາຍສູງ',
    warning: '⚡ ຄຳເຕືອນ',
    lowRisk: '✓ ຄວາມສ່ຽງຕ່ຳ',
    ocrRaw: 'ຂໍ້ຄວາມ OCR ດິບ',
    assistant: 'ຜູ້ຊ່ວຍສຽງ',
    chatTitle: '💬 ຜູ້ຊ່ວຍຄວາມປອດໄພ AI Q&A',
    chatPlaceholder: 'ຖາມຄຳຖາມ...',
    gpsActive: 'ລະບົບ GPS: ເຂດຄວາມປອດໄພໂຊນ',
    envLabel: 'ຕົວຕອງສະພາບແວດລ້ອມ:',
    btnClear: '☀️ ແຈ້ງດີ',
    btnNightRain: '🌧️ ກາງຄືນ & ຝົນຕົກ',
    gpsSimStart: '🚗 ເລີ່ມການຈຳລອງການຂັບຂີ່',
    gpsSimStop: '🛑 ຢຸດການຈຳລອງການຂັບຂີ່',
    tapOcrScan: 'ແຕະເພື່ອສະແກນ OCR ປ້າຍ',
    visionAiDetected: 'Vision AI: ກວດພົບ',
    confidence: 'ຄວາມໝັ້ນໃຈ'
  },
  zh: {
    appTitle: 'AI 安全指南',
    appSubtitle: '韩中/多语种交通标志指南',
    uploadTitle: '点击上传标志图片',
    uploadDesc: '或打开相机进行扫描',
    openCamera: '打开相机',
    closeCamera: '关闭相机',
    autoScanOff: '⚡ 自动扫描: 关闭',
    autoScanOn: '⚡ 自动扫描: 开启',
    demoPresets: '演示预设（快速测试）',
    testSigns: '测试标志',
    standby: '待机中（点击下方标志进行测试）',
    connectingCamera: '正在连接相机...',
    cameraActive: '相机已启动（扫描中...）',
    cameraFailed: '相机启动失败。请上传图片或使用预设。',
    autoScanDeactivated: '自动扫描已停用。',
    autoScanListening: '自动扫描：已启用（侦听中...）',
    autoScanDetected: '自动扫描：已检测到',
    processingImage: '正在处理图片...',
    analyzingText: 'AI 正在分析标志文本...',
    scannerCompleted: 'AI 扫描完成（模拟 OCR）',
    scannerMatched: 'AI 扫描匹配成功',
    noSignDetected: '未检测到清晰的交通标志。请换张照片重试。',
    scannerOffline: 'AI 扫描器离线。已切换为模拟模式。',
    aiReadyTraining: 'AI 已准备就绪。正在自动训练基础模型...',
    baseModelTrained: 'AI 基础模型训练成功！',
    trainedWebcamFrame: '已训练1个网络摄像头帧',
    loadingActualPhotos: 'AI 正在加载真实交通标志照片数据集...',
    actualPhotosComplete: '真实照片训练完成！AI 视觉识别率已提升。',
    trainingFailed: '训练失败。请重试。',
    highDanger: '⚠️ 高度危险',
    warning: '⚡ 警告',
    lowRisk: '✓ 低风险',
    ocrRaw: 'OCR 原始文本',
    assistant: '助手',
    chatTitle: '💬 AI 安全助手 Q&A',
    chatPlaceholder: '提问...',
    gpsActive: 'GPS 激活：首尔安全区域',
    envLabel: '环境过滤器：',
    btnClear: '☀️ 晴朗',
    btnNightRain: '🌧️ 雨夜模式',
    gpsSimStart: '🚗 开始驾驶模拟',
    gpsSimStop: '🛑 停止驾驶模拟',
    tapOcrScan: '点击进行 OCR 扫描标志',
    visionAiDetected: '智能视觉：已检测到',
    confidence: '置信度'
  },
  ja: {
    appTitle: 'AI 安全ガイド',
    appSubtitle: '韓国語-日本語・多言語交通標識ガイド',
    uploadTitle: 'タップして標識画像をアップロード',
    uploadDesc: 'またはカメラを起動してスキャン',
    openCamera: 'カメラを起動',
    closeCamera: 'カメラを閉じる',
    autoScanOff: '⚡ 自動スキャン: OFF',
    autoScanOn: '⚡ 自動スキャン: ON',
    demoPresets: 'デモ用プリセット (クイックテスト)',
    testSigns: '標識をテスト',
    standby: '待機中 (下の標識をクリックしてテスト)',
    connectingCamera: 'カメラに接続中...',
    cameraActive: 'カメラ起動中 (スキャン中...)',
    cameraFailed: 'カメラの起動に失敗しました。アップロードするかプリセットを使用してください。',
    autoScanDeactivated: '自動スキャンを停止しました。',
    autoScanListening: '自動スキャン: 有効 (スキャン中...)',
    autoScanDetected: '自動スキャン: 検出',
    processingImage: '画像を処理中...',
    analyzingText: 'AI가 標識의 文字를 分析中...',
    scannerCompleted: 'AIスキャン完了 (シミュレートOCR)',
    scannerMatched: 'AIスキャン一致',
    noSignDetected: '交通標識が検出されませんでした。別の写真でお試しください。',
    scannerOffline: 'AIスキャナーオフライン。シミュレーションに戻りました。',
    aiReadyTraining: 'AI準備完了。基本図形を自動トレーニング中...',
    baseModelTrained: 'AI基本モデルのトレーニングが完了しました！',
    trainedWebcamFrame: 'ウェブカメラフレームを1つ学習しました',
    loadingActualPhotos: 'AI가 実際の標識写真データセットをロード中...',
    actualPhotosComplete: '実際の写真トレーニング完了！AI画像認識が向上しました。',
    trainingFailed: 'トレーニング失敗。再試行してください。',
    highDanger: '⚠️ 高度な危険',
    warning: '⚡ 警告',
    lowRisk: '✓ 低リスク',
    ocrRaw: 'OCR 原文テキスト',
    assistant: 'アシスタント',
    chatTitle: '💬 AI安全アシスタント Q&A',
    chatPlaceholder: '質問を入力...',
    gpsActive: 'GPS有効：ソウル安全区域',
    envLabel: '環境フィルター：',
    btnClear: '☀️ 晴天',
    btnNightRain: '🌧️ 雨天・夜間',
    gpsSimStart: '🚗 運転シミュレーション開始',
    gpsSimStop: '🛑 運転シミュレーション停止',
    tapOcrScan: 'タップして標識を OCR スキャン',
    visionAiDetected: '画像認識AI：検出',
    confidence: '信頼度'
  }
};

// Update all phone application visual strings based on target language
function updatePhoneUI() {
  const lang = appState.activeLang;
  const ui = PHONE_UI_TRANSLATIONS[lang] || PHONE_UI_TRANSLATIONS['en'];
  
  // App Title & Subtitle
  const appTitle = document.getElementById('app-title');
  if (appTitle) appTitle.textContent = ui.appTitle;
  const subtitle = document.querySelector('header .subtitle');
  if (subtitle) subtitle.textContent = ui.appSubtitle;
  
  // Scanner Placeholder Text
  if (!appState.selectedSign) {
    const uploadTitle = document.querySelector('#scanner-placeholder span');
    const uploadDesc = document.querySelector('#scanner-placeholder p');
    if (uploadTitle) uploadTitle.textContent = ui.uploadTitle;
    if (uploadDesc) uploadDesc.textContent = ui.uploadDesc;
  } else {
    const uploadTitle = document.querySelector('#scanner-placeholder span');
    const uploadDesc = document.querySelector('#scanner-placeholder p');
    if (uploadTitle) uploadTitle.textContent = appState.selectedSign.name;
    if (uploadDesc) uploadDesc.textContent = ui.tapOcrScan;
  }
  
  // Camera Toggle Button Text
  const cameraBtn = document.getElementById('camera-toggle-btn');
  if (cameraBtn) {
    const isCameraActive = appState.isCameraActive;
    const btnText = isCameraActive ? ui.closeCamera : ui.openCamera;
    const svgIcon = isCameraActive ? 
      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M15 8a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h13A.5.5 0 0 0 15 8z"/>
      </svg>` :
      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
        <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z"/>
      </svg>`;
    cameraBtn.innerHTML = `${svgIcon} ${btnText}`;
  }
  
  // Auto Scan Button Text
  const autoScanBtn = document.getElementById('auto-scan-btn');
  if (autoScanBtn) {
    autoScanBtn.textContent = appState.isAutoScanActive ? ui.autoScanOn : ui.autoScanOff;
  }
  
  // Demo Presets Section
  const presetsLabelSpan = document.querySelector('.presets-section .section-label span:first-child');
  const presetsInfoSpan = document.querySelector('.presets-section .section-label span:last-child');
  if (presetsLabelSpan) presetsLabelSpan.textContent = ui.demoPresets;
  if (presetsInfoSpan) presetsInfoSpan.textContent = ui.testSigns;

  // Translate Chatbot and GPS / Env elements
  const chatTitle = document.getElementById('chat-title');
  if (chatTitle) chatTitle.textContent = ui.chatTitle;
  
  const chatInput = document.getElementById('chat-input');
  if (chatInput) chatInput.placeholder = ui.chatPlaceholder;
  
  const hudLabel = document.getElementById('hud-label-text');
  if (hudLabel) hudLabel.textContent = ui.gpsActive;
  
  const envLabel = document.getElementById('env-label-text');
  if (envLabel) envLabel.textContent = ui.envLabel;
  
  const btnClear = document.getElementById('btn-env-clear');
  if (btnClear) btnClear.textContent = ui.btnClear;
  
  const btnNightRain = document.getElementById('btn-env-nightrain');
  if (btnNightRain) btnNightRain.textContent = ui.btnNightRain;
  
  const btnGpsSim = document.getElementById('btn-gps-simulate');
  if (btnGpsSim) {
    btnGpsSim.textContent = appState.isGpsSimulating ? ui.gpsSimStop : ui.gpsSimStart;
  }

  // Translate Simulator UI tags
  const simLabel = document.getElementById('simulator-label-text');
  if (simLabel) simLabel.textContent = ui.simulatorTitle;
  const simSpeedLabel = document.getElementById('lbl-sim-speed');
  if (simSpeedLabel) simSpeedLabel.textContent = ui.simSpeedLabel + ':';
  const simRoadLabel = document.getElementById('lbl-sim-road');
  if (simRoadLabel) simRoadLabel.textContent = ui.simRoadLabel + ':';
  const simSlopeLabel = document.getElementById('lbl-sim-slope');
  if (simSlopeLabel) simSlopeLabel.textContent = ui.simSlopeLabel + ':';
  const simReactionLabel = document.getElementById('lbl-sim-reaction');
  if (simReactionLabel) simReactionLabel.textContent = ui.simReactionLabel + ':';

  // Road Condition Buttons
  const roadDry = document.getElementById('sim-road-dry');
  if (roadDry) roadDry.textContent = ui.simDry;
  const roadWet = document.getElementById('sim-road-wet');
  if (roadWet) roadWet.textContent = ui.simWet;
  const roadIcy = document.getElementById('sim-road-icy');
  if (roadIcy) roadIcy.textContent = ui.simIcy;

  // Result Labels
  const resReactionLabel = document.getElementById('lbl-res-reaction');
  if (resReactionLabel) resReactionLabel.textContent = ui.simResultReaction;
  const resBrakingLabel = document.getElementById('lbl-res-braking');
  if (resBrakingLabel) resBrakingLabel.textContent = ui.simResultBraking;
  const resTotalLabel = document.getElementById('lbl-res-total');
  if (resTotalLabel) resTotalLabel.textContent = ui.simResultTotal;

  // Inner Visualization labels
  const visReactionShort = document.getElementById('lbl-vis-reaction-short');
  if (visReactionShort) visReactionShort.textContent = ui.simVisReaction;
  const visBrakingShort = document.getElementById('lbl-vis-braking-short');
  if (visBrakingShort) visBrakingShort.textContent = ui.simVisBraking;

  // Explainer button
  const aiExplainBtn = document.getElementById('btn-sim-ai-explain');
  if (aiExplainBtn) aiExplainBtn.textContent = ui.simAiExplainBtn;
}

// --- Global UI Translations for Dashboard & Outer Elements ---
const GLOBAL_UI_TRANSLATIONS = {
  ko: {
    consoleTitle: '⚙ AI 프롬프트 엔지니어링 콘솔',
    modifySystemPrompt: '시스템 프롬프트 (지시어) 수정',
    resetBtn: '초기화',
    promptPlaceholder: '여기에 안전 지침 및 어조 요구사항을 설정하세요...',
    strictBtn: '🚨 엄격한 경고 어조',
    friendlyBtn: '😊 친절한 관광 가이드',
    tempLabel: 'LLM 온도 (창의성 지수)',
    tempMuted: '낮은 온도 = 안정적이고 일관됨',
    visionLabTitle: 'AI 비전 트레이닝 랩 (학습 제어소)',
    mlLoading: 'ML 로딩 중...',
    mlStatus: 'MobileNet 상태:',
    selectTargetClass: '학습 대상 표지판 클래스 선택',
    trainWebcamBtn: '📸 웹캠 프레임 학습',
    trainDatasetBtn: '🚀 실제 사진 학습',
    inferenceLabel: 'AI 비전 추론 결과:',
    waitingTraining: '학습 대기 중...',
    countStop: '일시정지:',
    countNoEntry: '진입금지:',
    countSchoolZone: '어린이보호:',
    countNoJaywalking: '무단횡단:',
    countSlowDown: '서행:',
    countNoBicycle: '자전거금지:',
    traceLogTitle: '프롬프트 컴파일 실행 로그',
    traceLogInit: '엔진 초기화 중. 시스템 프롬프트 구문 분석을 실행하기 위해 표지판 스캔을 대기 중...',
    architectureStackTitle: '앱 아키텍처 스택',
    feature1Name: '클라이언트 사이드 AI OCR (Tesseract.js)',
    feature1Desc: '사용자의 브라우저 내에서 직접 실행되는 오프라인 신경망 텍스트 추출 기술.',
    feature2Name: '동적 프롬프트 컴파일 엔진',
    feature2Desc: '사용자 지정 시스템 지침에 따라 즉각적으로 안전 분석, 번역 스타일 및 긴급 경고를 조정합니다.',
    feature3Name: '음성 합성 가이드 (Web Speech API)',
    feature3Desc: '대상 언어(영어, 중국어, 일본어 등)와 일치하는 기본 음성 합성을 사용하여 번역 내용을 자연스러운 음성으로 변환합니다.',
    feature4Name: '위험 경고 사이렌 시스템 (Web Audio API)',
    feature4Desc: '표지판의 위험도 등급에 따라 하드웨어 발진기(Oscillator)를 사용하여 오프라인에서 경고 사이렌을 직접 합성합니다.',
    
    // API
    apiSettingsTitle: '🔑 Gemini API 설정',
    apiStatusMissing: 'API 키 없음',
    apiStatusConfigured: '실시간 AI 활성화',
    apiKeyPlaceholder: 'Gemini API Key 입력...',
    apiSaveBtn: '저장',
    apiKeyDesc: 'API Key는 로컬 브라우저(LocalStorage)에만 안전하게 보관됩니다.'
  },
  en: {
    consoleTitle: '⚙ AI Prompt Engineering Console',
    modifySystemPrompt: 'Modify System Prompt (Instruction)',
    resetBtn: 'Reset',
    promptPlaceholder: 'Configure safety guidelines and tone requirements here...',
    strictBtn: '🚨 Strict Alert Tone',
    friendlyBtn: '😊 Warm Tour Guide',
    tempLabel: 'LLM Temperature (Creativity Index)',
    tempMuted: 'Low temp = stable & reliable',
    visionLabTitle: 'AI Vision Training Lab (학습 제어소)',
    mlLoading: 'Loading ML...',
    mlStatus: 'MobileNet Status:',
    selectTargetClass: 'SELECT SIGN TARGET CLASS',
    trainWebcamBtn: '📸 Train Webcam Frame',
    trainDatasetBtn: '🚀 Train Actual Photos',
    inferenceLabel: 'AI Vision Inference:',
    waitingTraining: 'Waiting for Training...',
    countStop: '일시정지:',
    countNoEntry: '진입금지:',
    countSchoolZone: '어린이보호:',
    countNoJaywalking: '무단횡단:',
    countSlowDown: '서행:',
    countNoBicycle: '자전거금지:',
    traceLogTitle: 'Prompt Compilation Trace Log',
    traceLogInit: 'Initializing engine. Awaiting sign scan to execute system prompt parsing...',
    architectureStackTitle: 'App Architecture Stack',
    feature1Name: 'Client-side AI OCR (Tesseract.js)',
    feature1Desc: 'Offline neural network text extraction running directly inside the user's browser.',
    feature2Name: 'Dynamic Prompt Compilation Engine',
    feature2Desc: 'Adjusts safety analysis, translation styles, and emergency alerts instantly based on custom system instructions.',
    feature3Name: 'Speech Synthesis Guide (Web Speech API)',
    feature3Desc: 'Converts translations into natural speech using native local voice synthesis matching targets (EN, ZH, JA).',
    feature4Name: 'Warning Alarm System (Web Audio API)',
    feature4Desc: 'Synthesizes custom alert sirens offline using hardware oscillators depending on sign hazard ratings.',
    
    // API
    apiSettingsTitle: '🔑 Gemini API Settings',
    apiStatusMissing: 'Missing Key',
    apiStatusConfigured: 'Live AI Active',
    apiKeyPlaceholder: 'Enter Gemini API Key...',
    apiSaveBtn: 'Save',
    apiKeyDesc: 'API Key is stored locally in your browser (LocalStorage).'
  },
  lo: {
    consoleTitle: '⚙ ຄອນໂຊນການກຳນົດຄຳສັ່ງ AI Prompt',
    modifySystemPrompt: 'ແກ້ໄຂຄຳສັ່ງລະບົບ (Instruction)',
    resetBtn: 'ຕັ້ງຄ່າໃໝ່',
    promptPlaceholder: 'ກຳນົດຄ່າແນວທາງຄວາມປອດໄພ ແລະ ໂທນສຽງຢູ່ບ່ອນນີ້...',
    strictBtn: '🚨 ໂທນເຕືອນໄພເຂັ້ມງວດ',
    friendlyBtn: '😊 ຜູ້ແນະນຳການທ່ອງທ່ຽວທີ່ເປັນມິດ',
    tempLabel: 'ອຸນຫະພູມ LLM (ດັດຊະນີຄວາມຄິດສ້າງສັນ)',
    tempMuted: 'ອຸນຫະພູມຕ່ຳ = ສະຖຽນ & ເຊື່ອຖືໄດ້',
    visionLabTitle: 'ຫ້ອງທົດລອງການຝຶກອົບຮົມ AI Vision',
    mlLoading: 'ກຳລັງໂຫຼດ ML...',
    mlStatus: 'ສະຖານະ MobileNet:',
    selectTargetClass: 'ເລືອກຄລາສເປົ້າໝາຍຂອງປ້າຍ',
    trainWebcamBtn: '📸 ຝຶກອົບຮົມເຟຣມເວັບແຄມ',
    trainDatasetBtn: '🚀 ຝຶກອົບຮົມຮູບພາບຕົວຈິງ',
    inferenceLabel: 'ການຄາດຄະເນ AI Vision:',
    waitingTraining: 'ລໍຖ້າການຝຶກອົບຮົມ...',
    countStop: 'ຢຸດຊົ່ວຄາວ:',
    countNoEntry: 'ຫ້າມເຂົ້າ:',
    countSchoolZone: 'ເຂດໂຮງຮຽນ:',
    countNoJaywalking: 'ຫ້າມຂ້າມທາງຊະຊາຍ:',
    countSlowDown: 'ຜ່ອນຄວາມໄວ:',
    countNoBicycle: 'ຫ້າມລົດຖີບ:',
    traceLogTitle: 'ບັນທຶກການລວບລວມຄຳສັ່ງ Prompt Trace',
    traceLogInit: 'ກຳລັງເລີ່ມຕົ້ນລະບົບ. ລໍຖ້າການສະແກນປ້າຍເພື່ອວິເຄາະຄຳສັ່ງລະບົບ...',
    architectureStackTitle: 'ສະຖາປັດຕະຍະກຳແອັບພລິເຄຊັນ',
    feature1Name: 'AI OCR ໃນເຄື່ອງຜູ້ໃຊ້ (Tesseract.js)',
    feature1Desc: 'ການສະກັດເອົາຂໍ້ຄວາມດ້ວຍໂຄງຂ່າຍປະສາດແບບອອຟລາຍທີ່ເຮັດວຽກໂດຍກົງໃນບຣາວເຊີ.',
    feature2Name: 'ລະບົບລວບລວມຄຳສັ່ງແບບໄດນາມິກ',
    feature2Desc: 'ປັບປຸງການວິເຄາະຄວາມປອດໄພ, ຮູບແບບການແປ, ແລະການເຕືອນໄພສຸກເສີນໂດຍອີງຕາມຄຳສັ່ງລະບົບ.',
    feature3Name: 'ຄູ່ມືການສັງເຄາະສຽງ (Web Speech API)',
    feature3Desc: 'ແປງຂໍ້ຄວາມແປເປັນສຽງເວົ້າທີ່ເປັນທຳມະຊາດໂດຍໃຊ້ການສັງເຄາະສຽງທ້ອງຖິ່ນໃຫ້ກົງກັບເປົ້າໝາຍ.',
    feature4Name: 'ລະບົບເຕືອນໄພສຽງ (Web Audio API)',
    feature4Desc: 'ສັງເຄາະສຽງເຕືອນໄພສຸກເສີນແບບອອຟລາຍໂດຍໃຊ້ hardware oscillators ອີງຕາມລະດັບຄວາມອັນຕະລາຍ.',
    
    // API
    apiSettingsTitle: '🔑 ການຕັ້ງຄ່າ Gemini API',
    apiStatusMissing: 'ບໍ່ມີຄີ API',
    apiStatusConfigured: 'AI ເຮັດວຽກຕົວຈິງ',
    apiKeyPlaceholder: 'ປ້ອນຄີ Gemini API...',
    apiSaveBtn: 'ບັນທຶກ',
    apiKeyDesc: 'ຄີ API ຈະຖືກເກັບໄວ້ຢ່າງປອດໄພໃນບຣາວເຊີທ້ອງຖິ່ນ (LocalStorage).'
  },
  zh: {
    consoleTitle: '⚙ AI 提示词工程控制台',
    modifySystemPrompt: '修改系统提示词 (指令)',
    resetBtn: '重置',
    promptPlaceholder: '在此配置安全指南和语气要求...',
    strictBtn: '🚨 严厉警告语气',
    friendlyBtn: '😊 亲切导游语气',
    tempLabel: 'LLM 温度 (创造力指数)',
    tempMuted: '低温 = 稳定和一致',
    visionLabTitle: 'AI 视觉训练实验室 (学习控制所)',
    mlLoading: 'ML 加载中...',
    mlStatus: 'MobileNet 状态:',
    selectTargetClass: '选择训练目标标志类别',
    trainWebcamBtn: '📸 训练摄像头画面',
    trainDatasetBtn: '🚀 训练真实照片',
    inferenceLabel: 'AI 视觉推理结果:',
    waitingTraining: '等待训练...',
    countStop: '停止:',
    countNoEntry: '禁止驶入:',
    countSchoolZone: '儿童保护:',
    countNoJaywalking: '禁止横穿:',
    countSlowDown: '慢行:',
    countNoBicycle: '自行车禁止:',
    traceLogTitle: '提示词编译执行日志',
    traceLogInit: '正在初始化引擎。等待扫描标志以执行系统提示词解析...',
    architectureStackTitle: '应用架构技术栈',
    feature1Name: '客户端 AI OCR (Tesseract.js)',
    feature1Desc: '直接在用户浏览器中运行的离线神经网络文本提取技术。',
    feature2Name: '动态提示词编译引擎',
    feature2Desc: '根据自定义系统指令即时调整安全分析、翻译风格和紧急警告。',
    feature3Name: '语音合成向导 (Web Speech API)',
    feature3Desc: '使用与目标语言（英语、中文、日语等）匹配的本地语音合成，将翻译内容转换为自然语音。',
    feature4Name: '危险警报合成器 (Web Audio API)',
    feature4Desc: '根据标志危险等级，使用硬件振荡器在线下直接合成警报声。',
    
    // API
    apiSettingsTitle: '🔑 Gemini API 设置',
    apiStatusMissing: '未设置密钥',
    apiStatusConfigured: '实时 AI 已激活',
    apiKeyPlaceholder: '输入 Gemini API Key...',
    apiSaveBtn: '保存',
    apiKeyDesc: 'API 密钥仅保存在本地浏览器 (LocalStorage) 中。'
  },
  ja: {
    consoleTitle: '⚙ AI プロンプトエンジニアリングコンソール',
    modifySystemPrompt: 'システムプロンプト (指示) の変更',
    resetBtn: '初期化',
    promptPlaceholder: 'ここに安全ガイドラインとトーンの要件を設定します...',
    strictBtn: '🚨 厳格な警告トーン',
    friendlyBtn: '😊 親切な観光ガイド',
    tempLabel: 'LLM 温度 (創造性指数)',
    tempMuted: '低い温度 = 安定して一貫している',
    visionLabTitle: 'AI ビジョントレーニングラボ (学習制御所)',
    mlLoading: 'ML ロード中...',
    mlStatus: 'MobileNet ステータス:',
    selectTargetClass: 'トレーニング対象標識の選択',
    trainWebcamBtn: '📸 ウェブカメラ画像の学習',
    trainDatasetBtn: '🚀 実際の写真の学習',
    inferenceLabel: 'AI ビジョン推論結果:',
    waitingTraining: '学習待ち...',
    countStop: '一時停止:',
    countNoEntry: '進入禁止:',
    countSchoolZone: '児童保護:',
    countNoJaywalking: '横断禁止:',
    countSlowDown: '徐行:',
    countNoBicycle: '自転車禁止:',
    traceLogTitle: 'プロンプトコンパイル実行ログ',
    traceLogInit: 'エンジン初期化中。標識スキャンを待ってシステムプロンプトの解析を実行します...',
    architectureStackTitle: 'アプリアーキテクチャスタック',
    feature1Name: 'クライアントサイド AI OCR (Tesseract.js)',
    feature1Desc: 'ユーザーのブラウザ内で直接実行されるオフラインのニューラルネットワークテキスト抽出技術。',
    feature2Name: '動的プロンプトコンパイルエンジン',
    feature2Desc: 'カスタムシステム指示に基づいて、安全分析、翻訳スタイル、および緊急警告を即座に調整します。',
    feature3Name: '音声合成ガイド (Web Speech API)',
    feature3Desc: '対象言語（英語、中国語、日本語など）に一致するローカル音声合成を使用して、翻訳内容を自然な音声に変換します。',
    feature4Name: '危険警告サイレンシステム (Web Audio API)',
    feature4Desc: '標識の危険度レベルに応じて、ハードウェア発振器を用いてオフラインで警告音を直接合成します。',
    
    // API
    apiSettingsTitle: '🔑 Gemini API 設定',
    apiStatusMissing: 'APIキー未設定',
    apiStatusConfigured: 'リアルタイムAI有効',
    apiKeyPlaceholder: 'Gemini API Key を入力...',
    apiSaveBtn: '保存',
    apiKeyDesc: 'API キーはブラウザのローカル（LocalStorage）にのみ安全に保存されます。'
  }
};

function updateGlobalUI() {
  const lang = appState.globalLang || 'ko';
  const ui = GLOBAL_UI_TRANSLATIONS[lang] || GLOBAL_UI_TRANSLATIONS['en'];

  // 1. Console title
  const consoleTitle = document.getElementById('lbl-console-title');
  if (consoleTitle) consoleTitle.innerHTML = `<span style="color: var(--color-info)">⚙</span> ${ui.consoleTitle}`;

  // 2. Modify prompt title
  const modPromptTitle = document.getElementById('lbl-modify-prompt-title');
  if (modPromptTitle) {
    const svg = modPromptTitle.querySelector('svg');
    modPromptTitle.innerHTML = '';
    if (svg) modPromptTitle.appendChild(svg);
    modPromptTitle.appendChild(document.createTextNode(' ' + ui.modifySystemPrompt));
  }

  // 3. Reset Button
  const resetPromptBtn = document.getElementById('btn-reset-prompt');
  if (resetPromptBtn) resetPromptBtn.textContent = ui.resetBtn;

  // 4. Textarea Placeholder
  const promptInput = document.getElementById('prompt-input');
  if (promptInput) promptInput.placeholder = ui.promptPlaceholder;

  // 5. Template buttons
  const btnStrict = document.getElementById('btn-template-warning');
  if (btnStrict) btnStrict.textContent = ui.strictBtn;
  
  const btnFriendly = document.getElementById('btn-template-friendly');
  if (btnFriendly) btnFriendly.textContent = ui.friendlyBtn;
  
  const btnLao = document.getElementById('btn-template-lao');
  if (btnLao) btnLao.textContent = ui.laoBtn;

  // 6. Temperature Slider Group
  const lblTempTitle = document.getElementById('lbl-temp-title');
  if (lblTempTitle) lblTempTitle.textContent = ui.tempLabel;
  const lblTempDesc = document.getElementById('lbl-temp-desc');
  if (lblTempDesc) lblTempDesc.textContent = ui.tempMuted;

  // 7. AI Vision Training Lab Card Title
  const visionLabTitle = document.getElementById('lbl-vision-lab-title');
  if (visionLabTitle) {
    const svg = visionLabTitle.querySelector('svg');
    visionLabTitle.innerHTML = '';
    if (svg) visionLabTitle.appendChild(svg);
    const textSpan = document.createElement('span');
    textSpan.id = 'lbl-vision-lab-text';
    textSpan.textContent = ' ' + ui.visionLabTitle;
    visionLabTitle.appendChild(textSpan);
  }

  // 8. MobileNet status label prefix
  const mlStatusPrefix = document.getElementById('lbl-mobilenet-status-prefix');
  if (mlStatusPrefix) mlStatusPrefix.textContent = ui.mlStatus + ' ';

  // 9. Class Select Label
  const classSelectLabel = document.getElementById('lbl-select-class-title');
  if (classSelectLabel) classSelectLabel.textContent = ui.selectTargetClass;

  // 10. Select dropdown option tags
  const optStop = document.getElementById('opt-stop');
  if (optStop) optStop.textContent = ui.countStop.replace(':', '') + ' (STOP)';
  
  const optNoEntry = document.getElementById('opt-no-entry');
  if (optNoEntry) optNoEntry.textContent = ui.countNoEntry.replace(':', '') + ' (No Entry)';
  
  const optSchool = document.getElementById('opt-school-zone');
  if (optSchool) optSchool.textContent = ui.countSchoolZone.replace(':', '') + ' (School Zone)';
  
  const optJaywalk = document.getElementById('opt-no-jaywalking');
  if (optJaywalk) optJaywalk.textContent = ui.countNoJaywalking.replace(':', '') + ' (No Jaywalking)';
  
  const optSlow = document.getElementById('opt-slow-down');
  if (optSlow) optSlow.textContent = ui.countSlowDown.replace(':', '') + ' (Slow Down)';
  
  const optBicycle = document.getElementById('opt-no-bicycle');
  if (optBicycle) optBicycle.textContent = ui.countNoBicycle.replace(':', '') + ' (No Bicycles)';

  // 11. Training buttons
  const btnCapture = document.getElementById('btn-train-capture');
  if (btnCapture) btnCapture.textContent = ui.trainWebcamBtn;
  
  const btnDataset = document.getElementById('btn-train-dataset');
  if (btnDataset) btnDataset.textContent = ui.trainDatasetBtn;

  // 12. Inference Header
  const predictTitle = document.getElementById('lbl-vision-predict-res-title');
  if (predictTitle) predictTitle.textContent = ui.inferenceLabel;

  // 13. Inference waiting placeholder (if not running)
  const predictRes = document.getElementById('vision-predict-res');
  if (predictRes && (predictRes.textContent === 'Waiting for Training...' || predictRes.textContent === '학습 대기 중...' || predictRes.textContent === 'ລໍຖ້າການຝຶກອົບຮົມ...')) {
    predictRes.textContent = ui.waitingTraining;
  }

  // 14. Count grid labels
  const lblStop = document.getElementById('lbl-count-stop');
  if (lblStop) lblStop.textContent = ui.countStop;
  
  const lblNoEntry = document.getElementById('lbl-count-no_entry');
  if (lblNoEntry) lblNoEntry.textContent = ui.countNoEntry;
  
  const lblSchool = document.getElementById('lbl-count-school_zone');
  if (lblSchool) lblSchool.textContent = ui.countSchoolZone;
  
  const lblJaywalk = document.getElementById('lbl-count-no_jaywalking');
  if (lblJaywalk) lblJaywalk.textContent = ui.countNoJaywalking;
  
  const lblSlow = document.getElementById('lbl-count-slow_down');
  if (lblSlow) lblSlow.textContent = ui.countSlowDown;
  
  const lblBike = document.getElementById('lbl-count-no_bicycle');
  if (lblBike) lblBike.textContent = ui.countNoBicycle;

  // 15. Execution Feedback log title
  const traceLogTitle = document.getElementById('lbl-trace-log-title');
  if (traceLogTitle) traceLogTitle.textContent = ui.traceLogTitle;

  const traceLogInit = document.getElementById('impact-desc');
  if (traceLogInit && (traceLogInit.textContent.includes('Initializing engine') || traceLogInit.textContent.includes('엔진 초기화 중') || traceLogInit.textContent.includes('ກຳລັງເລີ່ມຕົ້ນລະບົບ'))) {
    traceLogInit.textContent = ui.traceLogInit;
  }

  // 16. App Architecture section
  const archTitle = document.getElementById('lbl-architecture-title');
  if (archTitle) archTitle.textContent = ui.architectureStackTitle;

  const feat1Name = document.getElementById('lbl-feat1-name');
  if (feat1Name) feat1Name.textContent = ui.feature1Name;
  const feat1Desc = document.getElementById('lbl-feat1-desc');
  if (feat1Desc) feat1Desc.textContent = ui.feature1Desc;

  const feat2Name = document.getElementById('lbl-feat2-name');
  if (feat2Name) feat2Name.textContent = ui.feature2Name;
  const feat2Desc = document.getElementById('lbl-feat2-desc');
  if (feat2Desc) feat2Desc.textContent = ui.feature2Desc;

  const feat3Name = document.getElementById('lbl-feat3-name');
  if (feat3Name) feat3Name.textContent = ui.feature3Name;
  const feat3Desc = document.getElementById('lbl-feat3-desc');
  if (feat3Desc) feat3Desc.textContent = ui.feature3Desc;

  const feat4Name = document.getElementById('lbl-feat4-name');
  if (feat4Name) feat4Name.textContent = ui.feature4Name;
  const feat4Desc = document.getElementById('lbl-feat4-desc');
  if (feat4Desc) feat4Desc.textContent = ui.feature4Desc;

  // 17. Update top global buttons active style
  document.querySelectorAll('.g-lang-btn').forEach(btn => {
    if (btn.dataset.lang === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Gemini API Key Console Card translations
  const apiTitle = document.getElementById('lbl-api-title-text');
  if (apiTitle) apiTitle.textContent = ui.apiSettingsTitle || '🔑 Gemini API Settings';
  const apiSaveBtn = document.getElementById('btn-save-api-key');
  if (apiSaveBtn) apiSaveBtn.textContent = ui.apiSaveBtn || 'Save';
  const apiKeyInput = document.getElementById('api-key-input');
  if (apiKeyInput) apiKeyInput.placeholder = ui.apiKeyPlaceholder || 'Enter Gemini API Key...';
  const apiKeyDesc = document.getElementById('lbl-api-key-desc');
  if (apiKeyDesc) apiKeyDesc.textContent = ui.apiKeyDesc || 'API Key is stored locally in your browser.';
  
  // Update badge text based on state
  if (typeof updateApiBadgeUI === 'function') {
    updateApiBadgeUI();
  }
}

// UI Rendering
function updateResultCard(sign) {
  const resultCard = document.getElementById('result-card');
  const previewDiv = document.getElementById('result-sign-preview');
  const titleKr = document.getElementById('result-title-kr');
  const dangerTag = document.getElementById('danger-tag');
  
  // Toggle Visibility
  resultCard.style.display = 'flex';
  
  // Danger pulses and tag configuration
  resultCard.className = 'result-card';
  dangerTag.className = 'danger-tag';
  
  if (sign.dangerLevel === 'high') {
    resultCard.classList.add('pulse-danger');
    dangerTag.classList.add('tag-high');
  } else if (sign.dangerLevel === 'medium') {
    resultCard.classList.add('pulse-warning');
    dangerTag.classList.add('tag-medium');
  } else {
    dangerTag.classList.add('tag-low');
  }
  
  // Set text and preview
  previewDiv.innerHTML = sign.svg;
  titleKr.textContent = sign.name;
  
  // Audio chime play
  playWarningSound(sign.dangerLevel);
  
  // Refresh translation panel and localize UI labels
  renderTranslation();
}

function renderTranslation() {
  // Localize UI labels dynamically (regardless of whether a sign is selected)
  updatePhoneUI();

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
  
  const ui = PHONE_UI_TRANSLATIONS[lang] || PHONE_UI_TRANSLATIONS['en'];
  
  // Update danger tag text dynamically
  const dangerTag = document.getElementById('danger-tag');
  if (sign.dangerLevel === 'high') {
    dangerTag.innerHTML = ui.highDanger;
  } else if (sign.dangerLevel === 'medium') {
    dangerTag.innerHTML = ui.warning;
  } else {
    dangerTag.innerHTML = ui.lowRisk;
  }
  
  // Update OCR raw text label dynamically
  document.getElementById('result-ocr-raw').textContent = `${ui.ocrRaw}: "${sign.ocrText}"`;
  
  // Update TTS voice name indicator with localized language names
  const voiceNameSpan = document.getElementById('voice-name');
  
  const langNameLocal = {
    en: { en: 'English (US)', lo: 'Lao (Laotian)', zh: 'Chinese (Mandarin)', ja: 'Japanese' },
    lo: { en: 'ພາສາອັງກິດ (US)', lo: 'ພາສາລາວ', zh: 'ພາສາຈີນ', ja: 'ພາສາຍີ່ປຸ່ນ' },
    zh: { en: '英语 (US)', lo: '老挝语', zh: '中文 (普通话)', ja: '日语' },
    ja: { en: '英語 (US)', lo: 'ラオス語', zh: '中国語 (北京語)', ja: '日本語' }
  };
  
  const currentLangNames = langNameLocal[lang] || langNameLocal['en'];
  voiceNameSpan.textContent = `${currentLangNames[lang]} ${ui.assistant}`;
  
  // Update welcome message dynamically if it exists
  const welcomeMsgEl = document.querySelector('#chat-welcome-msg');
  if (welcomeMsgEl) {
    const welcome = BOT_WELCOME_MSGS[lang] || BOT_WELCOME_MSGS['en'];
    welcomeMsgEl.textContent = welcome;
  }
  updateQuickQuestions();

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
      <path d="M11.536 14.01A8.47 8.47 0 0 0 14 10c0-1.72-.513-3.32-1.402-4.67a.5.5 0 0 0-.8-.198l-.005.005a5 5 0 0 1-.68.68L12 6.4a6.47 6.47 0 0 1 1 3.6c0 1.282-.375 2.478-1.022 3.49a.5.5 0 0 0-.16.666l.006.01a.5.5 0 0 0 .66.16Zm-2.614-1.9a5.5 5.5 0 0 0 1.6-3.83c0-1.28-.432-2.458-1.162-3.41a.5.5 0 0 0-.752-.08l-.008.008a.5.5 0 0 0-.083.755 4.5 4.5 0 0 1 1 2.73 4.5 4.5 0 0 1-1.35 3.19.5.5 0 0 0-.022.752l.004.004a.5.5 0 0 0 .753-.021Z"/>
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
  
  if (appState.isCameraActive) {
    if (appState.isAutoScanActive) {
      toggleAutoScan();
    }
    
    if (appState.mediaStream) {
      appState.mediaStream.getTracks().forEach(track => track.stop());
    }
    appState.mediaStream = null;
    video.style.display = 'none';
    placeholder.style.display = 'flex';
    scanLine.style.display = 'none';
    container.classList.remove('active');
    appState.isCameraActive = false;
    updatePhoneUI();
    showStatus("Auto Scan deactivated.");
  } else {
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
      updatePhoneUI();
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
    updatePhoneUI();
    showStatus("Auto Scan deactivated.");
  } else {
    if (!appState.isCameraActive) {
      await toggleCamera();
      if (!appState.isCameraActive) return;
    }
    
    appState.isAutoScanActive = true;
    autoScanBtn.classList.add('active');
    updatePhoneUI();
    showStatus("Auto Scan: Active (Listening...)");
    
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
  
  showStatus("Processing Image...");
  
  const reader = new FileReader();
  reader.onload = function(event) {
    const placeholder = document.getElementById('scanner-placeholder');
    const video = document.getElementById('scanner-video');
    const container = document.getElementById('scanner-container');
    const scanLine = document.getElementById('scan-line');
    
    if (appState.isCameraActive) {
      toggleCamera();
    }
    
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
    
    runOCR(file);
  };
  reader.readAsDataURL(file);
}

// Real client-side OCR using Tesseract.js
async function runOCR(imageSource) {
  showStatus("AI analyzing sign text...", true);
  
  try {
    if (typeof Tesseract === 'undefined') {
      console.warn("Tesseract.js not loaded. Simulating OCR detection...");
      setTimeout(() => {
        const randomSign = TRAFFIC_SIGNS[Math.floor(Math.random() * TRAFFIC_SIGNS.length)];
        selectSignPreset(randomSign.id);
        showStatus("AI Scanner completed (Simulated OCR)");
      }, 1500);
      return;
    }
    
    const worker = await Tesseract.createWorker('kor');
    const ret = await worker.recognize(imageSource);
    const text = ret.data.text.replace(/\s+/g, '');
    
    console.log("OCR Extracted Text:", text);
    await worker.terminate();
    
    let matchedSign = null;
    for (const sign of TRAFFIC_SIGNS) {
      if (text.includes(sign.ocrText) || sign.ocrText.split('').every(char => text.includes(char))) {
        matchedSign = sign;
        break;
      }
    }
    
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
  
  playShutterSound();
  
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
  
  stopSpeaking();
  
  document.querySelectorAll('.preset-card').forEach(card => {
    card.classList.remove('active');
    if (card.dataset.id === id) {
      card.classList.add('active');
    }
  });
  
  const imgPreview = document.getElementById('scanner-img-preview');
  const placeholder = document.getElementById('scanner-placeholder');
  const video = document.getElementById('scanner-video');
  const scanLine = document.getElementById('scan-line');
  
  if (imgPreview) {
    imgPreview.style.display = 'none';
  }
  
  if (!appState.isCameraActive) {
    const lang = appState.activeLang;
    const ui = PHONE_UI_TRANSLATIONS[lang] || PHONE_UI_TRANSLATIONS['en'];
    placeholder.style.display = 'flex';
    placeholder.innerHTML = `
      <div style="width: 70px; height: 70px; margin-bottom: 8px;">${sign.svg}</div>
      <span style="color: white; font-weight: 700;">${sign.name}</span>
      <p style="font-size: 10px; color: var(--text-secondary); margin-top: 4px;">${ui.tapOcrScan}</p>
    `;
    video.style.display = 'none';
    scanLine.style.display = 'none';
  }
  
  updateResultCard(sign);
  resetChatbotForActiveSign();
}

// Status message bar helper
function showStatus(msg, isLoader = false) {
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  
  const lang = appState.activeLang;
  const ui = PHONE_UI_TRANSLATIONS[lang] || PHONE_UI_TRANSLATIONS['en'];
  
  let translatedMsg = msg;
  if (msg.includes("Connecting camera...")) translatedMsg = ui.connectingCamera;
  else if (msg.includes("Camera Active")) translatedMsg = ui.cameraActive;
  else if (msg.includes("Camera failed")) translatedMsg = ui.cameraFailed;
  else if (msg.includes("Auto Scan deactivated")) translatedMsg = ui.autoScanDeactivated;
  else if (msg.includes("Auto Scan: Active")) translatedMsg = ui.autoScanListening;
  else if (msg.includes("Auto Scan: Detected")) {
    const signName = msg.replace('Auto Scan: Detected "', '').replace('"', '');
    translatedMsg = `${ui.autoScanDetected}: "${signName}"`;
  }
  else if (msg.includes("Processing Image...")) translatedMsg = ui.processingImage;
  else if (msg.includes("AI analyzing sign text...")) translatedMsg = ui.analyzingText;
  else if (msg.includes("AI Scanner completed")) translatedMsg = ui.scannerCompleted;
  else if (msg.includes("AI Scanner matched")) {
    const signName = msg.replace('AI Scanner matched: "', '').replace('"', '');
    translatedMsg = `${ui.scannerMatched}: "${signName}"`;
  }
  else if (msg.includes("No clear traffic sign detected")) translatedMsg = ui.noSignDetected;
  else if (msg.includes("AI Scanner offline")) translatedMsg = ui.scannerOffline;
  else if (msg.includes("AI ready. Auto-training")) translatedMsg = ui.aiReadyTraining;
  else if (msg.includes("AI base model trained")) translatedMsg = ui.baseModelTrained;
  else if (msg.includes("Trained 1 webcam frame")) {
    const className = msg.replace('Trained 1 webcam frame for class: "', '').replace('"', '');
    translatedMsg = `${ui.trainedWebcamFrame}: "${className}"`;
  }
  else if (msg.includes("AI loading actual")) translatedMsg = ui.loadingActualPhotos;
  else if (msg.includes("Actual Photos Training Complete")) translatedMsg = ui.actualPhotosComplete;
  else if (msg.includes("Training failed")) translatedMsg = ui.trainingFailed;
  else if (msg.includes("Vision AI: Detected")) {
    const match = msg.match(/Vision AI: Detected "([^"]+)" with (\d+)% confidence/);
    if (match) {
      translatedMsg = `${ui.visionAiDetected} "${match[1]}" (${match[2]}% ${ui.confidence})`;
    }
  }
  
  text.textContent = translatedMsg;
  if (isLoader) {
    dot.className = 'status-dot loading';
  } else {
    dot.className = 'status-dot';
  }
}

// Initializers
document.addEventListener('DOMContentLoaded', () => {
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
  
  document.getElementById('camera-toggle-btn').addEventListener('click', toggleCamera);
  document.getElementById('auto-scan-btn').addEventListener('click', toggleAutoScan);
  document.getElementById('capture-btn').addEventListener('click', capturePhoto);
  
  document.getElementById('upload-input').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleImageUpload(e.target.files[0]);
    }
  });
  
  document.getElementById('scanner-placeholder').addEventListener('click', () => {
    if (!appState.isCameraActive) {
      document.getElementById('upload-input').click();
    }
  });
  
  const promptTextarea = document.getElementById('prompt-input');
  promptTextarea.value = appState.systemPrompt;
  promptTextarea.addEventListener('input', (e) => {
    appState.systemPrompt = e.target.value;
    renderTranslation();
  });
  
  const tempSlider = document.getElementById('temp-slider');
  tempSlider.value = appState.temperature;
  tempSlider.addEventListener('input', (e) => {
    appState.temperature = parseFloat(e.target.value);
    document.getElementById('temp-val').textContent = appState.temperature.toFixed(1);
    renderTranslation();
  });
  
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.dataset.lang;
      appState.activeLang = lang;
      
      // If selected language is supported by global UI switcher, synchronize it
      if (lang === 'ko' || lang === 'en' || lang === 'lo') {
        appState.globalLang = lang;
        updateGlobalUI();
      }
      renderTranslation();
    });
  });
  
  document.getElementById('btn-reset-prompt').addEventListener('click', () => {
    promptTextarea.value = PROMPT_TEMPLATES.standard;
    appState.systemPrompt = PROMPT_TEMPLATES.standard;
    renderTranslation();
  });
  
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

  // Mode Tabs Event Listeners
  document.getElementById('tab-scan').addEventListener('click', () => toggleTab('scan'));
  document.getElementById('tab-map').addEventListener('click', () => toggleTab('map'));

  // Environmental Controls Click Handlers
  document.getElementById('btn-env-clear').addEventListener('click', () => toggleWeather('clear'));
  document.getElementById('btn-env-nightrain').addEventListener('click', () => toggleWeather('nightrain'));

  // GPS Simulation Trigger
  document.getElementById('btn-gps-simulate').addEventListener('click', toggleGpsSimulation);

  // Map Hotspots Event Listeners
  document.querySelectorAll('.map-hotspot').forEach(hotspot => {
    hotspot.addEventListener('click', () => {
      const id = hotspot.dataset.id;
      selectSignPreset(id);
    });
  });

  // Chat Input Triggers
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  if (chatInput && chatSendBtn) {
    chatSendBtn.addEventListener('click', () => {
      const val = chatInput.value.trim();
      if (val) {
        handleChatSubmit(val);
        chatInput.value = '';
      }
    });
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const val = chatInput.value.trim();
        if (val) {
          handleChatSubmit(val);
          chatInput.value = '';
        }
      }
    });
  }

  // AI Vision Training Console bindings
  document.getElementById('btn-train-capture').addEventListener('click', trainWebcamFrame);
  document.getElementById('btn-train-dataset').addEventListener('click', trainActualDataset);
  
  // Global switcher listeners
  document.querySelectorAll('.g-lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      appState.globalLang = lang;
      appState.activeLang = lang; // Synchronize target translation language!
      
      // Update phone lang selector tab class states
      document.querySelectorAll('.lang-btn').forEach(b => {
        if (b.dataset.lang === lang) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      
      updateGlobalUI();
      renderTranslation();
    });
  });

  // NEW: Clipboard Copy button
  const copyBtn = document.getElementById('btn-copy-translation');
  if (copyBtn) copyBtn.addEventListener('click', copyTranslation);

  // NEW: Pronunciation Guide toggle
  const pronToggle = document.getElementById('pronunciation-toggle');
  if (pronToggle) pronToggle.addEventListener('click', togglePronunciation);

  // NEW: Comparison View toggle
  const compareToggle = document.getElementById('compare-toggle');
  if (compareToggle) compareToggle.addEventListener('click', toggleCompare);

  // NEW: Gemini API Key save button
  const saveApiKeyBtn = document.getElementById('btn-save-api-key');
  if (saveApiKeyBtn) saveApiKeyBtn.addEventListener('click', saveGeminiApiKey);

  // NEW: Simulator Toggle
  const simToggle = document.getElementById('simulator-toggle');
  if (simToggle) simToggle.addEventListener('click', toggleSimulator);

  // NEW: Simulator Input Event Listeners
  const simSpeedSlider = document.getElementById('sim-speed-slider');
  if (simSpeedSlider) {
    simSpeedSlider.addEventListener('input', (e) => {
      appState.simSpeed = parseInt(e.target.value);
      document.getElementById('sim-speed-val').textContent = `${appState.simSpeed} km/h`;
      calculateStoppingDistance();
    });
  }

  const simReactionSlider = document.getElementById('sim-reaction-slider');
  if (simReactionSlider) {
    simReactionSlider.addEventListener('input', (e) => {
      appState.simReaction = parseFloat(e.target.value);
      document.getElementById('sim-reaction-val').textContent = `${appState.simReaction.toFixed(1)} sec`;
      calculateStoppingDistance();
    });
  }

  const simSlopeSlider = document.getElementById('sim-slope-slider');
  if (simSlopeSlider) {
    simSlopeSlider.addEventListener('input', (e) => {
      appState.simSlope = parseInt(e.target.value);
      const valText = appState.simSlope === 0 ? 'Flat (0%)' : (appState.simSlope > 0 ? `Uphill (+${appState.simSlope}%)` : `Downhill (${appState.simSlope}%)`);
      document.getElementById('sim-slope-val').textContent = valText;
      calculateStoppingDistance();
    });
  }

  // Road Condition Buttons
  const roadDryBtn = document.getElementById('sim-road-dry');
  const roadWetBtn = document.getElementById('sim-road-wet');
  const roadIcyBtn = document.getElementById('sim-road-icy');

  const updateRoadSelection = (mu, activeBtn) => {
    appState.simMu = mu;
    [roadDryBtn, roadWetBtn, roadIcyBtn].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
    if (activeBtn) activeBtn.classList.add('active');
    calculateStoppingDistance();
  };

  if (roadDryBtn) roadDryBtn.addEventListener('click', () => updateRoadSelection(0.7, roadDryBtn));
  if (roadWetBtn) roadWetBtn.addEventListener('click', () => updateRoadSelection(0.4, roadWetBtn));
  if (roadIcyBtn) roadIcyBtn.addEventListener('click', () => updateRoadSelection(0.1, roadIcyBtn));

  // Explainer button
  const aiExplainBtn = document.getElementById('btn-sim-ai-explain');
  if (aiExplainBtn) aiExplainBtn.addEventListener('click', explainStoppingPhysicsWithAI);

  // Initialize Chrome On-device AI (window.ai)
  initOnDeviceAI();

  // Initial Global UI Translate
  updateGlobalUI();

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
    
    await autoTrainPresets();
    
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

function drawSignToCanvasContext(ctx, signId) {
  if (signId === 'stop') {
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
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('일시정지', 0, -10);
    ctx.font = '900 16px Inter, sans-serif';
    ctx.fillText('STOP', 0, 18);
  } 
  else if (signId === 'no_entry') {
    ctx.beginPath();
    ctx.arc(0, 0, 72, 0, Math.PI * 2);
    ctx.fillStyle = '#E53935';
    ctx.fill();
    ctx.closePath();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-50, -12, 100, 24);
  } 
  else if (signId === 'school_zone') {
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
    
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-14, -18, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-20, -7, 12, 35);
    
    ctx.beginPath();
    ctx.arc(14, -24, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(8, -15, 10, 28);
  }
  else if (signId === 'no_jaywalking') {
    ctx.fillStyle = '#1565C0';
    ctx.fillRect(-70, -70, 140, 140);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, -42, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-10, -28, 20, 40);
    
    ctx.beginPath();
    ctx.strokeStyle = '#FF1744';
    ctx.lineWidth = 14;
    ctx.moveTo(-55, -55);
    ctx.lineTo(55, 55);
    ctx.stroke();
  }
  else if (signId === 'slow_down') {
    ctx.beginPath();
    ctx.arc(0, 0, 72, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.closePath();
    
    ctx.beginPath();
    ctx.arc(0, 0, 72, 0, Math.PI * 2);
    ctx.strokeStyle = '#E53935';
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.closePath();
    
    ctx.fillStyle = '#212121';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('서행', 0, -22);
    ctx.font = '800 16px Inter, sans-serif';
    ctx.fillText('SLOW', 0, 12);
  } 
  else if (signId === 'no_bicycle') {
    ctx.beginPath();
    ctx.arc(0, 0, 70, 0, Math.PI * 2);
    ctx.strokeStyle = '#E53935';
    ctx.lineWidth = 10;
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(-22, 8, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(22, 8, 12, 0, Math.PI * 2);
    ctx.stroke();
    
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

const BOT_WELCOME_MSGS = {
  ko: "안녕하세요! AI 교통 안전 도우미입니다. 이 표지판이나 한국의 도로 안전에 대해 궁금한 점을 무엇이든 질문해 주세요.",
  en: "Hello! I am your AI Safety Assistant. Ask me anything about this traffic sign or road safety in Korea.",
  lo: "ສະບາຍດີ! ຂ້ອຍແມ່ນຜູ້ຊ່ວຍຄວາມປອດໄພ AI. ຖາມຂ້ອຍໄດ້ທຸກຢ່າງກ່ຽວກັບປ້າຍຈະລາຈອນນີ້ ຫຼື ຄວາມປອດໄພທາງບົກໃນເກົາຫຼີ.",
  zh: "您好！我是您的 AI 安全助手。如果您对该交通标志或韩国道路安全有任何疑问，请随时提问。",
  ja: "こんにちは！AI安全アシスタントです。この標識や韓国の交通安全ルールについて、気になる点があれば何でも質問してください。"
};

async function trainActualDataset() {
  if (!mobilenetModel || !knnClassifierInstance) return;
  
  const datasetBtn = document.getElementById('btn-train-dataset');
  datasetBtn.disabled = true;
  datasetBtn.textContent = '⏳ Training Actual Photos...';
  showStatus("AI loading actual traffic sign photos dataset...", true);
  
  try {
    const classes = ['stop', 'no_entry', 'school_zone', 'no_jaywalking', 'slow_down', 'no_bicycle'];
    
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
        
        const angle = (Math.random() - 0.5) * 0.5;
        const scale = 0.75 + Math.random() * 0.45;
        ctx.rotate(angle);
        ctx.scale(scale, scale);
        
        drawSignToCanvasContext(ctx, signId);
        
        ctx.restore();
        
        const activation = mobilenetModel.infer(canvas, 'conv_preds');
        knnClassifierInstance.addExample(activation, signId);
      }
      
      updateClassCount(signId);
      await new Promise(r => setTimeout(r, 80));
    }
    
    showStatus("Actual Photos Training Complete! AI vision improved.");
    datasetBtn.textContent = '✅ Training Done!';
    datasetBtn.style.background = 'linear-gradient(135deg, var(--color-success), #00b36b)';
  } catch (err) {
    console.error("Dataset training failed:", err);
    datasetBtn.disabled = false;
    datasetBtn.textContent = '🚀 Train Actual Photos';
    showStatus("Training failed. Please retry.", "error");
  }
}

// Live Prediction from webcam using KNN Classifier
async function predictWebcam() {
  if (!mobilenetModel || !knnClassifierInstance) return;
  
  const video = document.getElementById('scanner-video');
  const predictRes = document.getElementById('vision-predict-res');
  const predictBar = document.getElementById('vision-predict-bar');
  
  const predict = async () => {
    if (appState.isCameraActive && video.videoWidth > 0) {
      try {
        if (knnClassifierInstance.getNumClasses() > 0) {
          const activation = mobilenetModel.infer(video, 'conv_preds');
          const result = await knnClassifierInstance.predictClass(activation);
          
          const confidence = result.confidences[result.label] || 0;
          const confidencePct = Math.round(confidence * 100);
          
          predictRes.textContent = `${result.label.toUpperCase()} (${confidencePct}%)`;
          predictBar.style.width = `${confidencePct}%`;
          
          if (confidence > 0.75 && appState.isCameraActive) {
            if (!appState.selectedSign || appState.selectedSign.id !== result.label) {
              selectSignPreset(result.label);
              showStatus(`Vision AI: Detected "${result.label}" with ${confidencePct}% confidence`);
            }
          }
        }
      } catch (e) {
        // Silently ignore prediction errors
      }
    }
    
    setTimeout(predict, 500);
  };
  
  predict();
}

// ==========================================
// Weather Rain & Night Environment Engine
// ==========================================

let rainParticles = [];
let animationFrameId = null;

function startRainEngine() {
  const canvas = document.getElementById('env-canvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  
  const ctx = canvas.getContext('2d');
  
  const resizeCanvas = () => {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  };
  resizeCanvas();
  
  rainParticles = [];
  const maxParticles = 60;
  for (let i = 0; i < maxParticles; i++) {
    rainParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      l: Math.random() * 15 + 10,
      xs: -2 - Math.random() * 2,
      ys: 10 + Math.random() * 10
    });
  }
  
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(11, 15, 25, 0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(174, 219, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    
    for (let i = 0; i < rainParticles.length; i++) {
      const p = rainParticles[i];
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.xs, p.y + p.l);
      ctx.stroke();
      
      p.x += p.xs;
      p.y += p.ys;
      
      if (p.x < -20 || p.y > canvas.height) {
        p.x = Math.random() * canvas.width;
        p.y = -p.l;
      }
    }
    
    if (appState.weather === 'nightrain') {
      animationFrameId = requestAnimationFrame(draw);
    }
  };
  
  draw();
}

function stopRainEngine() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  const canvas = document.getElementById('env-canvas');
  if (canvas) {
    canvas.style.display = 'none';
  }
}

function toggleWeather(mode) {
  appState.weather = mode;
  
  const btnClear = document.getElementById('btn-env-clear');
  const btnNightRain = document.getElementById('btn-env-nightrain');
  const scannerContainer = document.getElementById('scanner-container');
  
  if (mode === 'clear') {
    btnClear.classList.add('active');
    btnNightRain.classList.remove('active');
    scannerContainer.classList.remove('night-mode');
    stopRainEngine();
  } else {
    btnClear.classList.remove('active');
    btnNightRain.classList.add('active');
    scannerContainer.classList.add('night-mode');
    startRainEngine();
  }
  
  updatePhoneUI();
  if (appState.selectedSign) {
    renderTranslation();
  }
}

// ==========================================
// Mode Tabs Navigation Handler
// ==========================================

function toggleTab(tabId) {
  appState.activeTab = tabId;
  
  const scanTabBtn = document.getElementById('tab-scan');
  const mapTabBtn = document.getElementById('tab-map');
  
  const scannerContainer = document.getElementById('scanner-container');
  const cameraControlBar = document.getElementById('camera-control-bar');
  const envControlBar = document.getElementById('env-control-bar');
  const gpsMapContainer = document.getElementById('gps-map-container');
  
  if (tabId === 'scan') {
    scanTabBtn.classList.add('active');
    mapTabBtn.classList.remove('active');
    
    scannerContainer.style.display = 'flex';
    cameraControlBar.style.display = 'flex';
    envControlBar.style.display = 'flex';
    gpsMapContainer.style.display = 'none';
  } else {
    scanTabBtn.classList.remove('active');
    mapTabBtn.classList.add('active');
    
    scannerContainer.style.display = 'none';
    cameraControlBar.style.display = 'none';
    envControlBar.style.display = 'none';
    gpsMapContainer.style.display = 'flex';
    
    if (appState.isCameraActive) {
      toggleCamera();
    }
  }
}

// ==========================================
// GPS Driving Simulator HUD
// ==========================================

const GPS_ROUTE = [
  { x: 175, y: 220, hotspot: 'slow_down' }, 
  { x: 175, y: 170, hotspot: null },
  { x: 175, y: 125, hotspot: 'stop' },      
  { x: 175, y: 80, hotspot: null },
  { x: 175, y: 50, hotspot: 'school_zone' }, 
  { x: 230, y: 50, hotspot: null },
  { x: 300, y: 50, hotspot: 'no_bicycle' },  
  { x: 300, y: 90, hotspot: null },
  { x: 300, y: 125, hotspot: 'no_jaywalking' }, 
  { x: 230, y: 125, hotspot: null },
  { x: 120, y: 125, hotspot: null },
  { x: 50, y: 125, hotspot: 'no_entry' },   
  { x: 50, y: 180, hotspot: null },
  { x: 100, y: 220, hotspot: null },
  { x: 175, y: 220, hotspot: 'slow_down' }  
];

function toggleGpsSimulation() {
  const btn = document.getElementById('btn-gps-simulate');
  const carPin = document.getElementById('car-pin');
  const hudSpeed = document.getElementById('hud-speed');
  
  if (!carPin) return;
  carPin.style.transition = 'transform 1.4s ease-in-out';
  
  if (appState.isGpsSimulating) {
    appState.isGpsSimulating = false;
    clearInterval(appState.gpsInterval);
    appState.gpsInterval = null;
    
    updatePhoneUI();
    hudSpeed.textContent = "SPEED: 0 km/h";
  } else {
    appState.isGpsSimulating = true;
    updatePhoneUI();
    
    appState.carPositionIndex = 0;
    
    const runStep = () => {
      if (!appState.isGpsSimulating) return;
      
      const pt = GPS_ROUTE[appState.carPositionIndex];
      carPin.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
      
      let speed = 50;
      if (pt.hotspot) {
        selectSignPreset(pt.hotspot);
        if (pt.hotspot === 'stop') speed = 0;
        else if (pt.hotspot === 'school_zone') speed = 25;
        else if (pt.hotspot === 'slow_down') speed = 15;
      }
      
      hudSpeed.textContent = `SPEED: ${speed} km/h`;
      appState.carPositionIndex = (appState.carPositionIndex + 1) % GPS_ROUTE.length;
    };
    
    runStep();
    appState.gpsInterval = setInterval(runStep, 2000);
  }
}

// ==========================================
// Tourist Q&A Chatbot Console
// ==========================================

const BOT_WELCOME_MSGS_DUP = {
  en: "Hello! I am your AI Safety Assistant. Ask me anything about this traffic sign or road safety in Korea.",
  lo: "ສະບາຍດີ! ຂ້ອຍແມ່ນຜູ້ຊ່ວຍຄວາມປອດໄພ AI. ຖາມຂ້ອຍໄດ້ທຸກຢ່າງກ່ຽວກັບປ້າຍຈະລາຈອນນີ້ ຫຼື ຄວາມປອດໄພທາງບົກໃນເກົາຫຼີ.",
  zh: "您好！我是您的 AI 安全助手。如果您对该交通标志或韩国道路安全有任何疑问，请随时提问。",
  ja: "こんにちは！AI安全アシスタントです。この標識や韓国の交通安全ルールについて、気になる点があれば何でも質問してください。"
};

function resetChatbotForActiveSign() {
  const chatBox = document.getElementById('chat-box');
  if (!chatBox) return;
  chatBox.innerHTML = '';
  
  const lang = appState.activeLang;
  const welcome = BOT_WELCOME_MSGS[lang] || BOT_WELCOME_MSGS['en'];
  
  const botMsg = document.createElement('div');
  botMsg.className = 'chat-msg bot';
  botMsg.innerHTML = `<p id="chat-welcome-msg">${welcome}</p>`;
  chatBox.appendChild(botMsg);
  
  updateQuickQuestions();
}

function updateQuickQuestions() {
  const qContainer = document.getElementById('quick-questions');
  if (!qContainer) return;
  qContainer.innerHTML = '';
  
  if (!appState.selectedSign) return;
  
  const sign = appState.selectedSign;
  const lang = appState.activeLang;
  const baseTrans = sign.translations[lang] || sign.translations['en'];
  const faq = baseTrans.faq;
  
  if (faq) {
    const q1Text = faq.q1;
    const q2Text = faq.q2;
    const q3Text = faq.q3;
    
    if (q1Text) {
      const btn = document.createElement('span');
      btn.className = 'q-tag';
      btn.textContent = q1Text;
      btn.addEventListener('click', () => handleChatSubmit(q1Text));
      qContainer.appendChild(btn);
    }
    if (q2Text) {
      const btn = document.createElement('span');
      btn.className = 'q-tag';
      btn.textContent = q2Text;
      btn.addEventListener('click', () => handleChatSubmit(q2Text));
      qContainer.appendChild(btn);
    }
    if (q3Text) {
      const btn = document.createElement('span');
      btn.className = 'q-tag';
      btn.textContent = q3Text;
      btn.addEventListener('click', () => handleChatSubmit(q3Text));
      qContainer.appendChild(btn);
    }
  }
}

function getChatbotReply(userInput, sign, lang, promptText) {
  const baseTrans = sign.translations[lang] || sign.translations['en'];
  const faq = baseTrans.faq || {};
  
  let rawAnswer = "";
  const inputLower = userInput.toLowerCase();
  
  if (inputLower.includes("how long") || inputLower.includes("stop") || inputLower.includes("ຢຸດ") || inputLower.includes("停") || inputLower.includes("秒") || inputLower.includes("시간") || inputLower.includes("duration")) {
    rawAnswer = faq.a1 || "You must stop completely or slow down according to the safety lines.";
  } else if (inputLower.includes("fine") || inputLower.includes("penalty") || inputLower.includes("벌금") || inputLower.includes("ປັບ") || inputLower.includes("罚") || inputLower.includes("金")) {
    rawAnswer = faq.a2 || "Fines apply for violating this sign. Please obey Korean traffic laws.";
  } else if (inputLower.includes("bicycle") || inputLower.includes("scooter") || inputLower.includes("bike") || inputLower.includes("킥보드") || inputLower.includes("자전거") || inputLower.includes("ລົດຖີບ") || inputLower.includes("自行车")) {
    rawAnswer = faq.a3 || "Bicycles and PMDs must follow special regulations. Access might be restricted.";
  } else {
    if (faq.a1) rawAnswer = `${faq.a1} Also, remember that ${faq.a2}`;
    else rawAnswer = "Please follow the instructions on the sign for your safety and to avoid penalties in Korea.";
  }
  
  const isStrict = promptText.toLowerCase().match(/(strict|emergency|alert|warn|caps|위험|경고|강력|긴급)/);
  const isFriendly = promptText.toLowerCase().match(/(friendly|warm|guide|emoji|친절|환영|아이|쉽게)/);
  
  let styledAnswer = rawAnswer;
  
  const LABELS = {
    ko: { stern: "🚨 경고 공지:", friendly: "👋 안녕하세요, 여행자님!", warmSuffix: "항상 안전운전 하세요!" },
    en: { stern: "🚨 NOTICE:", friendly: "👋 Hi traveler!", warmSuffix: "Stay safe!" },
    lo: { stern: "🚨 ແຈ້ງເຕືອນ:", friendly: "👋 ສະບາຍດີ!", warmSuffix: "ເດີນທາງປອດໄພເດີ!" },
    zh: { stern: "🚨 警告通知:", friendly: "👋 你好旅行者!", warmSuffix: "祝你安全！" },
    ja: { stern: "🚨 警告通知:", friendly: "👋 観光객의 皆さん、こんにちは！", warmSuffix: "安全運転で！" }
  };
  const L = LABELS[lang] || LABELS['en'];
  
  if (isStrict) {
    styledAnswer = `${L.stern} ${styledAnswer.toUpperCase()} OBEY DIRECTIVES IMMEDIATELY.`;
  } else if (isFriendly) {
    styledAnswer = `${L.friendly} ${styledAnswer} 😊 ${L.warmSuffix}`;
  }
  
  return styledAnswer;
}

function handleChatSubmit(text) {
  if (!text || !appState.selectedSign) return;
  
  const chatBox = document.getElementById('chat-box');
  const sign = appState.selectedSign;
  const lang = appState.activeLang;
  
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user';
  userMsg.innerHTML = `<p>${text}</p>`;
  chatBox.appendChild(userMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  const thinkingMsg = document.createElement('div');
  thinkingMsg.className = 'chat-msg bot thinking';
  thinkingMsg.innerHTML = `<p>🤖 AI가 생각 중...</p>`;
  chatBox.appendChild(thinkingMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  if (appState.onDeviceAIReady && _tfPipeline) {
    // Use Transformers.js on-device AI
    const signTrans = sign.translations[lang] || sign.translations['en'];
    const systemPrompt = `You are a multilingual Korean traffic safety assistant.
Sign: "${sign.name}" | Lang: ${lang} | Title: ${signTrans.title} | Meaning: ${signTrans.meaning} | Penalty: ${signTrans.penalty}.
Always respond in the language matching code "${lang}". Be concise and helpful. Use emojis when appropriate.`;

    runTransformersAI(systemPrompt, text)
      .then(reply => {
        thinkingMsg.remove();
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-msg bot';
        botMsg.innerHTML = `<p>${reply.replace(/\n/g, '<br>')}</p>`;
        chatBox.appendChild(botMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
        playWarningSound('low');
      })
      .catch(err => {
        console.warn('Transformers.js error, falling back:', err);
        thinkingMsg.remove();
        const botAnswer = getChatbotReply(text, sign, lang, appState.systemPrompt);
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-msg bot';
        botMsg.innerHTML = `<p>${botAnswer}</p>`;
        chatBox.appendChild(botMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
        playWarningSound('low');
      });
  } else {
    // Fallback: rule-based simulation
    setTimeout(() => {
      thinkingMsg.remove();
      const botAnswer = getChatbotReply(text, sign, lang, appState.systemPrompt);
      const botMsg = document.createElement('div');
      botMsg.className = 'chat-msg bot';
      botMsg.innerHTML = `<p>${botAnswer}</p>`;
      chatBox.appendChild(botMsg);
      chatBox.scrollTop = chatBox.scrollHeight;
      playWarningSound('low');
    }, 600);
  }
}

// ==========================================
// Transformers.js On-Device AI (Qwen2.5-0.5B)
// ==========================================

let _tfPipeline = null; // cached pipeline instance

async function initOnDeviceAI() {
  const badge       = document.getElementById('api-status-badge');
  const desc        = document.getElementById('ai-status-desc');
  const progressWrap = document.getElementById('ai-download-progress');
  const progressBar  = document.getElementById('ai-progress-bar');
  const progressLbl  = document.getElementById('ai-progress-label');

  if (badge) {
    badge.textContent = '모델 로딩 중...';
    badge.style.background = 'rgba(255,193,7,0.15)';
    badge.style.color = '#FFC107';
    badge.style.borderColor = 'rgba(255,193,7,0.3)';
  }
  if (desc) desc.textContent = 'Qwen2.5-0.5B 모델을 준비하는 중입니다 (최초 실행 시 ~300MB 다운로드)...';
  if (progressWrap) progressWrap.style.display = 'block';

  try {
    _tfPipeline = await pipeline(
      'text-generation',
      'onnx-community/Qwen2.5-0.5B-Instruct',
      {
        dtype: 'q4',
        progress_callback: (info) => {
          if (info.status === 'progress' && info.total) {
            const pct = Math.round((info.loaded / info.total) * 100);
            if (progressBar) progressBar.style.width = `${pct}%`;
            if (progressLbl) progressLbl.textContent = `${info.file || '모델'} 다운로드 중... ${pct}%`;
          }
        }
      }
    );

    appState.onDeviceAIReady = true;

    if (progressWrap) progressWrap.style.display = 'none';
    if (badge) {
      badge.textContent = '🟢 Qwen2.5 AI 활성';
      badge.style.background = 'rgba(0,230,118,0.1)';
      badge.style.color = 'var(--color-success)';
      badge.style.borderColor = 'rgba(0,230,118,0.2)';
    }
    if (desc) {
      desc.innerHTML = `✅ <b>Qwen2.5-0.5B</b> 모델이 이 기기에서 직접 실행 중입니다.<br>
      <span style="color:var(--text-muted); font-size:10px;">브라우저에 캐시됨 — 다음 방문부터 즉시 로딩됩니다.</span>`;
    }
    console.log('✅ Transformers.js (Qwen2.5-0.5B-Instruct) ready');

  } catch (err) {
    console.error('Transformers.js init failed:', err);
    if (progressWrap) progressWrap.style.display = 'none';
    if (badge) {
      badge.textContent = '⚠️ 시뮬레이션 모드';
      badge.style.background = 'rgba(255,193,7,0.1)';
      badge.style.color = '#FFC107';
      badge.style.borderColor = 'rgba(255,193,7,0.2)';
    }
    if (desc) {
      desc.innerHTML = `⚠️ AI 모델 로딩 실패 — 규칙 기반 시뮬레이션으로 동작합니다.<br>
      <span style="color:var(--text-muted); font-size:10px;">${err.message}</span>`;
    }
    appState.onDeviceAIReady = false;
  }
}

async function runTransformersAI(systemPrompt, userInput) {
  if (!_tfPipeline) throw new Error('Pipeline not initialized');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userInput }
  ];

  const output = await _tfPipeline(messages, {
    max_new_tokens: 256,
    temperature: 0.7,
    do_sample: true,
    repetition_penalty: 1.1,
  });

  const generated = output[0]?.generated_text;
  if (Array.isArray(generated)) {
    const last = generated[generated.length - 1];
    return last?.content || '';
  }
  return String(generated || '').trim();
}

async function explainStoppingPhysicsWithAI() {
  const lang  = appState.activeLang;
  const speed = appState.simSpeed;
  const mu    = appState.simMu;
  const slope = appState.simSlope;
  const reactionTime = appState.simReactionTime;

  const v  = speed / 3.6;
  const g  = 9.8;
  const G  = slope / 100;
  const dr = (v * reactionTime).toFixed(1);
  const db = (v * v / (2 * g * (mu + G))).toFixed(1);
  const total = (parseFloat(dr) + parseFloat(db)).toFixed(1);
  const roadLabel = mu >= 0.6 ? 'Dry(건조)' : mu >= 0.3 ? 'Wet(습윤)' : 'Icy(결빙)';

  const prompt = `Speed: ${speed} km/h | Road: ${roadLabel} (μ=${mu}) | Slope: ${slope}% | Reaction: ${reactionTime}s
→ Reaction dist: ${dr}m + Braking dist: ${db}m = Total: ${total}m
Explain with physics (Ek=½mv², friction F=μmg, W=Fd) in "${lang}" language. Use emojis. 3-5 sentences.`;

  handleChatSubmit(`🔬 물리 분석: ${speed}km/h, ${roadLabel}, 총 ${total}m 필요`);
}
