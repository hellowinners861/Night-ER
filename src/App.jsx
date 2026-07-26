import { useEffect, useRef, useState } from "react";

const TICK_MS = 100;
const SEC_PER_TICK = 3;
const INCOMING_WAIT = 300;

const GAME_MODES = {
  short: {
    id: "short",
    title: "ショート当直",
    startMin: 22 * 60,
    endClock: "03:00",
    shiftSec: 5 * 60 * 60,
    realMinutes: 10,
    description: "22:00〜翌03:00",
  },
  full: {
    id: "full",
    title: "フル当直",
    startMin: 17 * 60,
    endClock: "08:00",
    shiftSec: 15 * 60 * 60,
    realMinutes: 30,
    description: "17:00〜翌08:00",
  },
};

const option = (l, t, ok, fb) => ({ l, t, ok, fb });
const step = (q, correct, correctFb, wrongs) => ({
  q,
  opts: [
    option(correct[0], correct[1], true, correctFb),
    ...wrongs.map(([l, t, fb]) => option(l, t, false, fb)),
  ],
});
const makeCase = (name, chief, dx, kokushi, diff, limit, steps) => ({
  name,
  chief,
  dx,
  kokushi,
  diff,
  limit,
  steps,
});

const CASES = [
  makeCase("58歳男性", "冷汗を伴う胸部圧迫感", "急性心筋梗塞", true, 2, 40, [
    step("30分持続する前胸部の圧迫感。冷汗著明、左肩へ放散痛あり。まず行うのは?", ["12誘導心電図", 3], "II・III・aVFでST上昇。胸痛はまず心電図、10分以内が原則。", [
      ["胸部単純CT", 10, "CTは後。胸痛患者ではまず心電図。"],
      ["詳細な問診を30分", 15, "ST上昇型心筋梗塞は時間との勝負。"],
      ["採血して結果待ち", 8, "トロポニンを待たず、まず心電図。"],
      ["鎮痛薬を出して帰宅", 2, "急性冠症候群を見逃す危険な判断。"],
    ]),
    step("下壁誘導でST上昇を確認。初期治療として正しいのは?", ["アスピリン咀嚼投与+ヘパリン", 3], "抗血小板薬は早期投与で予後を改善する。", [
      ["硝酸薬を大量投与", 3, "右室梗塞合併時は血圧低下に注意。"],
      ["β遮断薬を急速静注", 3, "下壁梗塞では徐脈・房室ブロックに注意。"],
      ["上部消化管内視鏡", 15, "今行う検査ではない。"],
      ["鎮痛のみで朝まで観察", 5, "Time is muscle。"],
    ]),
    step("バイタルは保たれている。最終方針は?", ["循環器コール→緊急PCI", 5], "Door to balloon 90分以内を目指す。", [
      ["血栓溶解療法を朝まで待機", 10, "PCI可能施設では一次PCIを優先。"],
      ["CABGを即決で手配", 10, "まずカテーテル治療を検討する。"],
      ["内服処方して帰宅", 2, "STEMIを帰宅させてはいけない。"],
      ["一般病棟で経過観察", 5, "CCUまたはカテ室へ。"],
    ]),
  ]),
  makeCase("48歳女性", "突然の激しい頭痛と嘔吐", "くも膜下出血", true, 2, 45, [
    step("「バットで殴られたような」突然発症の頭痛。嘔吐あり。まず?", ["頭部単純CT", 10], "脳底槽に高吸収域。突然の激しい頭痛はまずCT。", [
      ["腰椎穿刺を先に", 10, "まずCT。CT陰性でなお疑う場合に腰椎穿刺。"],
      ["頭部MRIを予約", 20, "緊急時はまず単純CT。"],
      ["鎮痛薬を出して帰宅", 2, "雷鳴頭痛を帰してはいけない。"],
      ["心電図", 3, "診断は頭部CT。"],
    ]),
    step("CTでくも膜下出血を確認。再破裂予防として正しいのは?", ["降圧・鎮静・鎮痛、安静", 5], "刺激を避け、適切に血圧を管理する。", [
      ["抗凝固薬を開始", 3, "出血に抗凝固薬は禁忌。"],
      ["歩行でトイレを許可", 2, "体動や怒責を避ける。"],
      ["腰椎穿刺で減圧", 10, "診断後の腰椎穿刺は不要。"],
      ["明るい部屋で家族面会", 5, "刺激を最小限にする。"],
    ]),
    step("血圧管理を開始した。確定方針は?", ["脳外科コール→脳血管撮影、根治術へ", 5], "クリッピングまたはコイル塞栓で再破裂を防ぐ。", [
      ["朝まで様子を見る", 10, "夜間でも脳外科へ連絡する。"],
      ["内科病棟へ一般入院", 5, "動脈瘤への処置が必要。"],
      ["リハビリ科へ紹介", 5, "急性期治療が先。"],
      ["帰宅させ外来フォロー", 2, "帰宅は致命的。"],
    ]),
  ]),
  makeCase("32歳男性", "蜂刺傷後の呼吸困難", "アナフィラキシーショック", true, 1, 18, [
    step("蜂刺傷直後から全身蕁麻疹・喘鳴・血圧82/50。まず?", ["アドレナリン0.3mg筋注(大腿外側)", 2], "アナフィラキシーの第一選択はアドレナリン筋注。", [
      ["アドレナリンを静注", 2, "原則は筋注。静注は限定的。"],
      ["抗ヒスタミン薬のみ投与", 3, "補助療法であり第一選択ではない。"],
      ["ステロイドのみ投与", 3, "効果発現が遅い。"],
      ["様子を見る", 5, "気道浮腫が進行する。"],
    ]),
    step("筋注後、血圧はやや回復。続いて行うのは?", ["酸素投与・細胞外液急速輸液・モニター", 5], "二相性反応に備えて経過観察する。", [
      ["症状が引いたので即帰宅", 1, "二相性反応に注意。"],
      ["全身造影CT", 10, "今必要な検査ではない。"],
      ["予防的に気管切開", 10, "侵襲的すぎる。"],
      ["内服薬を処方して終診", 2, "モニタリングが必要。"],
    ]),
  ]),
  makeCase("24歳男性", "交通外傷・呼吸困難", "緊張性気胸", true, 2, 14, [
    step("左呼吸音消失、頸静脈怒張、気管右方偏位、血圧78/40。まず?", ["ただちに胸腔穿刺で脱気", 2], "緊張性気胸は臨床診断。画像を待たず脱気する。", [
      ["胸部X線を撮ってから判断", 5, "撮影を待つ間にショックが進行する。"],
      ["全身造影CT", 10, "まず脱気。"],
      ["気管挿管して陽圧換気", 5, "脱気前の陽圧換気は悪化させる。"],
      ["輸液だけして経過観察", 3, "閉塞を解除する必要がある。"],
    ]),
    step("穿刺で血圧が回復。次は?", ["胸腔ドレーンを留置", 8], "穿刺は応急処置。確実なドレナージへ移行する。", [
      ["これで完了、帰宅", 2, "再緊張を防ぐ必要がある。"],
      ["鎮痛薬のみで観察", 5, "ドレーン留置が必要。"],
      ["反対側も予防的に穿刺", 3, "健側への穿刺は不要。"],
      ["腹部エコーだけして終了", 5, "胸腔ドレーンが先。"],
    ]),
  ]),
  makeCase("75歳男性", "1時間前からの右片麻痺", "脳梗塞(t-PA適応)", true, 2, 50, [
    step("突然の右片麻痺と構音障害。心房細動の既往あり。まず?", ["頭部単純CTで出血を除外", 10], "血栓溶解前に頭蓋内出血を除外する。", [
      ["rt-PAを今すぐ投与", 3, "出血除外前の投与は危険。"],
      ["MRI拡散強調像を待つ", 20, "まず迅速にCT。"],
      ["抗血小板薬を内服させ帰宅", 3, "超急性期治療の機会を失う。"],
      ["腰椎穿刺", 10, "適応がない。"],
    ]),
    step("出血なし、発症1.5時間、禁忌項目なし。治療は?", ["rt-PA静注療法を開始", 5], "発症4.5時間以内で禁忌がなければ速やかに開始する。", [
      ["抗血小板薬のみで経過観察", 5, "適応があるならt-PAを検討。"],
      ["外減圧術を即施行", 15, "今行う治療ではない。"],
      ["降圧して帰宅", 3, "帰宅させてはいけない。"],
      ["翌週のMRIを予約", 3, "時間依存性の病態。"],
    ]),
    step("rt-PA投与開始。このあとの管理は?", ["SCU入院、血圧管理と神経学的モニタリング", 5], "出血性合併症を監視する。", [
      ["一般病棟でナースコール対応", 5, "集中的なモニタリングが必要。"],
      ["即リハビリ室で歩行訓練", 5, "投与直後の離床は早い。"],
      ["抗凝固薬を同時に全開", 3, "投与後24時間は抗血栓薬を避ける。"],
      ["帰宅させ家族に観察を依頼", 2, "入院管理が必要。"],
    ]),
  ]),
  makeCase("62歳男性", "大量吐血", "食道静脈瘤破裂", true, 2, 35, [
    step("肝硬変の既往。大量吐血、脈拍120、血圧88/52。まず?", ["太い末梢ルート2本確保、輸液・輸血準備", 5], "出血性ショックでは蘇生を優先する。", [
      ["ただちに緊急内視鏡室へ", 10, "循環を安定させてから。"],
      ["制吐薬を投与して様子見", 5, "出血源の制御が必要。"],
      ["胸部X線のみ", 5, "まず蘇生。"],
      ["経口で水分摂取を促す", 2, "誤嚥の危険がある。"],
    ]),
    step("輸液でバイタルがやや安定。根本治療は?", ["緊急上部内視鏡→静脈瘤結紮術(EVL)", 15], "内視鏡的止血が第一選択。", [
      ["下部消化管内視鏡", 15, "出血源は上部。"],
      ["造影CTだけ撮って朝まで待機", 10, "夜間でも止血を進める。"],
      ["開腹手術を第一選択に", 20, "まず内視鏡的止血。"],
      ["貧血だけ補正して帰宅", 5, "出血源を放置しない。"],
    ]),
  ]),
  makeCase("70歳女性", "高熱と右季肋部痛", "急性胆管炎", true, 1, 50, [
    step("発熱、黄疸、右季肋部痛。Charcot三徴が揃っている。まず?", ["採血+腹部エコー", 8], "胆道系酵素上昇と総胆管拡張を確認する。", [
      ["頭部CT", 10, "熱源は腹部。"],
      ["解熱薬を出して帰宅", 2, "敗血症に進行しうる。"],
      ["上部内視鏡をまず", 15, "まず胆道を評価する。"],
      ["尿検査のみ", 5, "黄疸を説明できない。"],
    ]),
    step("総胆管結石による胆管炎。血圧低下傾向。方針は?", ["抗菌薬開始+緊急胆道ドレナージ(ERCP)", 10], "重症胆管炎では閉塞解除が重要。", [
      ["抗菌薬を処方して帰宅", 3, "閉塞解除が必要。"],
      ["ただちに開腹胆摘", 20, "まず胆道ドレナージ。"],
      ["ウルソを処方", 2, "急性期治療にならない。"],
      ["絶食指示のみで朝まで", 5, "敗血症性ショックに進む。"],
    ]),
  ]),
  makeCase("20歳女性", "意識障害・深く速い呼吸", "糖尿病ケトアシドーシス", true, 2, 40, [
    step("口渇・多飲、傾眠、クスマウル呼吸、血糖480mg/dL。まず?", ["生理食塩水の急速輸液", 5], "DKAでは高度脱水の補正を優先する。", [
      ["インスリンを大量ボーラス静注のみ", 3, "輸液なしの大量投与は危険。"],
      ["経口血糖降下薬を内服", 3, "DKAに経口薬は不適切。"],
      ["ブドウ糖を投与", 3, "初期対応ではない。"],
      ["鎮静して経過観察", 5, "代償性呼吸を抑えてはいけない。"],
    ]),
    step("輸液を開始した。次の一手は?", ["速効型インスリン持続静注+K値モニタリング", 5], "インスリン開始後の低K血症に注意する。", [
      ["SGLT2阻害薬を追加", 3, "ケトアシドーシスのリスクになる。"],
      ["重炭酸を全例に投与", 5, "ルーチン投与はしない。"],
      ["血糖が下がったので帰宅", 2, "アシドーシス管理が残る。"],
      ["頭部CTのみ撮って待機", 10, "代謝異常の治療を進める。"],
    ]),
  ]),
  makeCase("55歳女性", "術後の突然の呼吸困難", "肺血栓塞栓症", true, 2, 35, [
    step("術後3日目、初回歩行直後に突然の呼吸困難。SpO2 87%、頻脈。まず?", ["酸素投与+造影CT(肺動脈相)", 10], "肺動脈の造影欠損を確認する。", [
      ["利尿薬を投与", 3, "病歴から肺塞栓を疑う。"],
      ["そのまま歩行訓練を継続", 5, "再塞栓の危険。"],
      ["鎮静薬で不安を取る", 3, "低酸素を不安だけで説明しない。"],
      ["胸部単純X線のみで判断", 5, "X線が正常でも否定できない。"],
    ]),
    step("肺血栓塞栓症と確定。血圧は保たれている。治療は?", ["抗凝固療法(ヘパリン)を開始", 5], "循環が安定していれば抗凝固が基本。", [
      ["抗血小板薬を内服", 3, "静脈血栓には抗凝固。"],
      ["経過観察のみ", 5, "再塞栓リスクを放置しない。"],
      ["ただちに外科的血栓摘除", 20, "循環破綻例で検討する。"],
      ["β遮断薬で頻脈を抑える", 3, "代償性頻脈を抑えない。"],
    ]),
  ]),
  makeCase("16歳男性", "右下腹部痛", "急性虫垂炎", true, 1, 60, [
    step("心窩部痛が右下腹部へ移動。McBurney点圧痛と反跳痛。まず?", ["腹部造影CT(またはエコー)", 10], "虫垂腫大、糞石、周囲脂肪織濃度上昇を確認。", [
      ["浣腸して排便を促す", 5, "穿孔を促す危険。"],
      ["上部消化管内視鏡", 15, "右下腹部を評価する。"],
      ["鎮痛薬を出して帰宅", 2, "穿孔の危険。"],
      ["頭部CT", 10, "検査部位が違う。"],
    ]),
    step("虫垂腫大+糞石+腹水。反跳痛も強い。方針は?", ["外科コール→緊急虫垂切除へ", 5], "穿孔を疑い外科へ連絡する。", [
      ["抗菌薬のみで帰宅", 3, "この所見では危険。"],
      ["下剤を処方", 2, "穿孔の危険。"],
      ["胃薬を出して様子見", 3, "診断に沿って治療する。"],
      ["整形外科へ紹介", 5, "紹介先が違う。"],
    ]),
  ]),
  makeCase("21歳男性", "飲み会後の意識朦朧", "急性アルコール中毒", false, 1, 55, [
    step("嘔吐し、呼びかけへの反応が鈍い。まず?", ["側臥位で気道確保+バイタル・血糖測定", 3], "吐物による窒息と低血糖を防ぐ。", [
      ["全例に胃洗浄", 10, "ルーチンの胃洗浄は推奨されない。"],
      ["友人に任せて帰宅", 2, "覚醒と安全を確認する。"],
      ["大声で怒鳴る", 2, "診療にならない。"],
      ["精神科に夜間コール", 5, "まず救急初期対応。"],
    ]),
    step("血糖正常、外傷なし、呼吸は安定。続いては?", ["輸液しつつモニターで覚醒まで経過観察", 5], "側臥位を維持し頭部外傷にも注意する。", [
      ["覚醒前だが歩かせて帰す", 2, "転倒・窒息の危険。"],
      ["鎮静薬を追加投与", 3, "呼吸抑制の危険。"],
      ["利尿薬で排泄を促進", 3, "脱水を悪化させる。"],
      ["説教を30分", 15, "覚醒後に短く指導する。"],
    ]),
  ]),
  makeCase("85歳女性", "夜間トイレで転倒", "大腿骨近位部骨折", false, 1, 60, [
    step("転倒後、股関節痛で立てない。下肢は短縮・外旋位。まず?", ["股関節X線(2方向)", 5], "大腿骨頸部骨折を確認する。", [
      ["湿布を貼って帰宅", 2, "歩行不能で帰宅は困難。"],
      ["徒手整復を試みる", 5, "まず画像診断。"],
      ["腰椎MRIを予約", 20, "股関節X線が先。"],
      ["頭部CTのみ撮って終了", 10, "股関節を評価する。"],
    ]),
    step("大腿骨頸部骨折(転位あり)。方針は?", ["整形外科コール→入院、疼痛管理し早期手術へ", 5], "早期手術は生命予後と歩行機能を改善する。", [
      ["ギプス固定して帰宅", 10, "頸部骨折はギプスで治らない。"],
      ["自宅で安静", 3, "長期臥床の合併症が問題。"],
      ["牽引のみで数週間保存", 5, "早期手術を検討する。"],
      ["今すぐ歩行訓練", 5, "骨折したまま歩かせない。"],
    ]),
  ]),
  makeCase("19歳女性", "手のしびれと呼吸が苦しい", "過換気症候群", false, 1, 45, [
    step("口論後から呼吸促迫、口唇・両手指のしびれ。SpO2 100%。まず?", ["落ち着いた声かけでゆっくり呼吸を誘導", 5], "安心させ呼吸数を落とす。", [
      ["ペーパーバッグ法を強制", 3, "低酸素リスクがあり推奨されない。"],
      ["高流量酸素を全開投与", 3, "酸素化は正常。"],
      ["ただちに鎮静薬を静注", 3, "まず非薬物的対応。"],
      ["気管挿管の準備", 10, "適応はない。"],
    ]),
    step("呼吸は落ち着いた。帰宅前にすべきことは?", ["心電図・採血で器質的疾患を除外", 8], "肺塞栓、喘息、不整脈などを除外する。", [
      ["気のせいと説明して即帰宅", 2, "器質的疾患を除外する。"],
      ["全身造影CT", 15, "リスクに見合わない。"],
      ["入院させて絶対安静", 5, "過剰対応。"],
      ["抗菌薬を点滴", 5, "感染所見がない。"],
    ]),
  ]),
  makeCase("35歳男性", "突然の左側腹部の激痛", "尿管結石", false, 1, 50, [
    step("突然の側腹部疝痛、肉眼的血尿、CVA叩打痛。まず?", ["NSAIDs投与+尿検査・エコー/CT", 8], "鎮痛しながら結石と水腎症を評価する。", [
      ["鎮痛せず検査結果を待つ", 10, "鎮痛を優先する。"],
      ["抗菌薬をまず点滴", 5, "発熱がなければ不要。"],
      ["ただちに開腹手術", 20, "侵襲的すぎる。"],
      ["痛み止めなしで帰宅", 2, "疼痛管理が必要。"],
    ]),
    step("尿管結石5mm、水腎症軽度、発熱なし。方針は?", ["疼痛管理+飲水指導、泌尿器科外来へ", 5], "自然排石が期待できる。", [
      ["深夜だが今すぐESWL", 15, "緊急適応ではない。"],
      ["入院して絶飲食", 5, "飲水を促す。"],
      ["緊急透析", 15, "適応がない。"],
      ["尿道カテーテルを留置", 5, "尿管閉塞には届かない。"],
    ]),
  ]),
  makeCase("28歳男性", "発熱と関節痛", "インフルエンザ", false, 1, 55, [
    step("流行期の発熱、関節痛、咽頭痛。バイタル安定。まず?", ["問診・診察+インフルエンザ迅速検査", 5], "流行状況と所見から検査する。", [
      ["全身造影CT", 15, "過剰検査。"],
      ["血液培養2セット+即入院", 10, "敗血症所見がない。"],
      ["広域抗菌薬を点滴", 5, "ウイルス感染には効かない。"],
      ["診察せず解熱剤だけ渡す", 2, "最低限の診察を行う。"],
    ]),
    step("A型陽性、重症化リスクなし。方針は?", ["抗インフルエンザ薬+対症療法、悪化時再診を指導", 3], "帰宅時には再診基準を伝える。", [
      ["念のため1週間入院", 5, "入院適応はない。"],
      ["広域抗菌薬を処方", 3, "二次感染所見がない。"],
      ["ステロイドを大量投与", 3, "適応がない。"],
      ["解熱するまで院内待機", 10, "帰宅基準を満たす。"],
    ]),
  ]),
  makeCase("61歳男性", "引き裂かれるような胸背部痛", "急性大動脈解離(Stanford A)", true, 2, 30, [
    step("突然の胸背部痛、血圧左右差、心電図にST変化なし。まず?", ["造影CT(胸腹部)", 10], "上行大動脈の解離フラップを確認。", [
      ["アスピリン+ヘパリン投与", 3, "解離に抗血栓薬は危険。"],
      ["硝酸薬だけで様子見", 5, "診断を急ぐ。"],
      ["運動負荷心電図", 15, "解離疑いでは危険。"],
      ["鎮痛薬で帰宅", 2, "緊急疾患。"],
    ]),
    step("Stanford A型解離。初期対応は?", ["降圧・徐拍化と十分な鎮痛", 5], "血圧と心拍を厳格に管理する。", [
      ["血栓溶解療法", 5, "禁忌。"],
      ["昇圧薬で血圧を上げる", 3, "解離を進展させる。"],
      ["抗血小板薬を追加", 3, "出血性病態。"],
      ["経口降圧薬で帰宅", 2, "入院管理が必要。"],
    ]),
    step("降圧を開始した。確定方針は?", ["心臓血管外科コール→緊急手術", 5], "A型解離は緊急手術適応。", [
      ["B型と同様に保存的治療", 5, "A型は手術。"],
      ["朝のカンファレンスで相談", 10, "待てない。"],
      ["カテーテルでPCI", 10, "冠動脈疾患ではない。"],
      ["帰宅させ外来紹介", 2, "論外。"],
    ]),
  ]),
  makeCase("23歳男性", "発熱を伴う激しい頭痛", "細菌性髄膜炎", true, 2, 40, [
    step("発熱、激しい頭痛、嘔吐、項部硬直、意識混濁。まず?", ["血液培養→頭部CT→腰椎穿刺", 12], "意識障害があればCTで安全性を確認して髄液検査へ。", [
      ["CTなしで腰椎穿刺", 8, "ヘルニアの危険を評価する。"],
      ["鎮痛薬を出して帰宅", 2, "未治療では致死的。"],
      ["MRIを翌週予約", 5, "時間単位で進行する。"],
      ["抗ヒスタミン薬投与", 3, "病態が違う。"],
    ]),
    step("細菌性髄膜炎が強く疑われる。次は?", ["経験的抗菌薬(+ステロイド)をただちに開始", 5], "培養結果を待たず経験的治療を始める。", [
      ["培養結果まで待機", 10, "治療遅延は予後を悪化させる。"],
      ["抗ウイルス薬のみ", 5, "細菌性を示唆する。"],
      ["解熱薬のみ", 5, "感染を治療できない。"],
      ["帰宅して内服フォロー", 2, "入院治療が必要。"],
    ]),
  ]),
  makeCase("26歳女性", "喘鳴と呼吸困難", "気管支喘息発作", true, 1, 30, [
    step("喘鳴と呼吸困難。蕁麻疹なし、血圧正常、喘息既往。SpO2 92%。まず?", ["SABA吸入+酸素", 5], "喘息発作の第一選択。", [
      ["アドレナリン筋注", 2, "アナフィラキシー所見がない。"],
      ["鎮静薬", 3, "呼吸抑制の危険。"],
      ["胸部造影CT", 10, "まず治療。"],
      ["帰宅", 2, "低酸素がある。"],
    ]),
    step("吸入を反復したが喘鳴が残る。次は?", ["全身性ステロイドを追加", 8], "中等度以上では全身性ステロイドを併用する。", [
      ["ただちに気管挿管", 10, "現時点では過剰。"],
      ["β遮断薬", 3, "気管支攣縮を悪化させる。"],
      ["抗菌薬点滴", 5, "感染所見がない。"],
      ["そのまま帰宅", 2, "症状が残っている。"],
    ]),
  ]),
  makeCase("45歳男性", "左前胸部刺創後のショック", "心タンポナーデ", true, 2, 15, [
    step("刺創、頸静脈怒張、低血圧、心音減弱。呼吸音左右差なし。まず?", ["ベッドサイドで心エコー(FAST)", 3], "Beck三徴から心タンポナーデを疑う。", [
      ["胸腔穿刺で脱気", 2, "呼吸音左右差がない。"],
      ["大量輸液だけで粘る", 5, "物理的圧迫の解除が必要。"],
      ["CT室へ直行", 10, "ショック患者はベッドサイド評価。"],
      ["経過観察", 3, "分単位で進行する。"],
    ]),
    step("心嚢液で右室が虚脱。対応は?", ["心嚢穿刺+外科コール", 8], "閉塞性ショックを解除し外科治療を準備する。", [
      ["利尿薬", 3, "前負荷低下で悪化する。"],
      ["鎮静のみ", 5, "原因治療にならない。"],
      ["抗菌薬", 5, "感染症ではない。"],
      ["帰宅", 2, "緊急治療が必要。"],
    ]),
  ]),
  makeCase("78歳女性", "突然の片麻痺と意識障害", "低血糖発作", false, 1, 25, [
    step("インスリン使用中。夕食を抜いた後、片麻痺と意識低下。まず?", ["血糖測定", 1], "低血糖は脳卒中を模倣する。", [
      ["頭部CTへ直行", 10, "血糖は1分で測定できる。"],
      ["t-PAの準備", 5, "血糖確認が先。"],
      ["抗血小板薬", 3, "診断前に投与しない。"],
      ["朝まで様子見", 5, "遷延低血糖は脳障害を残す。"],
    ]),
    step("血糖32mg/dL。対応は?", ["50%ブドウ糖を静注", 2], "投与後の症状改善を確認し原因を振り返る。", [
      ["インスリンを追加", 2, "逆の治療。"],
      ["飴を舐めさせる", 3, "意識障害時は誤嚥する。"],
      ["頭部MRIを先に", 20, "治療を優先。"],
      ["帰宅", 2, "再発予防が必要。"],
    ]),
  ]),
  makeCase("42歳男性", "嘔吐を繰り返した後の吐血", "マロリーワイス症候群", false, 1, 50, [
    step("飲酒後に反復嘔吐し、後から鮮血が混じった。バイタル安定。まず?", ["ルート確保+上部内視鏡", 8], "噴門部の粘膜裂創を確認する。", [
      ["大量輸血を開始", 5, "重症度を評価してから。"],
      ["S-Bチューブ", 10, "静脈瘤ではない。"],
      ["制吐薬だけで帰宅", 2, "出血源を確認する。"],
      ["緊急開腹手術", 20, "まず内視鏡。"],
    ]),
    step("裂創からの出血はほぼ自然止血。方針は?", ["制吐・経過観察(再出血ならクリップ止血)", 5], "多くは保存的に止血する。", [
      ["予防的に胃切除", 20, "過剰治療。"],
      ["抗凝固薬を開始", 3, "再出血を促す。"],
      ["飲酒を続けてOKと説明", 2, "誘因を指導する。"],
      ["ICU入室", 5, "重症度に見合わない。"],
    ]),
  ]),
  makeCase("52歳女性", "右季肋部痛と発熱", "急性胆嚢炎", true, 1, 55, [
    step("脂っこい食事後の右季肋部痛、発熱、Murphy徴候陽性。まず?", ["採血+腹部エコー", 8], "胆嚢壁肥厚、腫大、嵌頓結石を確認する。", [
      ["緊急ERCP", 15, "胆管閉塞ではない。"],
      ["頭部CT", 10, "腹部を評価する。"],
      ["鎮痛薬で帰宅", 2, "重症化の危険。"],
      ["上部内視鏡", 15, "エコーが先。"],
    ]),
    step("急性胆嚢炎(中等症)。方針は?", ["抗菌薬+外科コール、早期腹腔鏡下胆嚢摘出", 8], "早期胆摘を検討する。", [
      ["抗菌薬を処方して帰宅", 3, "再燃リスクが高い。"],
      ["ウルソで溶解", 3, "急性期治療ではない。"],
      ["全例に胆嚢ドレナージ", 10, "高リスク例で検討する。"],
      ["朝まで放置", 5, "壊疽・穿孔の危険。"],
    ]),
  ]),
  makeCase("82歳男性", "数日続く傾眠と著明な脱水", "高浸透圧高血糖状態", true, 2, 45, [
    step("著明な脱水、血糖920mg/dL、尿ケトン陰性。まず?", ["生理食塩水で大量輸液", 5], "HHSでは高度脱水の補正を優先する。", [
      ["インスリン大量ボーラス", 3, "急激な浸透圧変化は危険。"],
      ["ブドウ糖", 3, "初期対応ではない。"],
      ["利尿薬", 3, "脱水を悪化させる。"],
      ["経過観察", 5, "死亡率の高い病態。"],
    ]),
    step("輸液開始後の対応は?", ["少量インスリン持続+電解質・浸透圧を緩徐に補正", 5], "急速補正を避ける。", [
      ["血糖を1時間で正常化", 3, "補正が速すぎる。"],
      ["重炭酸を大量投与", 5, "適応がない。"],
      ["経口血糖降下薬", 3, "効果が間に合わない。"],
      ["帰宅", 2, "入院治療が必要。"],
    ]),
  ]),
  makeCase("19歳男性", "突然の胸痛と呼吸困難", "自然気胸", true, 1, 45, [
    step("長身痩せ型。突然の胸痛と軽い呼吸困難。バイタル安定。まず?", ["胸部X線", 5], "自然気胸を画像で確認する。", [
      ["造影CTで肺塞栓検索", 10, "検査前確率が低い。"],
      ["ただちに胸腔穿刺", 2, "緊張性所見がない。"],
      ["心電図だけで帰宅", 3, "胸部画像が必要。"],
      ["鎮痛のみ", 2, "原因を評価する。"],
    ]),
    step("中等度の肺虚脱を確認。方針は?", ["胸腔ドレナージ", 8], "中等度以上ならドレナージを検討する。", [
      ["帰宅して自然吸収を待つ", 2, "虚脱が大きい。"],
      ["即開胸手術", 20, "まずドレーン。"],
      ["陽圧換気", 5, "気胸を悪化させる。"],
      ["酸素だけで朝まで", 5, "不十分。"],
    ]),
  ]),
  makeCase("27歳女性", "右下腹部痛とふらつき", "異所性妊娠破裂", true, 2, 25, [
    step("突然の右下腹部痛、顔面蒼白、血圧88/60。最終月経7週前。まず?", ["妊娠反応検査+経腟/腹部エコー", 6], "妊娠可能年齢の腹痛では妊娠を確認する。", [
      ["虫垂炎としてCTへ直行", 10, "妊娠除外が先。"],
      ["鎮痛して帰宅", 2, "出血が進行する。"],
      ["浣腸", 5, "危険。"],
      ["整形外科へ紹介", 5, "病態が違う。"],
    ]),
    step("腹腔内出血を伴う異所性妊娠破裂。方針は?", ["輸液・輸血準備+産婦人科コール→緊急手術", 6], "出血性ショック完成前に手術へ。", [
      ["メトトレキサート療法", 5, "未破裂・安定例の選択肢。"],
      ["経過観察入院", 5, "出血が続く。"],
      ["鎮痛のみ", 3, "止血できない。"],
      ["帰宅", 2, "論外。"],
    ]),
  ]),
  makeCase("1歳6か月男児", "発熱に伴うけいれん", "熱性けいれん(単純型)", true, 1, 40, [
    step("39℃に伴う全身性けいれんが3分で自然頓挫。来院時は啼泣あり。まず?", ["バイタル確認と全身診察", 5], "髄膜炎を示唆する所見がないか確認する。", [
      ["ただちに頭部CT", 10, "単純型でルーチン画像は不要。"],
      ["抗けいれん薬を予防静注", 3, "既に頓挫している。"],
      ["全例に腰椎穿刺", 10, "疑う所見がある場合に行う。"],
      ["診察せず帰宅", 2, "最低限の評価が必要。"],
    ]),
    step("髄膜刺激徴候なし、機嫌も回復。方針は?", ["保護者へ説明し再発時対応を指導して帰宅", 5], "単純型は予後良好。十分に説明する。", [
      ["念のため気管挿管", 10, "適応がない。"],
      ["抗菌薬を点滴", 5, "細菌感染所見がない。"],
      ["1週間入院", 5, "過剰対応。"],
      ["説明なしで帰す", 2, "再発時対応を指導する。"],
    ]),
  ]),
  makeCase("67歳男性", "頭痛と嘔気(同居の妻も同症状)", "一酸化炭素中毒", true, 2, 35, [
    step("冬の深夜、夫婦で頭痛・嘔気。石油ストーブを使用。SpO2 98%。まず?", ["高流量酸素+CO-Hb測定", 5], "パルスオキシメータではCO-Hbを識別できない。", [
      ["SpO2正常なので帰宅", 2, "SpO2は当てにならない。"],
      ["頭部CTのみ", 10, "環境曝露を考える。"],
      ["制吐薬で様子見", 5, "原因治療が必要。"],
      ["感冒として対症療法", 3, "家族内同時発症に注目。"],
    ]),
    step("CO-Hb高値、意識清明。続いては?", ["高濃度酸素を継続(重症なら高気圧酸素療法)", 8], "遅発性脳症のフォローも考える。", [
      ["軽快したので酸素中止し即帰宅", 2, "まだ早い。"],
      ["抗菌薬", 5, "感染症ではない。"],
      ["利尿薬", 3, "排泄経路は呼気。"],
      ["鎮静して入眠", 3, "意識変化を追えない。"],
    ]),
  ]),
  makeCase("34歳男性", "頭部打撲後、回復してからの意識障害", "急性硬膜外血腫", true, 2, 25, [
    step("側頭部打撲後に一度会話できたが、1時間後に意識低下と瞳孔散大。まず?", ["頭部CTを大至急", 8], "意識清明期からの急速悪化は硬膜外血腫を疑う。", [
      ["MRIを予約して待つ", 20, "緊急CTが必要。"],
      ["経過観察", 5, "ヘルニア徴候がある。"],
      ["腰椎穿刺", 10, "頭蓋内圧亢進時は禁忌。"],
      ["鎮痛のみ", 3, "緊急病態。"],
    ]),
    step("凸レンズ型血腫、正中偏位あり。方針は?", ["脳外科コール→緊急開頭血腫除去", 6], "手術が間に合えば予後改善が期待できる。", [
      ["朝まで待機", 10, "待てない。"],
      ["抗凝固薬", 3, "出血を促進する。"],
      ["浸透圧利尿薬のみ", 5, "根本治療は手術。"],
      ["帰宅", 2, "ありえない。"],
    ]),
  ]),
  makeCase("58歳女性", "頭を動かすと起こる回転性めまい", "良性発作性頭位めまい症", false, 1, 60, [
    step("寝返りで数十秒の回転性めまい。難聴・耳鳴・麻痺なし。まず?", ["神経学的診察+Dix-Hallpike試験", 8], "中枢性所見を除外し頭位眼振を確認する。", [
      ["全例に頭部MRI", 20, "まず診察と誘発試験。"],
      ["制吐薬だけで帰宅", 3, "診断をつける。"],
      ["抗菌薬点滴", 5, "感染所見なし。"],
      ["入院して絶対安静", 5, "安静は逆効果になりうる。"],
    ]),
    step("後半規管型BPPV。対応は?", ["Epley法(耳石置換法)", 6], "耳石置換法で改善を図る。", [
      ["手術", 15, "不要。"],
      ["ステロイド大量投与", 5, "突発性難聴ではない。"],
      ["頭を1週間固定", 3, "耳石置換が治療。"],
      ["利尿薬", 3, "メニエール病ではない。"],
    ]),
  ]),
  makeCase("39歳男性", "刺身を食べた数時間後の激しい腹痛", "アニサキス症", false, 1, 55, [
    step("サバの刺身後、数時間で激しい心窩部痛と嘔気。まず?", ["食事歴確認+緊急上部内視鏡", 10], "胃壁に刺入する虫体を確認する。", [
      ["抗菌薬点滴", 5, "細菌ではない。"],
      ["制酸薬で帰宅", 2, "虫体は除去できない。"],
      ["緊急開腹手術", 20, "侵襲的すぎる。"],
      ["浣腸", 5, "部位が違う。"],
    ]),
    step("胃体部に虫体を確認。対応は?", ["内視鏡的に鉗子で虫体を摘除", 8], "虫体を摘除する。", [
      ["駆虫薬を内服", 3, "確実な薬物治療はない。"],
      ["数日経過観察", 5, "目の前にいれば摘除する。"],
      ["胃切除", 20, "過剰治療。"],
      ["そのまま帰宅", 2, "摘除して症状改善を図る。"],
    ]),
  ]),
];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const fmtClock = (gameSec, startMin) => {
  const total = startMin + Math.floor(gameSec / 60);
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};
const rand = (n) => Math.floor(Math.random() * n);
const pushLog = (log, msg) => [msg, ...log].slice(0, 4);
const newGame = (modeId = "short") => {
  const mode = GAME_MODES[modeId] ?? GAME_MODES.short;
  return ({
  phase: "play", t: 0, praise: 0, bad: 0,
  modeId: mode.id,
  modeTitle: mode.title,
  shiftStartMin: mode.startMin,
  shiftSec: mode.shiftSec,
  endClock: mode.endClock,
  realMinutes: mode.realMinutes,
  beds: [null, null, null, null], incoming: null,
  order: shuffle(CASES.map((_, i) => i)), ci: 0,
  nextSpawnAt: 60 + rand(120), emptySince: 0, focus: 0, fx: null, log: [],
  stats: { treated: 0, refused: 0, crashed: 0, wrongs: 0, picks: 0, done: [] },
  });
};

