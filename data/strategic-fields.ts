// 政府「17の戦略分野」官民投資額（想定）× 契約学科（NEDO 2026年7月7日採択）
// 出典: 官民投資額=政府「17の戦略分野」一覧表 / 契約学科=NEDO ニュースリリース ほか各大学・企業リリース
// 金額の単位はすべて 兆円。

export type Scheme = "拠点形成事業" | "若サポ契約学科型";

/**
 * item        … 特定の製品・技術に紐づく
 * unassigned  … 17分野のいずれにも紐づけない。人材育成の方法論そのものが対象で、
 *               出口となる製品・技術・分野を公表資料から特定できないもの（東京大学）。
 *               推測で分野に置くとグラフ上で断定に見えるため、あえて割り当てない。
 */
export type AttachLevel = "item" | "unassigned";

export interface Source {
  /** 出典の正式なタイトル。リンク先と必ず一致させること */
  label: string;
  url: string;
  /** その出典が何を裏づけるか。推定である場合はここに明記する */
  note: string;
}

export interface ContractProgram {
  id: string;
  university: string;
  partner: string;
  /** 正式名称。未公表なら "未公表" */
  program: string;
  scheme: Scheme;
  /** 拠点形成事業のみ設定される類型。なければ "—" */
  type: string;
  /** 採択元のNEDO公募事業名 */
  nedo: string;
  /** 事業期間。不明なら "—" */
  period: string;
  opensAt: string;
  capacity: string;
  attach: AttachLevel;
  /** 1〜2文の要約 */
  summary: string;
  research: string;
  education: string;
  goal: string;
  career: string;
  /** 1件以上。採択の事実を示す出典を先頭に置く */
  sources: Source[];
}

export interface ContractLink {
  programId: string;
  /**
   * 対応づけの根拠。現時点の公開情報から何を読み取ったか。
   * 対応づけ自体がすべて推定なので、確度のラベルは持たず、根拠を必ず書く。
   */
  basis: string;
}

export interface Item {
  id: string;
  fieldId: string;
  name: string;
  /** 兆円。金額未公表・単年度予算の項目は null */
  amount: number | null;
  /** 全分野の製品・技術を金額降順に並べた競争順位。再掲は母集団から除外し元項目と同順位 */
  rank: number | null;
  period: string;
  targetFy: number | null;
  /** 他分野との重複計上（再掲） */
  isRestated: boolean;
  /** 合計・順位の対象か */
  isCounted: boolean;
  note: string;
  contracts: ContractLink[];
}

export interface Field {
  id: string;
  name: string;
  shortName: string;
  /** 分野内の単純合算（再掲を含む） */
  total: number;
  /** 再掲を除いた額。分野を足し上げると GRAND_TOTAL に一致する */
  totalNet: number;
  rank: number;
  rankNet: number;
  itemCount: number;
  /** 分野内で対象年度が混在するか */
  periodMixed: boolean;
  periods: string[];
  contractIds: string[];
}

export const GRAND_TOTAL = 395.3;

/** 契約学科と分野・製品・技術の対応づけについての前提。UIで必ず1回示すこと。 */
export const MAPPING_NOTE =
  "各契約学科と分野・製品・技術の対応づけは、現時点の公開情報からの推定。政府・NEDO・各大学のいずれも対応関係を公表していない。個々の根拠は一覧の根拠列を参照。";

/** 契約学科制度そのものの出典。神戸大学・川崎重工業のリリースに拠る。 */
export const SCHEME_NOTE = {
  description:
    "中長期にわたり、産業界と大学（大学院・高専など）が融合して、ビジネス化の牽引役となる人材を教育・育成するための新しい制度。内閣府 第7期科学技術・イノベーション基本計画の一環として経済産業省が推進する。",
  source: "https://www.meti.go.jp/shingikai/sankoshin/sangyo_gijutsu/innovation/pdf/012_s01_00.pdf",
};

