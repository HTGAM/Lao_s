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
      ko: {
        title: "일시정지",
        meaning: "완전 정지 필요",
        instruction: "횡단보도나 교차로 직전에 차량을 완전히 멈추어야 합니다. 보행자와 주변 차량을 확인한 후에만 주행을 재개하십시오.",
        penalty: "위반 시 범칙금 및 벌점이 부과됩니다.",
        weatherAdvice: "⚠️ 젖은 노면: 제동 거리가 2배로 증가합니다. 평소보다 일찍 정지하고 미끄러짐에 대비하십시오.",
        faq: {
          q1: "정지선에서 얼마나 멈춰 서 있어야 하나요?",
          a1: "안전을 위해 교차로 통과 전 완전히 차량 속도를 0 km/h로 줄이고 최소 3초간 정지하여 주위를 살핀 후 출발해야 합니다.",
          q2: "위반 시 벌금이 나오나요?",
          a2: "네, 승용차 기준 6만 원의 범칙금과 15점의 벌점이 부과됩니다.",
          q3: "주변에 차나 보행자가 없어도 멈춰야 하나요?",
          a3: "네, 시야에 보행자나 다른 차량이 전혀 보이지 않더라도 일시정지 표지판이 있으면 무조건 완전히 정지해야 합니다."
        }
      },
      en: {
        title: "STOP",
        meaning: "Complete Stop Required",
        instruction: "You must come to a complete stop before the crosswalk or intersection. Proceed only after checking for pedestrians and other vehicles.",
        penalty: "Violation carries a fine and penalty points.",
        weatherAdvice: "⚠️ WET ROAD: Braking distance is doubled. Stop early, inspect carefully, and verify tyre traction.",
        faq: {
          q1: "How long should I stop?",
          a1: "For safety, you should stop completely (0 km/h) for at least 3 seconds before proceeding.",
          q2: "Is there a fine?",
          a2: "Yes, violating this sign carries a fine of 60,000 KRW for passenger cars and 15 penalty points.",
          q3: "Does it apply if the road is empty?",
          a3: "Yes, you must come to a complete stop even if there are no other cars or pedestrians visible."
        }
      },
      lo: {
        title: "ຢຸດ",
        meaning: "ຕ້ອງຢຸດລົດຢ່າງສົມບູນ",
        instruction: "ທ່ານຕ້ອງຢຸດລົດໃຫ້ສະໜິດກ່ອນທາງມ້າລາຍ ຫຼື ທາງແຍກ. ເດີນທາງຕໍ່ໄປໄດ້ຫຼັງຈາກກວດສອບຄວາມປອດໄພຂອງຄົນຍ່າງ ແລະ ຍານພາຫະນະອື່ນໆແລ້ວ.",
        penalty: "ການລະເມີດຈະຖືກປັບໃໝ ແລະ ຫັກຄະແນນໃບຂັບຂີ່.",
        weatherAdvice: "⚠️ ເຕືອນທາງປຽກ: ໄລຍະເບກຈະເພີ່ມຂຶ້ນເປັນສອງເທົ່າ. ຢຸດລົດໄວຂຶ້ນ ແລະ ກວດສອບຄວາມປອດໄພ.",
        faq: {
          q1: "ຂ້ອຍຕ້ອງຢຸດດົນປານໃດ?",
          a1: "ແນະນຳໃຫ້ຢຸດລົດໃຫ້ສະໜິດ (0 ກມ/ຊມ) ຢ່າງໜ້ອຍ 3 ວິນາທີ ເພື່ອກວດສອບທຸກທິດທາງຢ່າງລະອຽດ.",
          q2: "ຄ່າປັບໃໝເທົ່າໃດ?",
          a2: "ລົດທົ່ວໄປຈະຖືກປັບໃໝ 60,000 ວອນ ແລະ ຫັກຄະແນນໃບຂັບຂີ່ 15 ຄະແນນ.",
          q3: "ຖ້າບໍ່ມີຄົນຍ່າງເດ?",
          a3: "ທ່ານຍັງຕ້ອງຢຸດລົດຢ່າງສົມບູນ ເຖິງແມ່ນວ່າຈະບໍ່ມີຄົນຍ່າງ ຫຼື ລົດຄັນອື່ນກໍຕາມ."
        }
      },
      zh: {
        title: "一时停止",
        meaning: "必须完全停车",
        instruction: "在交叉路口或人行横道前必须完全停车。确认行人和周围车辆安全后再行进。",
        penalty: "违反时将被处以罚款并扣分。",
        weatherAdvice: "⚠️ 湿滑路面：刹车距离翻倍。请提前停车并仔细观察路况。",
        faq: {
          q1: "我需要完全停下多久？",
          a1: "为了安全起见，建议完全停车（车速为0）至少3秒后再继续行驶。",
          q2: "罚款金额是多少？",
          a2: "普通客车处以60,000韩元罚款，并扣除15分驾照分数。",
          q3: "没有车辆和行人也必须停车吗？",
          a3: "是的，即使视线范围内没有车辆或行人，也必须遵守一时停止规定。"
        }
      },
      ja: {
        title: "一時停止",
        meaning: "一時停止義務",
        instruction: "交差点や横断歩道の手前で必ず完全に停止してください。歩行者や他の車両의 안전을 확인한 후에 진행하십시오.",
        penalty: "違反した場合は反則金と罰点が科されます。",
        weatherAdvice: "⚠️ 湿潤路面：制動距離が2倍になります。通常より手前で完全に停止してください。",
        faq: {
          q1: "何秒間停止すればいいですか？",
          a1: "安全確認のため、完全に車速を0にしてから3秒以上停止することをお勧めします。",
          q2: "反則金はいくらですか？",
          a2: "普通車で6,000円（60,000 KRW）の反則金と、15点の大幅な点数加算となります。",
          q3: "誰もいなくても止まる必要がありますか？",
          a3: "はい、歩行者や他の車がいなくても一時停止線手前での完全停止が必要です。"
        }
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
      ko: {
        title: "진입금지",
        meaning: "어떤 차량도 진입할 수 없음",
        instruction: "이 방향으로는 차량이 진입할 수 없습니다. 진입 시 일방통행 역주행이 되어 정면 충돌의 위험이 매우 큽니다.",
        penalty: "절대 금지 구역입니다. 높은 범칙금 부과 및 사고 시 과실 비율이 100% 적용될 수 있습니다.",
        weatherAdvice: "⚠️ 야간 및 우천: 시야가 매우 좁아져 진입금지 안내를 놓치기 쉽습니다. 도로 노면 표시와 표지판을 주의 깊게 살피십시오.",
        faq: {
          q1: "이곳 진입이 왜 금지되나요?",
          a1: "일방통행 도로의 출구이거나 고속도로 진입 램프의 반대 방향이기 때문에 정면 충돌 사고를 예방하기 위함입니다.",
          q2: "위반 시 어떤 불이익이 있나요?",
          a2: "지시위반으로 승용차 기준 6만 원의 범칙금이 부과되며, 사고 발생 시 가해자로서 민형사상 엄중한 책임을 집니다.",
          q3: "실수로 진입한 경우 어떻게 해야 하나요?",
          a3: "즉시 정차 후 비상등을 켜고, 뒤에서 오는 차량이 없는 안전한 상태를 확인하면서 천천히 후진하여 빠져나와야 합니다."
        }
      },
      en: {
        title: "No Entry",
        meaning: "Do Not Enter",
        instruction: "No vehicles are allowed to enter from this direction. Driving past this sign means you are going the wrong way, risking a head-on collision.",
        penalty: "Strictly prohibited. High fine and potential license suspension.",
        weatherAdvice: "⚠️ WET & DARK: Head-on visibility is extremely low. Check road signs carefully to avoid accidental reverse entry.",
        faq: {
          q1: "Why is entry banned here?",
          a1: "This is usually the exit of a one-way street or a highway ramp. Entering will lead to an extremely dangerous head-on collision.",
          q2: "What is the penalty?",
          a2: "Violators face a fine of 60,000 KRW, and will carry 100% fault/liability in case of an accident.",
          q3: "What if I entered by mistake?",
          a3: "Stop immediately, turn on your hazard lights, and back out safely when clear, or call emergency service for assistance."
        }
      },
      lo: {
        title: "ຫ້າມເຂົ້າ",
        meaning: "ຫ້າມຍານພາຫະນະເຂົ້າໃນທິດທາງນີ້",
        instruction: "ບໍ່ອະນຸຍາດໃຫ້ຍານພາຫະນະໃດໆເຂົ້າໄປໃນທິດທາງນີ້. ການຂັບຂີ່ຜ່ານປ້າຍນີ້ໝາຍຄວາມວ່າທ່ານກຳລັງຂັບຂີ່ທວນທາງ ເຊິ່ງອາດເກີດການຕຳກັນໂດຍກົງ.",
        penalty: "ຫ້າມຢ່າງເດັດຂາດ. ປັບໃໝສູງ ແລະ ອາດຖືກຍຶດໃບຂັບຂີ່.",
        weatherAdvice: "⚠️ ທາງປຽກ ແລະ ມືດ: ວິໄສທັດຈະຫຼຸດລົງຫຼາຍ. ກວດສອບປ້າຍຈະລາຈອນຢ່າງລະອຽດເພື່ອບໍ່ໃຫ້ຫຼົງເຂົ້າທາງຜິດ.",
        faq: {
          q1: "ເປັນຫຍັງຈຶ່ງຫ້າມເຂົ້າບ່ອນນີ້?",
          a1: "ບ່ອນນີ້ແມ່ນທາງອອກຂອງທາງດຽວ (One-way) ຫຼື ທາງຂຶ້ນທາງດ່ວນ. ການເຂົ້າໄປຈະເຮັດໃຫ້ຕຳກັນກັບລົດທີ່ແລ່ນສວນມາ.",
          q2: "ຄ່າປັບໃໝເທົ່າໃດ?",
          a2: "ຈະຖືກປັບໃໝ 60,000 ວອນ ແລະ ຕ້ອງຮັບຜິດຊອບ 100% ຫາກເກີດອຸປະຕິເຫດ.",
          q3: "ຖ້າຫຼົງເຂົ້າໄປໂດຍບໍ່ໄດ້ຕັ້ງໃຈເດ?",
          a3: "ຢຸດລົດທັນທີ, ເປີດໄຟສຸກເສີນ, ແລະ ຖອຍລົດອອກມາຢ່າງປອດໄພເມື່ອທາງວ່າງ."
        }
      },
      zh: {
        title: "禁止驶入",
        meaning: "禁止车辆进入",
        instruction: "车辆不得从此方向驶入。这通常是单行道的出口，逆行极其危险。",
        penalty: "严厉禁止。处以高额罚款，逆行可导致扣分或吊销驾照。",
        weatherAdvice: "⚠️ 雨夜视线模糊：逆行事故风险倍增。请务必看清地面指示标线与立牌标志。",
        faq: {
          q1: "为什么这里禁止驶入？",
          a1: "此处为单行道出口或高速公路匝道出口，驶入将导致逆行，极易引发严重对撞事故。",
          q2: "违反此规定如何处罚？",
          a2: "罚款60,000韩元，且在逆行引发的事故中需承担全部法律责任。",
          q3: "不小心驶入该怎么办？",
          a3: "请立即停车，开启双闪警示灯，在确保后方安全的前提下迅速倒车驶离。"
        }
      },
      ja: {
        title: "进入禁止",
        meaning: "車両進入禁止",
        instruction: "この方向からは車両の進入ができません。通常、一方通行の出口に設置されており、逆走は正面衝突の危険があります。",
        penalty: "厳しく規制されています。高額な反則金と点数加算の対象になります。",
        weatherAdvice: "⚠️ 雨天・夜間：視界不良による逆走進入が多発します。標識および道路標示を慎重に確認してください。",
        faq: {
          q1: "なぜ進入禁止なのですか？",
          a1: "一方向道路の出口、または有料道路の出口ランプです。進入すると逆走状態になり重大事故に直結します。",
          q2: "罰則はどのようなものですか？",
          a2: "普通車で6,000円（60,000 KRW）の反則金が科され、事故発生時の過失割合は100%となります。",
          q3: "誤って進入した場合は？",
          a3: "直ちに停車してハザードランプを点滅させ、後方の安全を十分に確認しながらバックで退出してください。"
        }
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
      ko: {
        title: "어린이 보호구역",
        meaning: "아동 특별 보호 구역",
        instruction: "즉시 감속하십시오. 제한 속도는 시속 30km 이하로 엄격히 제한됩니다. 어린이가 도로로 튀어나올 수 있으므로 주의 깊게 운전하십시오.",
        penalty: "이 구역 내 교통 법규 위반 시 과태료 및 벌점이 일반 도로의 2배로 가중 부과됩니다.",
        weatherAdvice: "⚠️ 비 오는 날: 어린이가 우산을 써 시야가 차단될 수 있습니다. 시속 20km 이하로 서행하고 연석 근처를 주의 깊게 확인하십시오.",
        faq: {
          q1: "제한 속도는 얼마인가요?",
          a1: "어린이 보호구역 내 제한 속도는 24시간 내내 시속 30km 이하입니다.",
          q2: "위반 시 처벌이 어떻게 다른가요?",
          a2: "오전 8시부터 오후 8시 사이에 속도위반, 신호위반, 주정차 위반 시 범칙금과 벌점이 일반 도로의 2배로 가중 처벌됩니다.",
          q3: "사고가 발생하면 어떻게 되나요?",
          a3: "일명 민식법에 의해 어린이 보호구역 내에서 상해 사고 유발 시 최소 1년 이상의 징역 또는 벌금형에 처해지는 가중 처벌이 적용됩니다."
        }
      },
      en: {
        title: "School Zone",
        meaning: "Child Protection Area",
        instruction: "Slow down immediately. The speed limit is restricted to 30 km/h or lower. Watch carefully for children stepping onto the road.",
        penalty: "Fines and penalties for traffic violations are doubled in this zone.",
        weatherAdvice: "⚠️ WET CONDITIONS: Children may carry umbrellas blocking their view. Reduce speed to 20 km/h and watch curbs closely.",
        faq: {
          q1: "What is the speed limit?",
          a1: "The speed limit is strictly 30 km/h or lower, 24 hours a day.",
          q2: "How are penalties different?",
          a2: "Fines, penalty points, and insurance premiums are doubled for violations committed here between 8 AM and 8 PM.",
          q3: "What happens if an accident occurs?",
          a3: "Under Korean law (Min-sik Law), injuring a child in a school zone carries a minimum penalty of 1 year in prison or a heavy fine."
        }
      },
      lo: {
        title: "ເຂດປ້ອງກັນເດັກ",
        meaning: "ເຂດປ້ອງກັນເດັກນ້ອຍ",
        instruction: "ຫຼຸດຄວາມໄວລົງທັນທີ. ຈຳກັດຄວາມໄວຢູ່ທີ່ 30 ກມ/ຊມ ຫຼື ຕ່ຳກວ່າ. ກະລຸນາສັງເກດເດັກນ້ອຍຢ່າງລະມັດລະວັງ.",
        penalty: "ຄ່າປັບໃໝ ແລະ ການລົງໂທດສຳລັບການລະເມີດຈະຖືກເພີ່ມຂຶ້ນເປັນສອງເທົ່າໃນເຂດນີ້.",
        weatherAdvice: "⚠️ ທາງປຽກ: ເດັກນ້ອຍອາດຈະຖືຄັນຮົ່ມບັງສາຍຕາ. ຫຼຸດຄວາມໄວລົງເຫຼືອ 20 ກມ/ຊມ ແລະ ສັງເກດຂ້າງທາງຢ່າງລະອຽດ.",
        faq: {
          q1: "ຈຳກັດຄວາມໄວເທົ່າໃດ?",
          a1: "ຈຳກັດຄວາມໄວຢ່າງເຂັ້ມງວດຢູ່ທີ່ 30 ກມ/ຊມ ຫຼື ຕ່ຳກວ່າ ຕະຫຼອດ 24 ຊົ່ວໂມງ.",
          q2: "ໂທດປັບໃໝຕ່າງຈາກບ່ອນອື່ນແນວໃດ?",
          a2: "ຄ່າປັບໃໝ ແລະ ຄະແນນໃບຂັບຂີ່ຈະຖືກເພີ່ມຂຶ້ນເປັນ 2 ເທົ່າ ສຳລັບການລະເມີດໃນລະຫວ່າງເວລາ 8:00 ຫາ 20:00 ໂມງ.",
          q3: "ຫາກເກີດອຸປະຕິເຫດຕຳເດັກນ້ອຍຈະເປັນແນວໃດ?",
          a3: "ພາຍໃຕ້ກົດໝາຍເກົາຫຼີ, ການເຮັດໃຫ້ເດັກນ້ອຍບາດເຈັບໃນເຂດນີ້ມີໂທດຈຳຄຸກຢ່າງໜ້ອຍ 1 ປີ ຫຼື ປັບໃໝສູງຫຼາຍ."
        }
      },
      zh: {
        title: "儿童保护区",
        meaning: "学校区域 / 慢行",
        instruction: "请立即减速。限速30公里/小时以下。密切注意可能突然冲向马路的儿童。",
        penalty: "在此区域内违反交通规则（超速、违停等）的罚款和扣分将翻倍。",
        weatherAdvice: "⚠️ 雨天视线受阻：儿童撑伞易遮挡视线。请降速至20km/h以下，提防突然出现的学童。",
        faq: {
          q1: "限速是多少公里？",
          a1: "本区域全天24小时严格限速30公里/小时以下。",
          q2: "违章处罚如何翻倍？",
          a2: "在早8点至晚8点之间发生超速、违停等行为，罚款及扣分均按普通路段的双倍执行。",
          q3: "如果在该区域撞伤儿童会怎样？",
          a3: "根据韩国法律（民植法），在儿童保护区内撞伤儿童将被判处1年以上有期徒刑，性质非常严重。"
        }
      },
      ja: {
        title: "学童擁護区域",
        meaning: "スクールゾーン",
        instruction: "直ちに減速してください。制限速度は時速30km以下に制限されています。子供の飛び出し에 엄중히 주의하십시오.",
        penalty: "この区域内での交通違反（速度超過、違法駐車など）は、過料と罰点が2倍科されます。",
        weatherAdvice: "⚠️ 雨天時の注意：子供たちが傘で視界を遮られている場合があります。時速20km以下に減速し、歩道の動きを注視してください。",
        faq: {
          q1: "制限速度はいくらですか？",
          a1: "24時間いつでも時速30km以下に厳しく制限されています。",
          q2: "罰則はどのように異なりますか？",
          a2: "午前8時から午後8時の間の違反は、罰金と減点点数が通常の2倍になります。",
          q3: "人身事故を起こした場合は？",
          a3: "韓国の法律（ミンシク法）により、学童区域内で子供に怪我をさせた場合、1年以上の懲役または重い罰金刑が科されます。"
        }
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
      ko: {
        title: "무단횡단 금지",
        meaning: "보행자 횡단 절대 금지",
        instruction: "이 도로를 걸어서 건너지 마십시오. 차량 주행 속도가 빨라 정지하기 힘듭니다. 반드시 근처의 인근 횡단보도를 이용하십시오.",
        penalty: "무단횡단은 범법 행위이며 경찰에 단속될 시 과태료가 부과됩니다.",
        weatherAdvice: "⚠️ 빗길 및 야간: 운전자가 비 속에서 제동하는 데 시간이 오래 걸립니다. 이곳을 건너는 것은 매우 위험하므로 무단횡단은 절대 피하십시오.",
        faq: {
          q1: "차가 전혀 없을 때도 건너면 안 되나요?",
          a1: "네, 안 됩니다. 무단횡단은 불법이며 도로가 넓고 주행 차들의 속도가 빨라 예측하지 못한 순간에 큰 사고로 이어질 수 있습니다.",
          q2: "보행자에게도 벌금이 부과되나요?",
          a2: "네, 무단횡단 시 경찰 단속이나 신고를 통해 2만 원에서 3만 원의 범칙금이 보행자에게 부과될 수 있습니다.",
          q3: "횡단보도는 주로 어디에 있나요?",
          a3: "좌우를 둘러보시면 대개 100~200미터 이내에 횡단보도나 육교, 지하보도가 위치해 있습니다."
        }
      },
      en: {
        title: "No Jaywalking",
        meaning: "Pedestrian Crossing Prohibited",
        instruction: "Do not cross the street here. It is extremely dangerous due to fast-moving vehicle traffic. Please walk to the nearest designated crosswalk.",
        penalty: "Jaywalking is illegal and can lead to a fine if caught by police.",
        weatherAdvice: "⚠️ WET ROADS & NIGHT: Drivers cannot stop quickly in the rain. Crossing here is suicide. Never cross outside crosswalks.",
        faq: {
          q1: "Can I cross if there are no cars?",
          a1: "No. Jaywalking is strictly illegal and dangerous. Korea has high vehicle speeds on main roads.",
          q2: "Is there a fine for pedestrians?",
          a2: "Yes, jaywalkers face an on-the-spot fine of 20,000 to 30,000 KRW by police.",
          q3: "Where is the nearest crosswalk?",
          a3: "Look left and right. In Korea, crosswalks or underpasses are typically located within 100-200 meters."
        }
      },
      lo: {
        title: "ຫ້າມຂ້າມທາງຊະຊາຍ",
        meaning: "ຫ້າມຄົນຍ່າງຂ້າມທາງບ່ອນນີ້",
        instruction: "ຫ້າມຂ້າມທາງຢູ່ບ່ອນນີ້ ເພາະເປັນອັນຕະລາຍຫຼາຍເນື່ອງຈາກລົດແລ່ນໄວ. ກະລຸນາໄປຂ້າມຢູ່ທາງມ້າລາຍທີ່ໃກ້ທີ່ສຸດ.",
        penalty: "ການຂ້າມທາງຊະຊາຍແມ່ນຜິດກົດໝາຍ ແລະ ອາດຖືກປັບໃໝໄດ້.",
        weatherAdvice: "⚠️ ທາງປຽກ ແລະ ມືດ: ລົດບໍ່ສາມາດເບກໄດ້ທັນທີໃນເວລາຝົນຕົກ. ຫ້າມຂ້າມທາງບ່ອນນີ້ເດັດຂາດ.",
        faq: {
          q1: "ຂ້ອຍຂ້າມໄດ້ບໍ່ຖ້າບໍ່ມີລົດ?",
          a1: "ບໍ່ໄດ້. ການຂ້າມທາງຊະຊາຍແມ່ນຜິດກົດໝາຍ ແລະ ອັນຕະລາຍຫຼາຍ ເພາະລົດໃນເກົາຫຼີແລ່ນໄວຫຼາຍ.",
          q2: "ມີໂທດປັບໃໝສຳລັບຄົນຍ່າງບໍ່?",
          a2: "ມີ, ຄົນຍ່າງທີ່ຂ້າມທາງຊະຊາຍຈະຖືກປັບໃໝ 20,000 ຫາ 30,000 ວອນ ໂດຍເຈົ້າໜ້າທີ່ຕຳຫຼວດ.",
          q3: "ທາງມ້າລາຍທີ່ໃກ້ທີ່ສຸດຢູ່ໃສ?",
          a3: "ກວດເບິ່ງຊ້າຍ ແລະ ຂວາ. ໂດຍທົ່ວໄປ ທາງມ້າລາຍ ຫຼື ອຸໂມງຂ້າມທາງຈະຢູ່ຫ່າງອອກໄປປະມານ 100-200 ແມັດ."
        }
      },
      zh: {
        title: "禁止擅自横穿",
        meaning: "禁止乱穿马路",
        instruction: "禁止在此处横穿马路。由于车速较快，擅自横穿极易引发重大交通事故。请前往最近的人行横道。",
        penalty: "擅自横穿马路属违法行为，可能会被处以罚款。",
        weatherAdvice: "⚠️ 雨夜路滑：雨天车辆制动距离长，且夜间盲区多。在此横穿无异于自杀，请务必使用过街天桥或人行道。",
        faq: {
          q1: "没有车辆通过时可以横穿吗？",
          a1: "绝对不行。擅自横穿马路是违法且极其危险的，韩国主干道车速极快。",
          q2: "行人会被罚款吗？",
          a2: "是的，被警察发现或被行车记录仪举报将面临20,000至30,000韩元的罚款。",
          q3: "人行横道一般在哪里？",
          a3: "左右环顾。在韩国，人行横道或地下通道通常分布在100至200米以内。"
        }
      },
      ja: {
        title: "歩行者横断禁止",
        meaning: "歩行者横断禁止",
        instruction: "ここでは道路を横断しないでください。走行する車両のスピードが速く非常に危険です。近くの横断歩道を利用してください。",
        penalty: "歩行者横断禁止区域での無断横断は違法であり、摘発時に反則金が科されることがあります。",
        weatherAdvice: "⚠️ 雨天・夜間の危険：雨の日は車の制動距離が著しく伸び、夜間は歩行者が見えにくくなります。必ず歩道橋や横断歩道を利用してください。",
        faq: {
          q1: "車が来ていなければ渡ってもいいですか？",
          a1: "いいえ。歩行者横断禁止区域の横断は事故時の過失も大きく取られ、大変危険な違法行為です。",
          q2: "歩行者も罰金を取られますか？",
          a2: "はい、取り締まりの対象となり、20,000〜30,000 KRWの反則金が科されます。",
          q3: "近くの横断歩道はどこにありますか？",
          a3: "左右を確認してください。通常100〜200m以内に横断歩道、または地下道や歩道橋が設置されています。"
        }
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
      ko: {
        title: "서행",
        meaning: "즉시 정차 가능한 속도로 진행",
        instruction: "돌발 상황 시 차량을 즉시 멈출 수 있는 느린 속도로 운행하십시오 (일반적으로 시속 20km 이하). 주변 시야 확인과 양보 운전이 필요합니다.",
        penalty: "교차로 모퉁이 등 시야 사각지대에서의 사고 예방을 위해 필수적입니다.",
        weatherAdvice: "⚠️ 미끄러운 곡선: 빗길에는 제어력이 크게 저하됩니다. 시속 10km 이하로 줄이고 브레이크 페달에 발을 가볍게 올려두십시오.",
        faq: {
          q1: "서행이란 구체적으로 몇 km/h인가요?",
          a1: "한국의 도로교통법상 서행은 운전자가 브레이크를 밟았을 때 1미터 이내에 완전히 정차할 수 있는 속도로, 보통 시속 20km 이하를 의미합니다.",
          q2: "이 표지판은 보통 어디에 설치되나요?",
          a2: "신호등이 없는 교차로, 좁은 골목길 어귀, 급격한 굽은 도로 등 시야가 잘 확보되지 않는 위험 구간에 주로 설치됩니다.",
          q3: "일시정지와의 차이점은 무엇인가요?",
          a3: "일시정지는 무조건 바퀴를 완전히 멈춰 서야(0 km/h) 하지만, 서행은 안전이 확보되었다면 서서히 서서히 굴러가며 진행해도 무방합니다."
        }
      },
      en: {
        title: "Slow Down",
        meaning: "Drive at a Speed to Stop Immediately",
        instruction: "You must drive at a speed that allows you to stop the vehicle immediately in case of an emergency (typically under 20 km/h). Keep a close eye out for merging traffic.",
        penalty: "Crucial for preventing accidents at intersections.",
        weatherAdvice: "⚠️ SLIPPERY CURVES: Visibility is poor on rainy days. Reduce speed to 10 km/h and cover the brake pedal.",
        faq: {
          q1: "What speed is 'Slow Down'?",
          a1: "Under Korean rules, it means driving slowly enough to bring the car to a full stop within 1 meter (usually under 20 km/h, sometimes under 10 km/h).",
          q2: "Where are these signs located?",
          a2: "Usually at narrow road corners, blind intersections, and sharp turns where visibility is poor.",
          q3: "How is it different from 'STOP'?",
          a3: "STOP requires a complete 0 km/h halt regardless of traffic. SLOW DOWN allows you to keep moving slowly as long as it's safe."
        }
      },
      lo: {
        title: "ຂັບຊ້າໆ",
        meaning: "ຜ່ອນຄວາມໄວໃຫ້ສາມາດຢຸດໄດ້ທັນທີ",
        instruction: "ທ່ານຕ້ອງຂັບຂີ່ດ້ວຍຄວາມໄວທີ່ສາມາດຢຸດລົດໄດ້ທັນທີໃນກໍລະນີສຸກເສີນ (ປົກກະຕິແມ່ນຕ່ຳກວ່າ 20 ກມ/ຊມ). ສັງເກດລົດອື່ນໆຢ່າງລະມັດລະວັງ.",
        penalty: "ມີຄວາມສຳຄັນຫຼາຍໃນການປ້ອງກັນອຸປະຕິເຫດຢູ່ທາງແຍກ.",
        weatherAdvice: "⚠️ ທາງໂຄ້ງມື່ນ: ວິໄສທັດຈະຫຼຸດລົງໃນມື້ຝົນຕົກ. ຫຼຸດຄວາມໄວລົງເຫຼືອ 10 ກມ/ຊມ ແລະ ກຽມເບກລົດໄວ້.",
        faq: {
          q1: "ຄວາມໄວ 'ຂັບຊ້າໆ' ແມ່ນເທົ່າໃດ?",
          a1: "ພາຍໃຕ້ກົດລະບຽບເກົາຫຼີ, ມັນໝາຍເຖິງການຂັບຂີ່ດ້ວຍຄວາມໄວທີ່ສາມາດຢຸດລົດໄດ້ທັນທີພາຍໃນ 1 ແມັດ (ປົກກະຕິຕ່ຳກວ່າ 20 ກມ/ຊມ).",
          q2: "ປ້າຍເຫຼົ່ານີ້ມັກຕັ້ງຢູ່ໃສ?",
          a2: "ໂດຍທົ່ວໄປແມ່ນຢູ່ທາງໂຄ້ງແຄບ, ທາງແຍກທີ່ເບິ່ງບໍ່ເຫັນດີ, ແລະ ທາງຄົດງໍ.",
          q3: "ມັນຕ່າງຈາກປ້າຍ 'ຢຸດ' ແນວໃດ?",
          a3: "ປ້າຍ 'ຢຸດ' ບັງຄັບໃຫ້ຢຸດ 0 ກມ/ຊມ ສະເໝີ. ສ່ວນ 'ຂັບຊ້າໆ' ແມ່ນສາມາດເຄື່ອນທີ່ໄປຊ້າໆໄດ້ຖ້າປອດໄພ."
        }
      },
      zh: {
        title: "慢行",
        meaning: "减速慢行",
        instruction: "必须以能让车辆立即停止的缓慢速度行驶（通常为时速20公里以下）。常设在视线受阻的急弯或交叉口。",
        penalty: "对于预防视线死角处的擦碰事故至关重要。",
        weatherAdvice: "⚠️ 弯道湿滑：雨天视线极差，转弯易打滑。请减速至10km/h以下，并随时做好刹车准备。",
        faq: {
          q1: "“慢行”的具体车速是多少？",
          a1: "法律规定为“一旦踩刹车就能在1米内彻底停稳的速度”，通常指时速20公里以下（极度危险路段为10公里以下）。",
          q2: "这种标志一般设在什么地方？",
          a2: "多设在视线不良的无信号灯交叉路口、急弯路口或狭窄巷道出口。",
          q3: "它和“一时停止(STOP)”有什么区别？",
          a3: "一时停止要求无论有无车辆都必须彻底停稳。慢行则允许在确认安全的前提下以极慢速度滑行通过。"
        }
      },
      ja: {
        title: "徐行",
        meaning: "直ちに停止できる速度で進行",
        instruction: "車両が直ちに停止できる極めて遅い速度で走行してください（一般的に時速20km以下）。交差点の角や見通しの悪い道路で注意が必要です。",
        penalty: "交差点の角などでの衝突事故を防止するために極めて重要です。",
        weatherAdvice: "⚠️ スリップ注意：雨の日は急なハンドル操作でスリップしやすいです。時速10km以下に落とし、いつでもブレーキを踏める状態で走行してください。",
        faq: {
          q1: "徐行の具体的な速度はどれくらいですか？",
          a1: "道路交通法上は「ブレーキを踏んでから1m以内で停止できる速度」とされ、おおむね時速20km以下（見通しの悪い場所では10km以下）を指します。",
          q2: "どこに設置されますか？",
          a2: "信号のない見通しの悪い交差点、狭い道路の曲がり角、下り坂の急勾配などに設置されます。",
          q3: "一時停止との違いは何ですか？",
          a3: "一時停止は必ず速度を0にして完全に止まる必要がありますが、徐行は安全が確認できていれば、いつでも止まれる極低速で動き続けても構いません。"
        }
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
      ko: {
        title: "자전거 통행금지",
        meaning: "자전거 및 전동킥보드 등 진입 금지",
        instruction: "자전거, 킥보드, 전동 휠 등의 개인형 이동장치 통행이 금지된 도로입니다. 주로 고속주행 도로나 자동차 전용도로 등에 적용됩니다.",
        penalty: "위반 시 범칙금이 부과되며, 빠른 속도로 달리는 자동차 사이에서 목숨을 잃을 위험이 매우 높습니다.",
        weatherAdvice: "⚠️ 빗길 슬립: 비가 오거나 바람이 불 때 이륜차의 슬립 사고 발생률이 급증합니다. 전용도로 진입은 물론이고 인근 보도 주행 시에도 속도를 대폭 줄이십시오.",
        faq: {
          q1: "전동 킥보드도 통행이 금지되나요?",
          a1: "네, 전동 킥보드를 포함한 모든 개인형 이동장치(PMD) 및 자전거가 통행금지 대상에 포함됩니다.",
          q2: "이 도로는 왜 금지되나요?",
          a2: "평균 시속 70~80km 이상으로 차량이 질주하는 자동차 전용도로 또는 위험 교량 구간이기 때문에 자전거 진입을 법으로 금지하고 있습니다.",
          q3: "범칙금은 얼마인가요?",
          a3: "자전거는 1만 원, 전동킥보드는 3만 원의 범칙금이 경찰 단속 시 부과됩니다."
        }
      },
      en: {
        title: "No Bicycles",
        meaning: "Bicycle / Scooter Access Denied",
        instruction: "Bicycles and personal mobility devices (like electric kickboards) are not allowed to pass here. This is typically an express road or motor highway.",
        penalty: "Violators face fines and endanger their lives.",
        weatherAdvice: "⚠️ SLIPPERY SURFACE: Bicycle safety is compromised during rainy/windy weather. Do not ride on adjacent high-risk roads.",
        faq: {
          q1: "Are electric scooters banned too?",
          a1: "Yes, all personal mobility devices (PMDs) including electric kickboards and scooters are strictly prohibited.",
          q2: "Why is it banned?",
          a2: "This road is designed for high-speed motor vehicles (expressways/car-only roads). Riding here creates a critical hazard.",
          q3: "What is the fine amount?",
          a3: "Bicycles face a 10,000 KRW fine, while electric kickboard riders face a 30,000 KRW fine if caught on auto-only lanes."
        }
      },
      lo: {
        title: "ຫ້າມລົດຖີບຜ່ານ",
        meaning: "ຫ້າມລົດຖີບ ແລະ ລົດສະກູດເຕີເຂົ້າ",
        instruction: "ບໍ່ອະນຸຍາດໃຫ້ລົດຖີບ ແລະ ອຸປະກອນເຄື່ອນທີ່ສ່ວນຕົວ (ເຊັ່ນ: ສະກູດເຕີໄຟຟ້າ) ຜ່ານບ່ອນນີ້. ປົກກະຕິແມ່ນທາງດ່ວນທີ່ມີລົດແລ່ນໄວ.",
        penalty: "ຜູ້ລະເມີດຈະຖືກປັບໃໝ ແລະ ອາດເກີດອັນຕະລາຍເຖິງຊີວິດ.",
        weatherAdvice: "⚠️ ທາງປຽກ: ຄວາມປອດໄພຂອງລົດຖີບຈະຫຼຸດລົງຫຼາຍໃນເວລາຝົນຕົກ. ຫ້າມຂັບຂີ່ລົດຖີບ ຫຼື ສະກູດເຕີໃກ້ທາງດ່ວນ.",
        faq: {
          q1: "ລົດສະກູດເຕີໄຟຟ້າຖືກຫ້າມນຳບໍ່?",
          a1: "ແມ່ນແລ້ວ, ອຸປະກອນເຄື່ອນທີ່ສ່ວນຕົວທຸກຊະນິດ ລວມທັງສະກູດເຕີໄຟຟ້າແມ່ນຖືກຫ້າມຢ່າງເດັດຂາດ.",
          q2: "ເປັນຫຍັງຈຶ່ງຫ້າມ?",
          a2: "ເນື່ອງຈາກທາງນີ້ເປັນທາງດ່ວນ ຫຼື ທາງສະເພາະລົດໃຫຍ່ ທີ່ມີຄວາມໄວສູງ. ຂັບຂີ່ລົດຖີບຈະເປັນອັນຕະລາຍຫຼາຍ.",
          q3: "ຄ່າປັບໃໝເທົ່າໃດ?",
          a3: "ລົດຖີບຈະຖືກປັບໃໝ 10,000 ວອນ, ສ່ວນສະກູດເຕີໄຟຟ້າຈະຖືກປັບໃໝ 30,000 ວອນ ຫາກຝ່າຝືນເຂົ້າທາງສະເພາະລົດໃຫຍ່."
        }
      },
      zh: {
        title: "禁止自行车通行",
        meaning: "自行车及滑板车禁止驶入",
        instruction: "禁止自行车、电动滑板车等个人移动设备在此通行。此类路段通常为快速路或汽车专用道，车流速度极快。",
        penalty: "违规进入高速路段者将面临罚款，且有极高的人身安全风险。",
        weatherAdvice: "⚠️ 湿滑与大风：雨天骑行打滑失控风险极高。严禁在汽车专用快速通道旁冒险骑行。",
        faq: {
          q1: "共享电动滑板车也禁止通行吗？",
          a1: "是的，包含电动滑板车、平衡车在内的所有个人代步工具（PMD）均在此禁止通行范围内。",
          q2: "为什么禁止自行车通行？",
          a2: "该路段为高架路、隧道或汽车专用道，车流平均时速超过70公里，非机动车进入极易发生致命车祸。",
          q3: "处罚的标准是什么？",
          a3: "自行车处以10,000韩元罚款，电动滑板车等处以30,000韩元罚款，并会被强制扣离现场。"
        }
      },
      ja: {
        title: "自転車通行止め",
        meaning: "自転車・キックボード進入禁止",
        instruction: "自転車およびキックボードなどの個人用移動手段の通行は禁止されています。主に高速走行道路や自動車専用道路에 설치됩니다.",
        penalty: "高速走行道路などへの進入は違法であり、取り締まり時に罰金が科されることがあります。",
        weatherAdvice: "⚠️ 雨風のスリップ危険：雨の日の二輪車は極めてスリップしやすくなります。自動車専用道路の側道等の通行も避けてください。",
        faq: {
          q1: "電動キックボードも禁止対象ですか？",
          a1: "はい、電動キックボードやセグウェイなどの個人用モビリティ（PMD）もすべて進入禁止の対象です。",
          q2: "なぜ禁止されているのですか？",
          a2: "この先は自動車専用道路やバイパスなど、車の速度が非常に速い道路であるため、自転車等の進入は極めて危険だからです。",
          q3: "罰金はいくらですか？",
          a3: "自転車の違反は10,000 KRW、電動キックボードなどの違反は30,000 KRWの反則金が科されます。"
        }
      }
    }
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TRAFFIC_SIGNS };
}