export default function NightShiftER() {
  const [g, setG] = useState({ phase: "title" });
  const intervalRef = useRef(null);

  useEffect(() => {
    if (g.phase !== "play") return undefined;
    intervalRef.current = setInterval(() => setG((prev) => tick(prev)), TICK_MS);
    return () => clearInterval(intervalRef.current);
  }, [g.phase]);

  const tick = (s) => {
    if (s.phase !== "play") return s;
    const n = {
      ...s, t: s.t + SEC_PER_TICK, beds: [...s.beds], log: [...s.log],
      stats: { ...s.stats, done: [...s.stats.done] },
    };
    if (n.t >= n.shiftSec) return { ...n, phase: "end" };
    if (n.incoming && n.t >= n.incoming.deadline) {
      const c = CASES[n.incoming.caseIdx];
      n.bad += 1; n.stats.refused += 1;
      n.log = pushLog(n.log, `⛔ ${c.chief}の受け入れを断った(残念+1)`);
      n.incoming = null; n.nextSpawnAt = n.t + 450 + rand(300);
    }
    n.beds = n.beds.map((bed) => {
      if (!bed) return bed;
      const b = { ...bed };
      if (b.action && n.t >= b.action.endsAt) {
        const picked = b.steps[b.stepIdx].opts[b.action.optIdx];
        n.stats.picks += 1;
        if (picked.ok) {
          b.feedback = { ok: true, text: picked.fb };
          if (b.stepIdx >= b.steps.length - 1) {
            n.praise += b.case.diff; n.stats.treated += 1;
            n.stats.done.push({ dx: b.case.dx, ok: true });
            n.log = pushLog(n.log, `✅ ${b.case.dx}を完遂(褒め+${b.case.diff})`);
            n.fx = { type: "good", text: b.case.dx, until: n.t + 55 };
            return null;
          }
          b.stepIdx += 1;
        } else {
          n.stats.wrongs += 1; b.mistakes += 1; b.limit -= 300;
          b.feedback = { ok: false, text: picked.fb };
        }
        b.action = null;
      }
      if (n.t - b.arrivedAt > b.limit) {
        n.bad += 2; n.stats.crashed += 1;
        n.stats.done.push({ dx: b.case.dx, ok: false });
        n.log = pushLog(n.log, `🚨 ${b.case.dx}の患者が急変、ICUへ(残念+2)`);
        n.fx = { type: "crash", text: b.case.dx, until: n.t + 70 };
        return null;
      }
      return b;
    });
    const score = n.praise - n.bad;
    const fever = score > 5;
    const occupied = n.beds.filter(Boolean).length;
    if (occupied > 0 || n.incoming) n.emptySince = n.t;
    if (!n.incoming) {
      const mustSpawn = (occupied === 0 && n.t - n.emptySince >= 240)
        || (fever && occupied < 3) || n.t >= n.nextSpawnAt;
      if (mustSpawn) {
        n.incoming = { caseIdx: n.order[n.ci % n.order.length], deadline: n.t + INCOMING_WAIT };
        n.ci += 1;
        if (n.ci % n.order.length === 0) n.order = shuffle(n.order);
        n.nextSpawnAt = n.t + (fever ? 350 + rand(250) : 700 + rand(500));
      }
    }
    if (score <= -5) return { ...n, phase: "over" };
    return n;
  };

  const start = (modeId) => setG(newGame(modeId));
  const retry = () => setG(newGame(g.modeId ?? "short"));
  const accept = (bedIdx) => setG((s) => {
    if (!s.incoming || s.beds[bedIdx]) return s;
    const c = CASES[s.incoming.caseIdx];
    const beds = [...s.beds];
    beds[bedIdx] = {
      case: c, steps: c.steps.map((st) => ({ ...st, opts: shuffle(st.opts) })),
      stepIdx: 0, arrivedAt: s.t, limit: c.limit * 60,
      action: null, feedback: null, mistakes: 0,
    };
    return { ...s, beds, incoming: null, focus: bedIdx };
  });
  const refuse = () => setG((s) => {
    if (!s.incoming) return s;
    const c = CASES[s.incoming.caseIdx];
    return {
      ...s, incoming: null, nextSpawnAt: s.t + 450 + rand(300), bad: s.bad + 1,
      stats: { ...s.stats, refused: s.stats.refused + 1 },
      log: pushLog(s.log, `⛔ ${c.chief}の受け入れを断った(残念+1)`),
    };
  });
  const choose = (bedIdx, optIdx) => setG((s) => {
    const bed = s.beds[bedIdx];
    if (!bed || bed.action) return s;
    const picked = bed.steps[bed.stepIdx].opts[optIdx];
    const beds = [...s.beds];
    beds[bedIdx] = {
      ...bed, feedback: null,
      action: { optIdx, startedAt: s.t, endsAt: s.t + picked.t * 60, label: picked.l },
    };
    return { ...s, beds };
  });

  if (g.phase === "title") return <TitleScreen onStart={start} />;
  if (g.phase === "over") return <ResultScreen g={g} fired onRetry={retry} />;
  if (g.phase === "end") return <ResultScreen g={g} onRetry={retry} />;

  const score = g.praise - g.bad;
  const fever = score > 5;
  const focusBed = g.beds[g.focus];
  return (
    <div className="min-h-screen text-slate-200 font-sans flex flex-col" style={{ backgroundColor: score <= -3 ? "#2b0609" : "#020617", transition: "background-color .8s ease" }}>
      <GlobalStyles />
      <header className="bg-slate-900 border-b border-slate-800 px-3 py-2 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Ecg width={54} height={22} />
            <span className="font-mono text-emerald-400 text-xl font-bold tracking-wider">{fmtClock(g.t, g.shiftStartMin)}</span>
            <span className="text-slate-500 text-[10px] leading-tight">{g.modeTitle}<br />終了 {g.endClock}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-amber-300">褒め <b className="font-mono">{g.praise}</b></span>
            <span className="text-rose-400">残念 <b className="font-mono">{g.bad}</b></span>
            <div className="text-center">
              <div className={`font-mono text-lg font-bold ${score < 0 ? "text-rose-400" : "text-emerald-400"}`}>{score >= 0 ? `+${score}` : score}</div>
              <div className="text-[9px] text-slate-500 -mt-1">院長メーター(−5で終了)</div>
            </div>
          </div>
        </div>
        <div className="mt-1.5 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500/70" style={{ width: `${(g.t / g.shiftSec) * 100}%` }} />
        </div>
      </header>
      {g.fx && g.t < g.fx.until && <FxOverlay fx={g.fx} />}
      {g.incoming && <IncomingBanner incoming={g.incoming} t={g.t} beds={g.beds} onAccept={accept} onRefuse={refuse} />}
      <div className="grid grid-cols-4 gap-1.5 px-2 pt-2">
        {g.beds.map((bed, i) => <BedTab key={i} idx={i} bed={bed} t={g.t} active={g.focus === i} onClick={() => setG((s) => ({ ...s, focus: i }))} />)}
      </div>
      <main className="flex-1 px-2 py-2">
        {focusBed
          ? <CasePanel bed={focusBed} bedIdx={g.focus} t={g.t} onChoose={choose} />
          : <div className="h-40 flex items-center justify-center text-slate-600 text-sm border border-dashed border-slate-800 rounded-xl">ベッド{g.focus + 1}は空床</div>}
        {fever && <FeverStrip />}
      </main>
      <footer className="px-3 pb-3 space-y-0.5">
        {g.log.map((m, i) => <div key={`${m}-${i}`} className={`text-[11px] ${i === 0 ? "text-slate-300" : "text-slate-600"}`}>{m}</div>)}
      </footer>
    </div>
  );
}