export const PROGRAMS: ContractProgram[] = [
  {
    "id": "kobe",
    "university": "神戸大学",
    "partner": "川崎重工業",
    "program": "神戸大学大学院横断教育プログラム 未来モビリティ開発コース（博士前期・後期課程）／学位プログラム名「未来モビリティ共創プログラム」",
    "scheme": "拠点形成事業",
    "type": "国家戦略技術領域研究",
    "nedo": "ディープテック・スタートアップ支援基金／科学とビジネスの近接化時代の大規模産学連携拠点形成事業",
    "period": "—",
    "opensAt": "2028年4月",
    "capacity": "博士前期 20名／博士後期 4名（2030年度以降 8名）・年",
    "attach": "item",
    "summary": "四足歩行ロボットを中核プラットフォームに、フィジカルAIで災害対応・インフラ維持管理の重量物搬送を実現する。",
    "research": "四足歩行ロボットを中核プラットフォームとした未来モビリティの社会実装に向け、実世界の現場で認識・判断・行動する「フィジカルAI」技術を基盤として、災害対応やインフラ維持管理など過酷環境での重量物搬送・作業支援の研究開発を推進。人とモビリティが協調する新しい運用モデルの構築も進める。",
    "education": "PBL（Project Based Learning）を中核とした産学連携の実践型教育。川崎重工および関係ステークホルダーの開発現場・実証フィールドを活用し、実装力・プロジェクト推進力に加え知財・事業化を含む価値創出力を体系的に習得する。ジョージア工科大学など海外研究機関との連携・インターンシップも実施。",
    "goal": "2035年までに100名規模の高度イノベーション人材の輩出と社会実装可能なモビリティの創出。契約学科制度のベストプラクティスとして発展させる。",
    "career": "産業界・研究機関・起業を通じ、陸海空の自律型モビリティの開発・実装に携わる進路を想定。",
    "sources": [
      {
        "label": "神戸大学・川崎重工業「経済産業省「契約学科制度」に向けて、「未来モビリティ共創開発拠点」を形成」（2026年7月13日）",
        "url": "https://www.kobe-u.ac.jp/ja/announcement/20260713-68122/",
        "note": ""
      }
    ]
  },
  {
    "id": "tohoku",
    "university": "東北大学",
    "partner": "レゾナック／日清オイリオグループ／新化学技術推進協会 ほか化学素材関連企業",
    "program": "未公表",
    "scheme": "拠点形成事業",
    "type": "地域産業技術領域研究",
    "nedo": "ディープテック・スタートアップ支援基金／科学とビジネスの近接化時代の大規模産学連携拠点形成事業",
    "period": "—",
    "opensAt": "未公表",
    "capacity": "未公表",
    "attach": "item",
    "summary": "採択テーマは「0→1の発見を1→100の生産につなげる実用プロセス開発拠点の構築」。化学素材の量産化プロセス開発が主題。",
    "research": "プログラムの内容は未公表。テーマ名が東北大学の実用プロセス開発・イノベーションセンター（2025年4月設立、工学研究科・環境科学研究科の化学工学が中心）の掲げる「0→1の発見を1→100の生産へとつなげる」と一致するため、同センターが母体とみられる。同センターは反応・分離装置のスケールアップ、電解プロセスの設計（二酸化炭素講座・有機物講座）、バイオマス原料の触媒反応を扱う。ただしこの対応関係は当方の推定であり、大学は公表していない。",
    "education": "未公表",
    "goal": "未公表",
    "career": "未公表",
    "sources": [
      {
        "label": "NEDO「産学連携の新たな形である「契約学科」設立を含めた取り組みが始動します」（2026年7月7日）",
        "url": "https://www.nedo.go.jp/news/press/AA5_101950.html",
        "note": "採択の事実。東北大学・企業側による当事業のリリースは確認できていない"
      },
      {
        "label": "東北大学 実用プロセス開発・イノベーションセンター",
        "url": "https://tohoku-cpdi.jp/",
        "note": "母体とみられる組織。当方の推定であり、大学は本事業との関係を公表していない"
      }
    ]
  },
  {
    "id": "niigata",
    "university": "新潟大学",
    "partner": "オイシックス・ラ・大地",
    "program": "フードテック・イノベーションプログラム（仮称）／大学院総合学術研究科（修士課程・2026年4月改組）",
    "scheme": "拠点形成事業",
    "type": "地域産業技術領域研究",
    "nedo": "ディープテック・スタートアップ支援基金／科学とビジネスの近接化時代の大規模産学連携拠点形成事業",
    "period": "—",
    "opensAt": "2028年4月",
    "capacity": "10名・学年（修士課程2年）",
    "attach": "item",
    "summary": "未利用食材の高付加価値化が主題。経済産業省が推進する契約学科制度として、国内で初めて設置を表明した事例。",
    "research": "採択テーマは「\"課題\"を\"価値\"に変革する「フードテック・イノベーション」の研究開発」。未利用食材の高付加価値化を軸とする。",
    "education": "AIを活用した商品開発・販売戦略策定をテーマに、食品系スタートアップでのインターンシップなど実践教育を行う。学部卒業生だけでなく社会人や海外人材も対象。拠点は新潟市都心部に設置するフードテック特化型の新拠点と、五十嵐キャンパスの「食と健康のInnovation Hub」。産学が連携して事業化・実用化を見据えた明確なターゲットを設定している点と、人材像に基づく実践的カリキュラムを構築している点が採択理由とされる。",
    "goal": "2035年までに食産業にイノベーションをもたらす高度人材を100名以上輩出。",
    "career": "未公表",
    "sources": [
      {
        "label": "新潟大学「本学とオイシックスが大学院に共同設置する新たな学位プログラム「フードテック・イノベーションプログラム（仮称）」がNEDOの支援事業に採択されました」（2026年7月7日）",
        "url": "https://www.niigata-u.ac.jp/news/2026/1168990/",
        "note": ""
      },
      {
        "label": "新潟大学「大学院総合学術研究科「フードテック・イノベーションプログラム（仮称）」の設置構想について」（2026年3月12日）",
        "url": "https://www.niigata-u.ac.jp/news/2026/1059799/",
        "note": "プログラムの構想・定員・拠点"
      }
    ]
  },
  {
    "id": "kanazawa",
    "university": "金沢大学",
    "partner": "ダイセル",
    "program": "金沢大学大学院自然科学研究科に産学連携によるカリキュラムを設置（開始予定時期は原典に記載）",
    "scheme": "若サポ契約学科型",
    "type": "—",
    "nedo": "官民による若手研究者発掘支援事業／契約学科型",
    "period": "2026年度〜2031年度（最大6年間）",
    "opensAt": "未確認",
    "capacity": "未公表",
    "attach": "item",
    "summary": "バイオマス資源の高度利用。BGICでの産学連携を軸に、物質分離・変換・機能化の研究開発と人材育成を一体で進め「真の循環型社会の実現」を目指す。",
    "research": "研究課題は3つ。①セルロース系高選択性金属吸着材の開発（セルロースに化学的加工を施し有用金属・有害金属を選択的かつ高効率に吸着。吸着後に燃焼するだけで有用金属を回収でき、廃棄物の発生量も大幅に低減）②新規イオン液体と酵素・発酵技術を利用したバイオマスの分離・成分利用開発法（バイオマス成分の溶解と酵素反応・発酵の適用を同じ工程内で行い、酵素糖化とアルコール発酵を1つの容器で温和な条件下に実施してエタノールを生産）③太陽光超還元場®によるCO2変換技術基盤の開発（太陽光を反応駆動源として電極表面から電子を自発的に放出させ、極めて高い還元力を持つ溶媒和電子を生成。外部電力への依存を大幅に低減しつつ熱力学的に還元が困難だった対象物質を還元しうる）。母体は令和5年に稼働した金沢大学バイオマス・グリーンイノベーションセンター（BGIC）。",
    "education": "金沢大学大学院自然科学研究科に産学連携によるカリキュラムを設け、ダイセルの研究者が教育・研究指導に参画し、社会実装まで見据えた実践的な教育を実施する。",
    "goal": "新産業の創出に貢献するとともに、地域産業をけん引し、国際社会で幅広く活躍できるイノベータ型専門人材の養成を推進。10年先を見据えた技術の継続的な改良と、それを支える次世代の専門人材育成を統合した事業基盤の確立を目指す。",
    "career": "未公表",
    "sources": [
      {
        "label": "金沢大学・ダイセル「「官民による若手研究者発掘支援事業／契約学科型」に採択 金沢大学×ダイセル バイオマスバリューチェーン実装を加速」（2026年7月7日）",
        "url": "https://www.kanazawa-u.ac.jp/wp/wp-content/uploads/2026/07/260707-1.pdf",
        "note": ""
      }
    ]
  },
  {
    "id": "utokyo",
    "university": "東京大学",
    "partner": "ソニーグループ",
    "program": "未公表",
    "scheme": "若サポ契約学科型",
    "type": "—",
    "nedo": "官民による若手研究者発掘支援事業／契約学科型",
    "period": "2026年度〜2031年度（最大6年間）",
    "opensAt": "未公表",
    "capacity": "未公表",
    "attach": "unassigned",
    "summary": "採択テーマは「産学協創による博士人材のディープテック・イノベーション基盤の研究」。特定の製品・技術ではなく人材育成の方法論そのものが対象で、17分野のいずれにも紐づけていない。",
    "research": "プログラムの内容は未公表。2026年10月1日に大学院工学系研究科へ設置される「越境イノベーション研究センター」が受け皿とみられる。同センターは人文社会系研究科と連携し、テクノロジー・ビジネス・アートといった異なる領域を越境してイノベーションを起こす人材の育成と、産学協創による知の循環を起点としたエコシステムの研究を目的とする組織で、2019年から実施してきたソニーグループとの社会連携講座の経験を踏まえ、新たに組織的な研究・教育拠点として活動を開始する。採択テーマの「産学協創」「イノベーション基盤の研究」と、同センターの「産学協創による知の循環を起点としたエコシステムの研究」は語彙がほぼ一致する。ただしこの対応関係は当方の推定であり、大学は本事業との関係を公表していない。",
    "education": "未公表。関連する取り組みとして、ソニーグループ人材育成基金（2026年7月1日設置、東京大学基金内のエンダウメント型）が①越境イノベーション研究センターの越境型人材育成プログラム IGNITE ②2027年度開始予定の学士・修士5年一貫プログラム UTokyo College of Design を支援する。IGNITEには文理を越えた全学年・全学科の選抜生と本郷近隣のアート・デザイン系の大学生、全国から選抜された学生が参画し、企業連携の一環としてソニーグループが日本のエンタメカルチャーの海外展開に関するテーマなどを通じた協創活動を予定している。ただしこれは基金による別の取り組みで、対象も学部生中心。博士人材を対象とする本事業とは範囲が異なる。",
    "goal": "未公表",
    "career": "未公表",
    "sources": [
      {
        "label": "NEDO「産学連携の新たな形である「契約学科」設立を含めた取り組みが始動します」（2026年7月7日）",
        "url": "https://www.nedo.go.jp/news/press/AA5_101950.html",
        "note": "採択の事実。東京大学・ソニーグループによる当事業のリリースは確認できていない"
      },
      {
        "label": "ソニーグループ・東京大学「ソニーグループと東京大学、次世代人材育成を目的とする「ソニーグループ人材育成基金」を設置」（2026年7月1日、7月14日一部修正）",
        "url": "https://www.u-tokyo.ac.jp/content/400291087.pdf",
        "note": "本事業とは別の取り組み。越境イノベーション研究センターの目的・設置時期に関する推定の根拠として参照"
      }
    ]
  }
];

