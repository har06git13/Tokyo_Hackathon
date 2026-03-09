**データベース設計**  
2025/8/01  
制作者：はら

変数名なので英語で書いていく

* User  
  * id  
    * 0, 1, …などの数字  
  * Icon  
    * "Image1.png"  
    * …  
  * Name  
    * "AAA"  
    * "BBB"  
    * …  
  * Age  
    * 25  
    * 18  
    * …  
  * Gender (選択式？)  
    * "Woman"  
    * "Man"  
    * "Others"  
    * "N/A"  
  * Shibuya\_relation (選択式？)  
    * ​​"Resident"  
    * "Student\_worker"  
    * "Transit"  
    * "Others"  
  * HP (30分ごとに記録)  
    * \[{"Stamina": 70, "Mental": 70, "Battery": 60, "Money": 0}, {...}\]  
  * Event\_list  
    * \[{"Event\_id": 0, "Time": 14:30}, {...}\]  
  * Visited\_list  
    * \[0, 5, 2, …\]

  * 避難成功/失敗  
  * ぽえみーなテキスト

　　　　　↑この二つはDBに登録する必要なし？

* Event  
  * id  
    * 0, 1, …などの数字  
  * Time（分）  
    * 30  
    * …  
  * Event\_type (選択式)  
    * "Move"  
    * "SNS"  
    * "ProEpi"  
  * Facility\_id  
    * 0, 1, …などの数字または"”  
  * SNS\_id  
    * 0, 1, …などの数字または"”  
  * HP\_d  
    * {"Stamina": \-10, "Mental": 0, "Battery": 10, "Money": 0}  
  * Text  
    * “type” // "system" or "talk"  
    * “ isCritical” // 重要テキストか   
    * “isPlayer”  // true: player, false: other  
    * “isDecrease” // ゲージ減少フラグ  
    *  “text” // 表示するテキスト  
    *  “name” // 発言者(プレイヤー以外)  
* Facility  
  * id  
    * 0, 1, …などの数字  
  * Type  
    *   
  * Name  
    * "CHARGESPOT HUB 渋谷センター街店"  
    * …  
  * Coordinate  
    * {"lat": 35.6583944, "lng": 139.7023056}  
    * {...}  
      

      
  * 時間帯ごとの状況  
    * 混雑  
    * 商品


  


* Results（2025/8/24 追加 by はら）
  * _id
    * MongoDB 自動採番 ObjectId
  * AgeType
    * "10代", "20代", … など（プレイヤー選択値をそのまま保存）
    * null（未選択時）
  * Gender
    * "男性", "女性", "その他", "N/A" など（プレイヤー選択値をそのまま保存）
    * null（未選択時）
  * ResidenceType
    * "渋谷区在住", "渋谷区在学" など（プレイヤー選択値をそのまま保存）
    * null（未選択時）
  * EventHistory
    * [{"id": "event_xxx", "time": ISODate("2026-02-22T14:30:00Z")}, {...}]
    * ゲーム中に発生したイベントのIDと発生時刻（UTC）の配列
  * createdAt
    * ISODate（サーバー側で自動付与）
  * 送信タイミング: ゲーム終了 → /result 画面へ遷移する直前に1回だけ POST /api/results で保存
  * 送信失敗時でも画面遷移は継続（UIブロックなし）

* SNS
  * id  
    * 0, 1, …などの数字  
  * Type (デマ/有用情報/公式情報など)  
    * "Rumor"  
    * "Useful"  
    * "Official"  
  * Time  
    * “2h” 災害発生0-2h  
    * “4h” 災害発生2-4h  
    * “6h” 災害発生4-6h  
    * “8h” 災害発生6-8h  
    * “10h” 災害発生8-10h  
  * Icon  
    * "Image1.png"  
    * …  
  * User\_name  
    * "バズバズニュース🐯"  
    * …  
  * User\_id  
    * "@buzz\_buzz\_news"  
    * …  
  * Text  
    * "渋谷の地下街でガス漏れ→爆発ってまじ！？"  
    * …