function GlobalStyles() {
  return <style>{`
    @keyframes ecg { to { stroke-dashoffset: -240; } }
    .ecg-line { stroke-dasharray: 60 180; animation: ecg 2.4s linear infinite; }
    @keyframes pulseSoft { 0%,100% { opacity: 1; } 50% { opacity: .55; } }
    .pulse-soft { animation: pulseSoft 1.2s ease-in-out infinite; }
    @keyframes fxPop { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
    .fx-pop { animation: fxPop .45s cubic-bezier(.2,1.4,.4,1) both; }
    @keyframes fxShake { 0%,100% { transform: translateX(0); } 15%,45%,75% { transform: translateX(-7px); } 30%,60%,90% { transform: translateX(7px); } }
    .fx-shake { animation: fxShake .55s linear both; }
    @keyframes fxFade { from { opacity: 1; } to { opacity: 0; } }
    .fx-bg { animation: fxFade 1.8s ease-out both; }
    @keyframes fxLine { to { stroke-dashoffset: 0; } }
    .fx-line { stroke-dasharray: 420; stroke-dashoffset: 420; animation: fxLine 1.1s linear forwards; }
    @keyframes ambRun { from { left: -14%; } to { left: 104%; } }
    .amb-run { animation: ambRun 2.6s linear infinite; }
    .amb-run2 { animation-delay: 1.3s; }
    @media (prefers-reduced-motion: reduce) { .ecg-line,.pulse-soft,.fx-pop,.fx-shake,.fx-bg,.fx-line,.amb-run { animation: none !important; } }
  `}</style>;
}
function Ecg({ width, height }) {
  return <svg width={width} height={height} viewBox="0 0 120 40" className="shrink-0"><path className="ecg-line" d="M0,24 H18 q3,-6 6,0 h4 l1.5,2.5 l2.5,-19 l2.5,23 l1.5,-6.5 h7 q5,-9 10,0 H120" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinejoin="round" /></svg>;
}
function FxOverlay({ fx }) {
  const good = fx.type === "good";
  return <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
    <div className={`absolute inset-0 ${good ? "bg-emerald-400/15" : "bg-rose-600/30"} fx-bg`} />
    <div className={`relative text-center px-4 ${good ? "fx-pop" : "fx-shake"}`}>
      {good ? <div className="text-5xl">🩺</div> : <svg width="250" height="44" viewBox="0 0 250 44" className="mx-auto"><polyline className="fx-line" points="0,22 55,22 66,6 78,40 88,22 250,22" fill="none" stroke="#fb7185" strokeWidth="3" /></svg>}
      <div className={`text-2xl sm:text-3xl font-black tracking-wider ${good ? "text-emerald-300" : "text-rose-300"}`}>{good ? "GOOD DOCTOR!" : "急変 — ICU搬送"}</div>
      <div className={`text-sm mt-1 bg-slate-900/80 rounded-full px-3 py-1 inline-block ${good ? "text-emerald-100" : "text-rose-100"}`}>{good ? "✓" : "✗"} {fx.text} {good ? "を完遂" : "の管理に失敗(残念+2)"}</div>
    </div>
  </div>;
}
function FeverStrip() {
  return <div className="mt-2 rounded-xl border border-amber-500/50 bg-amber-950/30 overflow-hidden">
    <div className="flex items-center justify-between px-3 pt-1.5"><span className="text-amber-300 font-black text-sm tracking-widest pulse-soft">🔥 FEVER TIME</span><span className="text-[10px] text-amber-200/70">救急隊が殺到中(常時3床以上稼働)</span></div>
    <div className="relative h-9"><div className="absolute bottom-1 left-0 right-0 border-b-2 border-dashed border-slate-600/60" /><div className="absolute bottom-2 text-2xl amb-run" style={{ transform: "scaleX(-1)" }}>🚑</div><div className="absolute bottom-2 text-2xl amb-run amb-run2" style={{ transform: "scaleX(-1)" }}>🚑</div></div>
  </div>;
}
function IncomingBanner({ incoming, t, beds, onAccept, onRefuse }) {
  const c = CASES[incoming.caseIdx];
  const remain = Math.max(0, incoming.deadline - t);
  const freeBeds = beds.map((b, i) => (b ? null : i)).filter((x) => x !== null);
  return <div className="mx-2 mt-2 rounded-xl border border-amber-500/60 bg-amber-950/40 p-3 pulse-soft">
    <div className="flex items-center justify-between"><div className="text-amber-300 font-bold text-sm">📞 救急隊から受入要請</div><div className="font-mono text-amber-200 text-xs">応答まで {Math.ceil(remain / 60)}分</div></div>
    <div className="text-slate-200 text-sm mt-1">{c.name}・{c.chief}</div>
    <div className="flex flex-wrap gap-1.5 mt-2">
      {freeBeds.map((i) => <button key={i} onClick={() => onAccept(i)} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm font-bold transition">ベッド{i + 1}へ収容</button>)}
      <button onClick={onRefuse} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-rose-700 text-slate-200 text-sm transition">断る(残念+1)</button>
      {freeBeds.length === 0 && <span className="text-rose-300 text-xs self-center">満床…</span>}
    </div>
  </div>;
}
function BedTab({ idx, bed, t, active, onClick }) {
  const base = `rounded-lg p-1.5 text-left transition border ${active ? "border-emerald-400 bg-slate-800" : "border-slate-800 bg-slate-900 hover:bg-slate-800/60"}`;
  if (!bed) return <button onClick={onClick} className={base}><div className="text-[10px] text-slate-500">BED {idx + 1}</div><div className="text-xs text-slate-600 mt-1">空床</div><div className="h-1 mt-1.5" /></button>;
  const remain = Math.max(0, bed.arrivedAt + bed.limit - t);
  const ratio = remain / bed.limit;
  const barColor = ratio > 0.5 ? "bg-emerald-500" : ratio > 0.25 ? "bg-amber-500" : "bg-rose-500";
  return <button onClick={onClick} className={base}>
    <div className="text-[10px] text-slate-500 flex justify-between"><span>BED {idx + 1}</span>{bed.action && <span className="text-sky-400">処置中</span>}</div>
    <div className="text-[11px] text-slate-200 truncate mt-0.5">{bed.case.chief}</div>
    <div className="h-1 mt-1.5 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${barColor}`} style={{ width: `${Math.max(0, Math.min(100, ratio * 100))}%` }} /></div>
  </button>;
}
function CasePanel({ bed, bedIdx, t, onChoose }) {
  const current = bed.steps[bed.stepIdx];
  const remain = Math.max(0, bed.arrivedAt + bed.limit - t);
  return <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
    <div className="flex items-start justify-between gap-2">
      <div><div className="text-sm font-bold text-slate-100">{bed.case.name}「{bed.case.chief}」</div><div className="text-[10px] text-slate-500 mt-0.5">STEP {bed.stepIdx + 1}/{bed.steps.length}{bed.mistakes > 0 && <span className="text-rose-400 ml-2">判断ミス×{bed.mistakes}</span>}</div></div>
      <div className={`font-mono text-xs px-2 py-1 rounded ${remain < 600 ? "bg-rose-950 text-rose-300" : "bg-slate-800 text-slate-400"}`}>急変まで {Math.ceil(remain / 60)}分</div>
    </div>
    {bed.feedback && <div className={`mt-2 text-xs rounded-lg p-2 border ${bed.feedback.ok ? "border-emerald-700 bg-emerald-950/50 text-emerald-200" : "border-rose-700 bg-rose-950/50 text-rose-200"}`}>{bed.feedback.ok ? "○ " : "✕ 容態悪化(猶予−5分)。"}{bed.feedback.text}</div>}
    {bed.action ? <ActionProgress action={bed.action} t={t} /> : <>
      <p className="text-sm text-slate-300 mt-3 leading-relaxed">{current.q}</p>
      <div className="mt-2 space-y-1.5">{current.opts.map((o, i) => <button key={`${o.l}-${i}`} onClick={() => onChoose(bedIdx, i)} className="w-full flex items-center justify-between gap-2 text-left px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.99] border border-slate-700 transition"><span className="text-sm text-slate-100">{o.l}</span><span className="font-mono text-[11px] text-sky-300 shrink-0">⏱{o.t}分</span></button>)}</div>
    </>}
  </div>;
}
function ActionProgress({ action, t }) {
  const total = action.endsAt - action.startedAt;
  const done = Math.min(1, (t - action.startedAt) / total);
  return <div className="mt-4 mb-2"><div className="text-sm text-sky-300 mb-2">「{action.label}」を実施中…</div><div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-sky-500 transition-all" style={{ width: `${done * 100}%` }} /></div><div className="text-[10px] text-slate-500 mt-1 text-right">残り{Math.ceil((action.endsAt - t) / 60)}分(院内時間)</div></div>;
}
function TitleScreen({ onStart }) {
  return <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center px-5 py-8">
    <GlobalStyles /><Ecg width={220} height={50} />
    <h1 className="text-2xl sm:text-3xl font-black tracking-[0.12em] mt-2">夜間当直シミュレーター</h1>
    <p className="text-emerald-400 font-mono text-xs mt-1 tracking-[0.3em]">CHOOSE YOUR NIGHT SHIFT</p>
    <div className="mt-7 w-full max-w-md space-y-3 text-base text-slate-300">
      <Rule icon="🛏️" text="救急外来のベッドは4床。受入要請が来たら空床へ収容する。" />
      <Rule icon="⏱️" text="現実の1秒=院内の30秒。処置にはそれぞれ時間がかかる。" />
      <Rule icon="🩺" text="5つの選択肢から処置を選ぶ。誤った判断は時間を浪費し、容態が悪化する。" />
      <Rule icon="📈" text="完遂で褒めポイント。受入拒否や急変で残念ポイント。" />
      <Rule icon="🚑" text="スコアが+5を超えるとフィーバータイム。" />
      <Rule icon="💢" text="スコア−3で背景が赤くなり、−5で院長室へ呼び出し。" />
    </div>
    <div className="mt-8 w-full max-w-md grid sm:grid-cols-2 gap-3">
      <ModeButton
        title="ショート当直"
        hours="22:00 → 翌03:00"
        duration="現実10分"
        description="従来のテンポで遊べる短時間モード"
        onClick={() => onStart("short")}
      />
      <ModeButton
        title="フル当直"
        hours="17:00 → 翌08:00"
        duration="現実30分"
        description="夕方から朝の引き継ぎまで走り切る長時間モード"
        onClick={() => onStart("full")}
        full
      />
    </div>
    <p className="text-[10px] text-slate-600 mt-4">30症例・国試範囲+実臨床あるある</p>
  </div>;
}
function ModeButton({ title, hours, duration, description, onClick, full }) {
  return <button onClick={onClick} className={`rounded-xl border p-4 text-left active:scale-[0.98] transition shadow-lg ${full ? "border-amber-500/60 bg-amber-950/30 hover:bg-amber-900/40 shadow-amber-950/40" : "border-emerald-500/50 bg-emerald-950/30 hover:bg-emerald-900/40 shadow-emerald-950/40"}`}>
    <div className={`text-base font-black ${full ? "text-amber-300" : "text-emerald-300"}`}>{full ? "🌅 " : "🌙 "}{title}</div>
    <div className="font-mono text-sm text-slate-100 mt-1">{hours}</div>
    <div className="text-xs text-sky-300 mt-1">プレイ時間: {duration}</div>
    <div className="text-[11px] text-slate-400 mt-2 leading-relaxed">{description}</div>
  </button>;
}
function Rule({ icon, text }) {
  return <div className="flex gap-2.5 items-start"><span className="shrink-0">{icon}</span><span className="leading-snug">{text}</span></div>;
}
function ResultScreen({ g, fired, onRetry }) {
  const score = g.praise - g.bad;
  const { treated, refused, crashed, wrongs, picks } = g.stats;
  const acc = picks > 0 ? Math.round(((picks - wrongs) / picks) * 100) : 0;
  const rank = fired ? "—" : score >= 12 ? "S" : score >= 8 ? "A" : score >= 4 ? "B" : score >= 0 ? "C" : "D";
  const rankMsg = { S: "院長「君に病院を継いでほしい」", A: "院長「素晴らしい当直だった」", B: "院長「まずまずだな」", C: "院長「…次に期待する」", D: "院長「明日、院長室へ」", "—": "" }[rank];
  return <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center px-5 py-10">
    {fired ? <><div className="text-5xl">💢</div><h1 className="text-2xl font-black mt-3 text-rose-400">院長室へ呼び出し</h1><p className="text-sm text-slate-400 mt-2 text-center">残念ポイントが溜まりすぎた。<br />当直は途中交代となった…</p></> : <><div className="font-mono text-emerald-400 tracking-[0.3em] text-xs">{g.endClock} — {g.modeTitle}終了</div><h1 className="text-2xl font-black mt-2">当直、お疲れさまでした</h1><div className="mt-5 text-center"><div className="text-6xl font-black text-emerald-400">{rank}</div><div className="text-xs text-slate-400 mt-1">{rankMsg}</div></div></>}
    <div className="mt-7 w-full max-w-sm grid grid-cols-2 gap-2 text-sm">
      <Stat label="最終スコア" value={score >= 0 ? `+${score}` : score} accent /><Stat label="正答率" value={`${acc}%`} /><Stat label="完遂した症例" value={treated} /><Stat label="受入拒否" value={refused} /><Stat label="急変させた患者" value={crashed} /><Stat label="判断ミス" value={wrongs} />{!fired && <Stat label="朝番へ引き継ぎ" value={g.beds.filter(Boolean).length} />}
    </div>
    {g.stats.done.length > 0 && <div className="mt-5 w-full max-w-sm"><div className="text-[11px] text-slate-500 mb-1.5">今夜の診断リスト</div><div className="flex flex-wrap gap-1.5">{g.stats.done.map((d, i) => <span key={`${d.dx}-${i}`} className={`text-[11px] px-2 py-1 rounded-full border ${d.ok ? "border-emerald-700 text-emerald-300" : "border-rose-700 text-rose-300"}`}>{d.ok ? "✓" : "✗"} {d.dx}</span>)}</div></div>}
    <button onClick={onRetry} className="mt-8 px-10 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold transition">もう一度当直する</button>
  </div>;
}
function Stat({ label, value, accent }) {
  return <div className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-2"><div className="text-[10px] text-slate-500">{label}</div><div className={`font-mono text-lg font-bold ${accent ? "text-emerald-400" : "text-slate-200"}`}>{value}</div></div>;
}