export const FIELDS: Field[] = [
  {
    "id": "ai-semiconductor",
    "name": "AI・半導体",
    "shortName": "AI・半導体",
    "total": 101.6,
    "totalNet": 101.6,
    "itemCount": 3,
    "periodMixed": false,
    "periods": [
      "2040年度"
    ],
    "contractIds": [
      "kobe"
    ],
    "rank": 1,
    "rankNet": 1
  },
  {
    "id": "digital-cyber",
    "name": "デジタル・サイバーセキュリティ",
    "shortName": "デジタル・サイバー",
    "total": 55.4,
    "totalNet": 55.4,
    "itemCount": 6,
    "periodMixed": true,
    "periods": [
      "2035年度",
      "2040年度"
    ],
    "contractIds": [],
    "rank": 3,
    "rankNet": 2
  },
  {
    "id": "telecom",
    "name": "情報通信",
    "shortName": "情報通信",
    "total": 28.8,
    "totalNet": 28.8,
    "itemCount": 3,
    "periodMixed": false,
    "periods": [
      "2040年度"
    ],
    "contractIds": [],
    "rank": 6,
    "rankNet": 6
  },
  {
    "id": "quantum",
    "name": "量子",
    "shortName": "量子",
    "total": 13.2,
    "totalNet": 13.2,
    "itemCount": 3,
    "periodMixed": false,
    "periods": [
      "2040年度"
    ],
    "contractIds": [],
    "rank": 9,
    "rankNet": 8
  },
  {
    "id": "defense",
    "name": "防衛産業",
    "shortName": "防衛産業",
    "total": 4.7,
    "totalNet": 4.7,
    "itemCount": 3,
    "periodMixed": true,
    "periods": [
      "2026年度",
      "2040年度"
    ],
    "contractIds": [],
    "rank": 11,
    "rankNet": 11
  },
  {
    "id": "aero-space",
    "name": "航空・宇宙",
    "shortName": "航空・宇宙",
    "total": 18.5,
    "totalNet": 18.5,
    "itemCount": 6,
    "periodMixed": false,
    "periods": [
      "2040年度"
    ],
    "contractIds": [],
    "rank": 7,
    "rankNet": 7
  },
  {
    "id": "ocean",
    "name": "海洋",
    "shortName": "海洋",
    "total": 3.3,
    "totalNet": 3.3,
    "itemCount": 3,
    "periodMixed": false,
    "periods": [
      "2040年度"
    ],
    "contractIds": [],
    "rank": 12,
    "rankNet": 12
  },
  {
    "id": "shipbuilding",
    "name": "造船",
    "shortName": "造船",
    "total": 1.1,
    "totalNet": 1.1,
    "itemCount": 3,
    "periodMixed": true,
    "periods": [
      "2034年度",
      "2035年度"
    ],
    "contractIds": [],
    "rank": 16,
    "rankNet": 16
  },
  {
    "id": "materials",
    "name": "マテリアル（重要鉱物・部素材）",
    "shortName": "マテリアル",
    "total": 16.9,
    "totalNet": 12.7,
    "itemCount": 6,
    "periodMixed": false,
    "periods": [
      "2040年度"
    ],
    "contractIds": [
      "tohoku"
    ],
    "rank": 8,
    "rankNet": 9
  },
  {
    "id": "synbio",
    "name": "合成生物学・バイオ",
    "shortName": "合成生物学・バイオ",
    "total": 33.6,
    "totalNet": 33.6,
    "itemCount": 2,
    "periodMixed": false,
    "periods": [
      "2040年度"
    ],
    "contractIds": [],
    "rank": 5,
    "rankNet": 5
  },
  {
    "id": "pharma",
    "name": "創薬・先端医療",
    "shortName": "創薬・先端医療",
    "total": 64.1,
    "totalNet": 43.3,
    "itemCount": 5,
    "periodMixed": false,
    "periods": [
      "2040年度"
    ],
    "contractIds": [],
    "rank": 2,
    "rankNet": 3
  },
  {
    "id": "energy-gx",
    "name": "資源・エネルギー安全保障・GX",
    "shortName": "資源・エネ・GX",
    "total": 28.8,
    "totalNet": 28.8,
    "itemCount": 7,
    "periodMixed": false,
    "periods": [
      "2040年度"
    ],
    "contractIds": [
      "kanazawa",
      "tohoku"
    ],
    "rank": 6,
    "rankNet": 6
  },
  {
    "id": "fusion",
    "name": "フュージョンエネルギー",
    "shortName": "フュージョン",
    "total": 3.1,
    "totalNet": 3.1,
    "itemCount": 1,
    "periodMixed": false,
    "periods": [
      "2040年度"
    ],
    "contractIds": [],
    "rank": 13,
    "rankNet": 13
  },
  {
    "id": "resilience",
    "name": "防災・国土強靱化",
    "shortName": "防災・国土強靱化",
    "total": 2.6,
    "totalNet": 2.6,
    "itemCount": 1,
    "periodMixed": false,
    "periods": [
      "2030年度"
    ],
    "contractIds": [
      "kobe"
    ],
    "rank": 14,
    "rankNet": 14
  },
  {
    "id": "port-logistics",
    "name": "港湾ロジスティクス",
    "shortName": "港湾ロジスティクス",
    "total": 1.2,
    "totalNet": 1.2,
    "itemCount": 3,
    "periodMixed": false,
    "periods": [
      "2040年度"
    ],
    "contractIds": [],
    "rank": 15,
    "rankNet": 15
  },
  {
    "id": "foodtech",
    "name": "フードテック",
    "shortName": "フードテック",
    "total": 9.7,
    "totalNet": 9.7,
    "itemCount": 4,
    "periodMixed": false,
    "periods": [
      "2040年度"
    ],
    "contractIds": [
      "niigata"
    ],
    "rank": 10,
    "rankNet": 10
  },
  {
    "id": "contents",
    "name": "コンテンツ",
    "shortName": "コンテンツ",
    "total": 33.7,
    "totalNet": 33.7,
    "itemCount": 5,
    "periodMixed": false,
    "periods": [
      "2033年度"
    ],
    "contractIds": [],
    "rank": 4,
    "rankNet": 4
  }
];

