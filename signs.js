const TRAFFIC_SIGNS = [
  {
    id: "stop",
    name: "일시정지 (STOP)",
    dangerLevel: "high",
    ocrText: "일시정지",
    description: "차량은 교차로나 횡단보도 직전에 반드시 일시 정지해야 합니다. 보행자 안전을 위해 가장 중요한 신호입니다.",
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Red Octagon -->
      <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#E53935" stroke="#FFFFFF" stroke-width="4"/>
      <!-- Inner White Octagon Border -->
      <polygon points="31,9 69,9 91,31 91,69 69,91 31,91 9,69 9,31" fill="none" stroke="#FFFFFF" stroke-width="2"/>
      <!-- Text -->
      <text x="50" y="47" font-family="'Inter', 'Noto Sans KR', sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.5">일시정지</text>
      <text x="50" y="68" font-family="'Inter', sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">STOP</text>
    </svg>`,
    translations: {
      en: {
        title: "STOP",
        meaning: "Complete Stop Required",
        instruction: "You must come to a complete stop before the crosswalk or intersection. Proceed only after checking for pedestrians and other vehicles.",
        penalty: "Violation carries a fine and penalty points."
      },
      lo: {
        title: "ຢຸດ (STOP)",
        meaning: "ຕ້ອງຢຸດລົດຢ່າງສົມບູນ",
        instruction: "ທ່ານຕ້ອງຢຸດລົດໃຫ້ສະໜິດກ່ອນທາງມ້າລາຍ ຫຼື ທາງແຍກ. ເດີນທາງຕໍ່ໄປໄດ້ຫຼັງຈາກກວດສອບຄວາມປອດໄພຂອງຄົນຍ່າງ ແລະ ຍານພາຫະນະອື່ນໆແລ້ວ.",
        penalty: "ການລະເມີດຈະຖືກປັບໃໝ ແລະ ຫັກຄະແນນໃບຂັບຂີ່."
      },
      zh: {
        title: "一时停止 (STOP)",
        meaning: "必须完全停车",
        instruction: "在交叉路口或人行横道前必须完全停车。确认行人和周围车辆安全后再行进。",
        penalty: "违反时将被处以罚款并扣分。"
      },
      ja: {
        title: "一時停止 (STOP)",
        meaning: "一時停止義務",
        instruction: "交差点や横断歩도の手前で必ず完全に停止してください。歩行者や他の車両의 안전을 확인한 후에 진행해 주세요.",
        penalty: "違反した場合は反칙금과 벌점이 부과됩니다."
      }
    }
  },
  {
    id: "no_entry",
    name: "진입금지 (No Entry)",
    dangerLevel: "high",
    ocrText: "진입금지",
    description: "어떠한 차량도 이 방향으로 진입할 수 없습니다. 주로 일방통행 도로의 출구나 역주행 위험 지역에 설치됩니다.",
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Red Circle -->
      <circle cx="50" cy="50" r="45" fill="#E53935" stroke="#FFFFFF" stroke-width="3"/>
      <!-- White Horizontal Bar -->
      <rect x="15" y="42" width="70" height="16" rx="2" fill="#FFFFFF"/>
      <!-- Text (Subtle context) -->
      <text x="50" y="80" font-family="'Inter', 'Noto Sans KR', sans-serif" font-weight="800" font-size="8" fill="#FFFFFF" text-anchor="middle" opacity="0.9">진입금지</text>
    </svg>`,
    translations: {
      en: {
        title: "No Entry",
        meaning: "Do Not Enter",
        instruction: "No vehicles are allowed to enter from this direction. Driving past this sign means you are going the wrong way, risking a head-on collision.",
        penalty: "Strictly prohibited. High fine and potential license suspension for reckless driving."
      },
      lo: {
        title: "ຫ້າມເຂົ້າ (No Entry)",
        meaning: "ຫ້າມຍານພາຫະນະເຂົ້າໃນທິດທາງນີ້",
        instruction: "ບໍ່ອະນຸຍາດໃຫ້ຍານພາຫະນະໃດໆເຂົ້າໄປໃນທິດທາງນີ້. ການຂັບຂີ່ຜ່ານປ້າຍນີ້ໝາຍຄວາມວ່າທ່ານກຳລັງຂັບຂີ່ທວນທາງ ເຊິ່ງອາດເກີดການຕຳກັນໂດຍກົງ.",
        penalty: "ຫ້າມຢ່າງເດັດຂາດ. ປັບໃໝສູງ ແລະ ອາດຖືກຍຶດໃບຂັບຂີ່."
      },
      zh: {
        title: "禁止驶入",
        meaning: "禁止车辆进入",
        instruction: "车辆不得从此方向驶入。这通常是单行道的出口，逆行极其危险。",
        penalty: "严厉禁止。处以高额罚款，逆行可导致扣分或吊销驾照。"
      },
      ja: {
        title: "进入禁止",
        meaning: "車両進入禁止",
        instruction: "この方向からは車両の進入ができません。通常、一方通行の出口に設置されており、逆走は正面衝突の危険があります。",
        penalty: "厳しく規制されています。高額な反則金と点数加算の対象になります。"
      }
    }
  },
  {
    id: "school_zone",
    name: "어린이 보호구역 (School Zone)",
    dangerLevel: "medium",
    ocrText: "어린이 보호구역",
    description: "초등학교 및 유치원 주변의 어린이 보호구역입니다. 제한속도는 시속 30km 이하이며, 사고 발생 시 처벌이 가중됩니다.",
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Yellow Diamond -->
      <polygon points="50,5 95,50 50,95 5,50" fill="#FFD600" stroke="#000000" stroke-width="4"/>
      <!-- Children Silhouette Icon -->
      <g fill="#000000">
        <!-- Tall Child -->
        <circle cx="42" cy="35" r="5.5"/>
        <path d="M42,42 C38,42 36,46 36,51 L36,65 C36,66.5 37.5,67 38.5,67 L39,67 L39,78 C39,79.5 41,79.5 41,78 L41,67.5 L43,67.5 L43,78 C43,79.5 45,79.5 45,78 L45,67 L45.5,67 C46.5,67 48,66.5 48,65 L48,51 C48,46 46,42 42,42 Z"/>
        <!-- Short Child -->
        <circle cx="58" cy="42" r="4.5"/>
        <path d="M58,48 C55,48 53,51 53,55 L53,66 C53,67 54,67.5 55,67.5 L55.5,67.5 L55.5,76 C55.5,77 57,77 57,76 L57,67.5 L59,67.5 L59,76 C59,77 60.5,77 60.5,76 L60.5,67.5 L61,67.5 C62,67.5 63,67 63,66 L63,55 C63,51 61,48 58,48 Z"/>
        <!-- Hand holding -->
        <path d="M47,53 Q50,55 54,55" stroke="#000000" stroke-width="1.5" fill="none"/>
      </g>
      <!-- School Zone Text Banner -->
      <rect x="25" y="8" width="50" height="9" rx="2.5" fill="#000000"/>
      <text x="50" y="15" font-family="'Inter', 'Noto Sans KR', sans-serif" font-weight="900" font-size="5" fill="#FFD600" text-anchor="middle">어린이보호구역</text>
    </svg>`,
    translations: {
      en: {
        title: "School Zone",
        meaning: "Child Protection Area",
        instruction: "Slow down immediately. The speed limit is restricted to 30 km/h or lower. Watch carefully for children stepping onto the road.",
        penalty: "Fines and penalties for traffic violations (speeding, parking) are doubled in this zone."
      },
      lo: {
        title: "เขตໂຮງຮຽນ (School Zone)",
        meaning: "ເຂດປ້ອງກັນເດັກນ້ອຍ",
        instruction: "ຫຼຸດຄວາມໄວລົງທັນທີ. ຈຳກັດຄວາມໄວຢູ່ທີ່ 30 ກມ/ຊມ ຫຼື ຕ່ຳກວ່າ. ກະລຸນາສັງເກດເດັກນ້ອຍຢ່າງລະມັດລະວັງ.",
        penalty: "ຄ່າປັບໃໝ ແລະ ການລົງໂທດສຳລັບການລະເມີດຈະຖືກເພີ່ມຂຶ້ນເປັນສອງເທົ່າໃນເຂດນີ້."
      },
      zh: {
        title: "儿童保护区",
        meaning: "学校区域 / 慢行",
        instruction: "请立即减速。限速30公里/小时以下。密切注意可能突然冲向马路的儿童。",
        penalty: "在此区域内违反交通规则（超速、违停等）的罚款 and 扣分将翻倍。"
      },
      ja: {
        title: "学童擁護区域",
        meaning: "スクールゾーン",
        instruction: "直ちに減速してください。制限速度は時速30km以下に制限されています。子供の飛び出しに厳重に注意してください。",
        penalty: "この区域내에서의 교통 위반(속도 초과, 불법 주차 등)은 과태료와 벌점이 2배 부과됩니다."
      }
    }
  },
  {
    id: "no_jaywalking",
    name: "무단횡단 금지 (No Jaywalking)",
    dangerLevel: "high",
    ocrText: "무단횡단 금지",
    description: "보행자가 횡단보도 외의 장소에서 도로를 건너는 것을 금지합니다. 대형 교통사고 발생률이 높은 위험 구역입니다.",
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- White Circle Base -->
      <circle cx="50" cy="50" r="45" fill="#FFFFFF" stroke="#E53935" stroke-width="6"/>
      <!-- Walking Pedestrian Silhouette -->
      <g fill="#000000">
        <!-- Head -->
        <circle cx="50" cy="27" r="5.5"/>
        <!-- Body & Limbs -->
        <path d="M47,35 L44,45 L38,50 A2,2 0 0,0 40,53 L46,48 L48,58 L41,72 A2,2 0 0,0 44,74 L51,60 L57,73 A2,2 0 0,0 60.5,71.5 L54.5,57 L57.5,44 L61.5,49 A2,2 0 0,0 64.5,46 L58.5,39 C56.5,36.5 53.5,35 50,35 H47 Z"/>
      </g>
      <!-- Diagonal Red Slash -->
      <line x1="18" y1="18" x2="82" y2="82" stroke="#E53935" stroke-width="8" stroke-linecap="round"/>
      <!-- Banner Text -->
      <rect x="20" y="80" width="60" height="12" rx="2" fill="#E53935"/>
      <text x="50" y="89" font-family="'Inter', 'Noto Sans KR', sans-serif" font-weight="900" font-size="7" fill="#FFFFFF" text-anchor="middle">무단횡단금지</text>
    </svg>`,
    translations: {
      en: {
        title: "No Jaywalking",
        meaning: "Pedestrian Crossing Prohibited",
        instruction: "Do not cross the street here. It is extremely dangerous due to fast-moving vehicle traffic. Please walk to the nearest designated crosswalk.",
        penalty: "Jaywalking is illegal and can lead to a fine if caught by police."
      },
      lo: {
        title: "ຫ້າມຂ້າມທາງຊະຊາຍ (No Jaywalking)",
        meaning: "ຫ້າມຄົນຍ່າງຂ້າມທາງບ່ອນນີ້",
        instruction: "ຫ້າມຂ້າມທາງຢູ່ບ່ອນນີ້ ເພາະເປັນອັນຕະລາຍຫຼາຍເນື່ອງຈາກລົດແລ່ນໄວ. ກະລຸນາໄປຂ້າມຢູ່ທາງມ້າລາຍທີ່ໃກ້ທີ່ສຸດ.",
        penalty: "ການຂ້າມທາງຊະຊາຍແມ່ນຜິດກົດໝາຍ ແລະ ອາດຖືກປັບໃໝໄດ້."
      },
      zh: {
        title: "禁止擅自横穿",
        meaning: "禁止乱穿马路",
        instruction: "禁止在此处横穿马路。由于车速较快，擅自横穿极易引发重大交通事故。请前往最近的人行横道。",
        penalty: "擅自横穿马路属违法行为，可能会被处以罚款。"
      },
      ja: {
        title: "乱横断禁止",
        meaning: "歩行者横断禁止",
        instruction: "ここでは道路を横断しないでください。走行する車両のスピードが速く非常に危険です。近くの横断歩道を利用してください。",
        penalty: "횡단 금지 구역에서의 무단 횡단은 불법이며, 적발 시 범칙금이 부과될 수 있습니다."
      }
    }
  },
  {
    id: "slow_down",
    name: "서행 (Slow Down)",
    dangerLevel: "low",
    ocrText: "서행",
    description: "자동차가 즉시 정지할 수 있는 느린 속도로 진행해야 합니다. 교차로 모퉁이나 시야가 확보되지 않는 도로에 설치됩니다.",
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Inverted Red Triangle -->
      <polygon points="50,92 5,12 95,12" fill="#FFFFFF" stroke="#E53935" stroke-width="6" stroke-linejoin="round"/>
      <!-- Inner text -->
      <text x="50" y="38" font-family="'Inter', 'Noto Sans KR', sans-serif" font-weight="900" font-size="14" fill="#000000" text-anchor="middle" letter-spacing="-0.5">서 행</text>
      <!-- Subtext (SLOW) -->
      <text x="50" y="55" font-family="'Inter', sans-serif" font-weight="800" font-size="10" fill="#000000" text-anchor="middle" letter-spacing="0.5">SLOW</text>
    </svg>`,
    translations: {
      en: {
        title: "Slow Down",
        meaning: "Drive at a Speed to Stop Immediately",
        instruction: "You must drive at a speed that allows you to stop the vehicle immediately in case of an emergency (typically under 20 km/h). Keep a close eye out for merging traffic.",
        penalty: "Crucial for preventing fender benders at intersections."
      },
      lo: {
        title: "ຂັບຊ້າໆ (Slow Down)",
        meaning: "ຜ່ອນຄວາມໄວໃຫ້ສາມາດຢຸດໄດ້ທັນທີ",
        instruction: "ທ່ານຕ້ອງຂັບຂີ່ດ້ວຍຄວາມໄວທີ່ສາມາດຢຸດລົດໄດ້ທັນທີໃນກໍລະນີສຸກເສີນ (ປົກກະຕິແມ່ນຕ່ຳກວ່າ 20 ກມ/ຊມ). ສັງເກດລົດອື່ນໆຢ່າງລະມັດລະວັງ.",
        penalty: "ມີຄວາມສຳຄັນຫຼາຍໃນການປ້ອງກັນອຸປະຕິເຫດຢູ່ທາງແຍກ."
      },
      zh: {
        title: "慢行 (SLOW)",
        meaning: "减速慢行",
        instruction: "必须以能让车辆立即停止的缓慢速度行驶（通常为时速20公里以下）。常设在视线受阻的急弯或交叉口。",
        penalty: "对于预防视线死角处的擦碰事故至关重要。"
      },
      ja: {
        title: "徐行 (SLOW)",
        meaning: "直ちに停止できる速度で進行",
        instruction: "車両が直ちに停止できる極めて遅い速度で走行してください（一般的に時速20km以下）。交差点の角や見通しの悪い道路で注意が必要です。",
        penalty: "교차로 모퉁이 등에서 충돌 사고를 방지하기 위해 필수적입니다."
      }
    }
  },
  {
    id: "no_bicycle",
    name: "자전거 통행금지 (No Bicycles)",
    dangerLevel: "medium",
    ocrText: "자전거 통행금지",
    description: "자전거 및 개인형 이동장치(킥보드 등)의 통행을 절대 금지하는 구간입니다. 고속 주행 도로나 자동차 전용 도로 등에 설치됩니다.",
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- White Circle with Red Border -->
      <circle cx="50" cy="50" r="45" fill="#FFFFFF" stroke="#E53935" stroke-width="6"/>
      <!-- Bicycle Icon -->
      <g stroke="#000000" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(18, 28) scale(0.65)">
        <!-- Wheels -->
        <circle cx="15" cy="45" r="12" />
        <circle cx="75" cy="45" r="12" />
        <!-- Frame -->
        <polygon points="15,45 45,45 60,20 30,20" />
        <line x1="45" y1="45" x2="30" y2="20" />
        <!-- Handle & Fork -->
        <line x1="75" y1="45" x2="60" y2="20" />
        <polyline points="50,15 60,20 65,12" />
        <!-- Seat -->
        <line x1="25" y1="12" x2="35" y2="12" />
        <line x1="30" y1="20" x2="30" y2="12" />
      </g>
      <!-- Diagonal Slash -->
      <line x1="18" y1="18" x2="82" y2="82" stroke="#E53935" stroke-width="8" stroke-linecap="round"/>
      <!-- Banner Text -->
      <rect x="15" y="80" width="70" height="12" rx="2" fill="#E53935"/>
      <text x="50" y="89" font-family="'Inter', 'Noto Sans KR', sans-serif" font-weight="900" font-size="6.5" fill="#FFFFFF" text-anchor="middle">자전거 통행금지</text>
    </svg>`,
    translations: {
      en: {
        title: "No Bicycles",
        meaning: "Bicycle / Scooter Access Denied",
        instruction: "Bicycles and personal mobility devices (like electric kickboards) are not allowed to pass here. This is typically an express road or motor highway.",
        penalty: "Violators on highways face fines and endanger their lives."
      },
      lo: {
        title: "ຫ້າມລົດຖີບຜ່ານ (No Bicycles)",
        meaning: "ຫ້າມລົດຖີບ ແລະ ລົດສະກູດເຕີເຂົ້າ",
        instruction: "ບໍ່ອະນຸຍາດໃຫ້ລົດຖີບ ແລະ ອຸປະກອນເຄື່ອນທີ່ສ່ວນຕົວ (ເຊັ່ນ: ສະກູດເຕີໄຟຟ້າ) ຜ່ານບ່ອນນີ້. ປົກກະຕິແມ່ນທາງດ່ວນທີ່ມີລົດແລ່ນໄວ.",
        penalty: "ຜູ້ລະເມີດຈະຖືກປັບໃໝ ແລະ ອາດເກີດອັນຕະລາຍເຖິງຊີວິດ."
      },
      zh: {
        title: "禁止自行车通行",
        meaning: "自行车及滑板车禁止驶入",
        instruction: "禁止自行车、电动滑板车等个人移动设备在此通行。此类路段通常为快速路或汽车专用道，车流速度极快。",
        penalty: "违规进入高速路段者将面临罚款，且有极高的人身安全风险。"
      },
      ja: {
        title: "自転車通行止め",
        meaning: "自転車・キックボード進入禁止",
        instruction: "自転車およびキックボードなどの個人用移動手段の通行は禁止されています。主に高速走行道路や自動車専用道路に設置されています。",
        penalty: "고속 주행 도로 등으로 진입하는 것은 불법이며, 단속 시 벌금이 부과될 수 있습니다."
      }
    }
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TRAFFIC_SIGNS };
}
