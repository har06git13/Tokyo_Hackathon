export const facilityList = [
  {
    id: "fac_000",
    name: "渋谷駅前",
    type: "default",
    coordinates: { lat: 35.658, lng: 139.7017 },
    timeStatuses: {
      "2h": { crowdLevel: "low", availableItems: [] },
      "4h": { crowdLevel: "low", availableItems: [] },
      "6h": { crowdLevel: "medium", availableItems: [] },
      "8h": { crowdLevel: "medium", availableItems: [] },
      "10h": { crowdLevel: "high", availableItems: [] },
    },
  },
  {
    id: "fac_001",
    name: "CHARGESPOT HUB 渋谷センター街店",
    type: "mobilebattery", // mobilebattery,shelter,evacuation,temporary,atm,phone,restaurant,toilet,arrow,default:
    coordinates: { lat: 35.6595, lng: 139.7005 },
    timeStatuses: {
      "2h": {
        crowdLevel: "medium", // low | medium | high | unusable
        availableItems: ["mobilebattery"],
      },
      "4h": {
        crowdLevel: "high",
        availableItems: ["mobilebattery"],
      },
      "6h": {
        crowdLevel: "high",
        availableItems: ["mobilebattery"],
      },
      "8h": {
        crowdLevel: "unusable",
        availableItems: [],
      },
      "10h": {
        crowdLevel: "unusable",
        availableItems: [],
      },
    },
  },
  {
    id: "fac_002",
    name: "薬 マツモトキヨシ SHIBUYA DOGENZAKA FLAG",
    type: "arrow", // アロープロジェクト
    coordinates: { lat: 35.658, lng: 139.7 },
    timeStatuses: {
      "2h": { crowdLevel: "medium", availableItems: ["water", "chocolate"] },
      "4h": { crowdLevel: "high", availableItems: ["water"] },
      "6h": { crowdLevel: "high", availableItems: [] },
      "8h": { crowdLevel: "medium", availableItems: [] },
      "10h": { crowdLevel: "unusable", availableItems: [] },
    },
  },
  {
    id: "fac_003",
    name: "ファミリーマート 渋谷公園通り店",
    type: "restaurant", // 飲食店・小売店
    coordinates: { lat: 35.6612, lng: 139.702 },
    timeStatuses: {
      "2h": { crowdLevel: "high", availableItems: ["water", "bread"] },
      "4h": { crowdLevel: "high", availableItems: ["water", "bread"] },
      "6h": { crowdLevel: "medium", availableItems: ["water", "bread"] },
      "8h": { crowdLevel: "medium", availableItems: ["water"] },
      "10h": { crowdLevel: "low", availableItems: ["water"] },
    },
  },
  {
    id: "fac_004",
    name: "代々木公園",
    type: "evacuation", // 一時避難場所
    coordinates: { lat: 35.6764, lng: 139.6993 },
    timeStatuses: {
      "2h": { crowdLevel: "medium", availableItems: [] },
      "4h": { crowdLevel: "high", availableItems: [] },
      "6h": { crowdLevel: "high", availableItems: [] },
      "8h": { crowdLevel: "high", availableItems: [] },
      "10h": { crowdLevel: "medium", availableItems: [] },
    },
  },
  {
    id: "fac_005",
    name: "ウィズ原宿",
    type: "shelter",
    coordinates: { lat: 35.669, lng: 139.7022 },
    timeStatuses: {
      "2h": { crowdLevel: "unusable", availableItems: [] },
      "4h": { crowdLevel: "unusable", availableItems: [] },
      "6h": { crowdLevel: "medium", availableItems: [] },
      "8h": { crowdLevel: "high", availableItems: [] },
      "10h": { crowdLevel: "high", availableItems: [] },
    },
  },
];