export const ITEMS: Item[] = [
  {
    "id": "ai-semiconductor-01",
    "fieldId": "ai-semiconductor",
    "name": "フィジカルAI（特にAIロボット）",
    "amount": 10.5,
    "rank": 10,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": [
      {
        "programId": "kobe",
        "basis": "神戸大学・川崎重工業のリリースが「実世界の現場で認識・判断・行動する『フィジカルAI』技術を基盤として」と明記。四足歩行ロボットを中核プラットフォームとする。"
      }
    ]
  },
  {
    "id": "ai-semiconductor-02",
    "fieldId": "ai-semiconductor",
    "name": "AI半導体",
    "amount": 68,
    "rank": 1,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "ai-semiconductor-03",
    "fieldId": "ai-semiconductor",
    "name": "バーティカルAI（領域特化型AI）",
    "amount": 23.1,
    "rank": 5,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "digital-cyber-01",
    "fieldId": "digital-cyber",
    "name": "データプラットフォーム",
    "amount": 0.9,
    "rank": 49,
    "period": "2035年度まで",
    "targetFy": 2035,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "digital-cyber-02",
    "fieldId": "digital-cyber",
    "name": "セキュリティの確保された政府・地方公共団体のAX/DX基盤",
    "amount": 7.4,
    "rank": 13,
    "period": "2035年度まで",
    "targetFy": 2035,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "digital-cyber-03",
    "fieldId": "digital-cyber",
    "name": "AI時代に対応した先進的セキュリティ製品・サービス",
    "amount": 1,
    "rank": 45,
    "period": "2035年度まで",
    "targetFy": 2035,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "digital-cyber-04",
    "fieldId": "digital-cyber",
    "name": "クラウド・データセンター、蓄電池",
    "amount": 32.7,
    "rank": 2,
    "period": "2035年度まで",
    "targetFy": 2035,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "digital-cyber-05",
    "fieldId": "digital-cyber",
    "name": "クラウドネイティブに最適化された医療DX基盤",
    "amount": 5.2,
    "rank": 20,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "digital-cyber-06",
    "fieldId": "digital-cyber",
    "name": "自動運転技術",
    "amount": 8.2,
    "rank": 12,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "telecom-01",
    "fieldId": "telecom",
    "name": "オール光ネットワーク（APN：All-Photonics Network）",
    "amount": 5.9,
    "rank": 18,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "telecom-02",
    "fieldId": "telecom",
    "name": "海底ケーブル",
    "amount": 2.4,
    "rank": 35,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "telecom-03",
    "fieldId": "telecom",
    "name": "次世代ワイヤレス（非地上系ネットワーク、5G/Beyond5G（6G）等）",
    "amount": 20.5,
    "rank": 7,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "quantum-01",
    "fieldId": "quantum",
    "name": "量子コンピューティング",
    "amount": 10.3,
    "rank": 11,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "quantum-02",
    "fieldId": "quantum",
    "name": "量子通信・ネットワーク",
    "amount": 1.5,
    "rank": 38,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "quantum-03",
    "fieldId": "quantum",
    "name": "量子センシング",
    "amount": 1.4,
    "rank": 39,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "defense-01",
    "fieldId": "defense",
    "name": "小型無人航空機",
    "amount": 0.4,
    "rank": 53,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "加えて、戦略三文書の改定に伴う投資額も今後見込まれる",
    "contracts": []
  },
  {
    "id": "defense-02",
    "fieldId": "defense",
    "name": "艦艇",
    "amount": null,
    "rank": null,
    "period": "2026年度予算",
    "targetFy": 2026,
    "isRestated": false,
    "isCounted": false,
    "note": "艦艇分野への防衛調達を含む投資は約3,400億円（2026年度予算）。単年度予算のため合計・順位の対象外。加えて、戦略三文書の改定に伴う投資額も今後見込まれる",
    "contracts": []
  },
  {
    "id": "defense-03",
    "fieldId": "defense",
    "name": "軍民両用技術（デュアルユース技術）",
    "amount": 4.3,
    "rank": 25,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "aero-space-01",
    "fieldId": "aero-space",
    "name": "民間航空機（次期単通路機・次世代航空機）",
    "amount": 3.5,
    "rank": 28,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "aero-space-02",
    "fieldId": "aero-space",
    "name": "無人航空機",
    "amount": 0.3,
    "rank": 56,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "aero-space-03",
    "fieldId": "aero-space",
    "name": "空飛ぶクルマ",
    "amount": 0.4,
    "rank": 53,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "aero-space-04",
    "fieldId": "aero-space",
    "name": "ロケット・射場",
    "amount": 2.3,
    "rank": 36,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "aero-space-05",
    "fieldId": "aero-space",
    "name": "人工衛星・サービス",
    "amount": 6.4,
    "rank": 15,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "aero-space-06",
    "fieldId": "aero-space",
    "name": "月面探査・低軌道技術",
    "amount": 5.6,
    "rank": 19,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "ocean-01",
    "fieldId": "ocean",
    "name": "海洋無人機（海洋ドローン）",
    "amount": 1.2,
    "rank": 41,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "ocean-02",
    "fieldId": "ocean",
    "name": "海洋状況把握（MDA）",
    "amount": 1.2,
    "rank": 41,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "ocean-03",
    "fieldId": "ocean",
    "name": "革新的海底開発技術",
    "amount": 0.9,
    "rank": 49,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "shipbuilding-01",
    "fieldId": "shipbuilding",
    "name": "次世代船舶",
    "amount": 1,
    "rank": 45,
    "period": "2034年度まで",
    "targetFy": 2034,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "shipbuilding-02",
    "fieldId": "shipbuilding",
    "name": "船舶修繕",
    "amount": 0.1,
    "rank": 60,
    "period": "2035年度まで",
    "targetFy": 2035,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "shipbuilding-03",
    "fieldId": "shipbuilding",
    "name": "LNG運搬船",
    "amount": null,
    "rank": null,
    "period": "—",
    "targetFy": null,
    "isRestated": false,
    "isCounted": false,
    "note": "関係者間での検討を引き続き進めつつ、今後精査（金額未定のため合計・順位の対象外）",
    "contracts": []
  },
  {
    "id": "materials-01",
    "fieldId": "materials",
    "name": "永久磁石",
    "amount": 0.2,
    "rank": 58,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "materials-02",
    "fieldId": "materials",
    "name": "グリーン鉄",
    "amount": 4.2,
    "rank": 26,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": true,
    "isCounted": true,
    "note": "再掲",
    "contracts": []
  },
  {
    "id": "materials-03",
    "fieldId": "materials",
    "name": "革新的金属部素材",
    "amount": 0.3,
    "rank": 56,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "materials-04",
    "fieldId": "materials",
    "name": "低炭素金属部素材",
    "amount": 0.7,
    "rank": 51,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "materials-05",
    "fieldId": "materials",
    "name": "一次原料（鉱石等）及び二次原料（リサイクル材等の循環資源）からの製錬・分離精製、解体選別技術",
    "amount": 6.3,
    "rank": 16,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "海外での鉱山開発や製錬事業への投資を含む",
    "contracts": [

    ]
  },
  {
    "id": "materials-06",
    "fieldId": "materials",
    "name": "AI等を活用した複合新素材",
    "amount": 5.2,
    "rank": 20,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "synbio-01",
    "fieldId": "synbio",
    "name": "バイオものづくり",
    "amount": 12.8,
    "rank": 8,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "synbio-02",
    "fieldId": "synbio",
    "name": "バイオ医薬品・再生医療等製品等",
    "amount": 20.8,
    "rank": 6,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "創薬・先端医療にも同一項目が掲載。本データでは合成生物学・バイオ側を本体として計上（野村證券の整理に準拠）",
    "contracts": []
  },
  {
    "id": "pharma-01",
    "fieldId": "pharma",
    "name": "ファーストインクラス製品・ベストインクラス製品（医薬品、再生医療等製品）",
    "amount": 23.4,
    "rank": 4,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "pharma-02",
    "fieldId": "pharma",
    "name": "感染症対応製品",
    "amount": 7.2,
    "rank": 14,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "pharma-03",
    "fieldId": "pharma",
    "name": "バイオ医薬品・再生医療等製品等",
    "amount": 20.8,
    "rank": 6,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": true,
    "isCounted": true,
    "note": "再掲",
    "contracts": []
  },
  {
    "id": "pharma-04",
    "fieldId": "pharma",
    "name": "革新的デバイス（AI、ロボティクス等）を活用した先端医療",
    "amount": 11.6,
    "rank": 9,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "pharma-05",
    "fieldId": "pharma",
    "name": "ライフログデータ等を活用したヘルスケア関連サービス",
    "amount": 1.1,
    "rank": 44,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "energy-gx-01",
    "fieldId": "energy-gx",
    "name": "次世代型太陽電池（ペロブスカイト太陽電池等）",
    "amount": 4.1,
    "rank": 27,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "energy-gx-02",
    "fieldId": "energy-gx",
    "name": "水素等",
    "amount": 6.2,
    "rank": 17,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "energy-gx-03",
    "fieldId": "energy-gx",
    "name": "グリーン鉄",
    "amount": 4.2,
    "rank": 26,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "マテリアル（重要鉱物・部素材）にも同一項目が掲載。本データでは資源・エネルギー安全保障・GX側を本体として計上（野村證券の整理に準拠）",
    "contracts": []
  },
  {
    "id": "energy-gx-04",
    "fieldId": "energy-gx",
    "name": "次世代型地熱",
    "amount": 1,
    "rank": 45,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "energy-gx-05",
    "fieldId": "energy-gx",
    "name": "洋上風力",
    "amount": 5.1,
    "rank": 22,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "energy-gx-06",
    "fieldId": "energy-gx",
    "name": "次世代革新炉",
    "amount": 5,
    "rank": 23,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "energy-gx-07",
    "fieldId": "energy-gx",
    "name": "GXケミカル",
    "amount": 3.2,
    "rank": 30,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": [
      {
        "programId": "kanazawa",
        "basis": "採択テーマが「バイオマスバリューチェーン実装を加速する物質分離・変換・機能化技術の研究開発」で、研究課題③が「太陽光超還元場®によるCO2変換技術基盤の開発」。17分野で化学プロセスの脱炭素を扱う項目はGXケミカルのみ。"
      },
      {
        "programId": "tohoku",
        "basis": "採択テーマが化学素材の量産化プロセス開発で、産学連携先が新化学技術推進協会・レゾナック・化学素材関連企業。東北大学とレゾナックは2025年7月から、CO2を固体と反応させる「鉱物化」というカーボンリサイクル技術で、シリコンスラッジとCO2からSiC原料を創出する共同研究を本格化させている。ただしこの共同研究が本拠点に含まれるとは公表されていない。"
      }
    ]
  },
  {
    "id": "fusion-01",
    "fieldId": "fusion",
    "name": "フュージョンエネルギー",
    "amount": 3.1,
    "rank": 31,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "フュージョン発電実証プラントが一つであると仮定した試算。2030年代の発電実証以降は、研究フェーズの進展に伴う産業界の予見性の高まりに応じて、投資額の増加が見込まれる",
    "contracts": []
  },
  {
    "id": "resilience-01",
    "fieldId": "resilience",
    "name": "防災技術",
    "amount": 2.6,
    "rank": 34,
    "period": "2030年度まで",
    "targetFy": 2030,
    "isRestated": false,
    "isCounted": true,
    "note": "加えて、第1次国土強靱化実施中期計画に基づき2030年度までに官民合わせて概ね20兆円強程度の内数を投資額として想定",
    "contracts": [
      {
        "programId": "kobe",
        "basis": "同リリースの「研究面」が「災害対応やインフラ維持管理など過酷環境での重量物搬送・作業支援」を研究内容として明記。ただし技術の帰属先はフィジカルAIで、防災技術は出口領域。"
      }
    ]
  },
  {
    "id": "port-logistics-01",
    "fieldId": "port-logistics",
    "name": "港湾荷役機械",
    "amount": 0.4,
    "rank": 53,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "port-logistics-02",
    "fieldId": "port-logistics",
    "name": "サイバーポート（港湾物流DX）",
    "amount": 0.2,
    "rank": 58,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "port-logistics-03",
    "fieldId": "port-logistics",
    "name": "次世代型倉庫",
    "amount": 0.6,
    "rank": 52,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "foodtech-01",
    "fieldId": "foodtech",
    "name": "植物工場",
    "amount": 4.6,
    "rank": 24,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "foodtech-02",
    "fieldId": "foodtech",
    "name": "陸上養殖",
    "amount": 2.9,
    "rank": 33,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "foodtech-03",
    "fieldId": "foodtech",
    "name": "食品機械",
    "amount": 1.2,
    "rank": 41,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "foodtech-04",
    "fieldId": "foodtech",
    "name": "新規食品",
    "amount": 1,
    "rank": 45,
    "period": "2040年度まで",
    "targetFy": 2040,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": [
      {
        "programId": "niigata",
        "basis": "採択テーマが「“課題”を“価値”に変革する「フードテック・イノベーション」の研究開発」で、主題は未利用食材の高付加価値化。フードテック分野内でも植物工場・陸上養殖・食品機械ではない。"
      }
    ]
  },
  {
    "id": "contents-01",
    "fieldId": "contents",
    "name": "ゲーム",
    "amount": 24.5,
    "rank": 3,
    "period": "2033年度まで",
    "targetFy": 2033,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "contents-02",
    "fieldId": "contents",
    "name": "アニメ",
    "amount": 3.3,
    "rank": 29,
    "period": "2033年度まで",
    "targetFy": 2033,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "contents-03",
    "fieldId": "contents",
    "name": "マンガ",
    "amount": 1.6,
    "rank": 37,
    "period": "2033年度まで",
    "targetFy": 2033,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "contents-04",
    "fieldId": "contents",
    "name": "音楽",
    "amount": 3,
    "rank": 32,
    "period": "2033年度まで",
    "targetFy": 2033,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  },
  {
    "id": "contents-05",
    "fieldId": "contents",
    "name": "実写",
    "amount": 1.3,
    "rank": 40,
    "period": "2033年度まで",
    "targetFy": 2033,
    "isRestated": false,
    "isCounted": true,
    "note": "",
    "contracts": []
  }
];

export const programById = (id: string) => PROGRAMS.find((p) => p.id === id);
export const fieldById = (id: string) => FIELDS.find((f) => f.id === id);
export const itemsOfField = (id: string) => ITEMS.filter((i) => i.fieldId === id);
