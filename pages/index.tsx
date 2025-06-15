// pages/index.tsx
import { useState } from "react";

const ranks = ["A", "B", "C", "D", "E"] as const;
type Rank = typeof ranks[number];

type Amount = {
  weight: string;
  count: string;
};

type AmountsType = {
  [key in Rank]: Amount;
};

export default function Home() {
  const [amounts, setAmounts] = useState<AmountsType>({
    A: { weight: "", count: "" },
    B: { weight: "", count: "" },
    C: { weight: "", count: "" },
    D: { weight: "", count: "" },
    E: { weight: "", count: "" },
  });
  const [totalAmount, setTotalAmount] = useState("");

  // モバイル表示での段階的表示用
  // Aは常に表示なので、B〜Eの4つを順に増やす（最大4）
  const [visibleCount, setVisibleCount] = useState(0);

  const handleChange = (
    rank: Rank,
    field: keyof Amount,
    value: string
  ) => {
    setAmounts((prev) => ({
      ...prev,
      [rank]: { ...prev[rank], [field]: value },
    }));
  };

  const calculate = () => {
    const total = parseFloat(totalAmount);
    if (isNaN(total) || total <= 0) return null;

    let totalWeightedCount = 0;
    const weightedCounts: { [key in Rank]: number } = {
      A: 0, B: 0, C: 0, D: 0, E: 0,
    };

    for (const rank of ranks) {
      const weight = parseFloat(amounts[rank].weight);
      const count = parseInt(amounts[rank].count, 10);
      if (isNaN(weight) || weight <= 0 || isNaN(count) || count <= 0) {
        weightedCounts[rank] = 0;
      } else {
        weightedCounts[rank] = weight * count;
      }
      totalWeightedCount += weightedCounts[rank];
    }
    if (totalWeightedCount === 0) return null;

    const perPersonAmounts: { [key in Rank]: number } = {
      A: 0, B: 0, C: 0, D: 0, E: 0,
    };

    for (const rank of ranks) {
      if (weightedCounts[rank] === 0) {
        perPersonAmounts[rank] = 0;
      } else {
        perPersonAmounts[rank] = Math.ceil(
          (total * (weightedCounts[rank] / totalWeightedCount)) /
          parseInt(amounts[rank].count, 10)
        );
      }
    }
    return perPersonAmounts;
  };

  const result = calculate();

  const totalResult = result
    ? ranks.reduce((sum, rank) => {
      const count = parseInt(amounts[rank].count, 10);
      if (isNaN(count) || count <= 0) return sum;
      return sum + result[rank] * count;
    }, 0)
    : 0;

  // モバイル用に表示判定関数
  // Aは常に表示、B〜Eは visibleCount に応じて表示
  const isMobileRankVisible = (rank: Rank, index: number) => {
    if (index === 0) return true; // Aは常に表示
    // PCなら常に表示（sm以上はflex-rowなのでここではCSSの隠しはしない）
    // ここはJSX側でモバイル判定はCSSのクラスで対応し、B〜EはvisibleCountで制御
    return index <= visibleCount;
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black flex flex-col sm:flex-row items-center justify-start sm:justify-center p-4 relative">
      {/* モバイル用ヘッダー */}
      <div className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white py-4 rounded sm:hidden">
        <h1 className="text-2xl font-bold text-center">
          勘定くん
        </h1>
      </div>


      {/* メインコンテンツ */}
      <div className="w-full max-w-md bg-white p-6 rounded shadow-md space-y-6 mt-14 sm:mt-0">
        {/* PC用タイトル */}
        <h1 className="text-xl font-bold text-center hidden sm:block">
          勘定くん
        </h1>

        {/* 合計金額入力 */}
        <div className="flex items-center border rounded p-2 bg-gray-50">
          <input
            type="number"
            placeholder="合計金額"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="flex-grow outline-none bg-transparent no-spin"
          />
          <span className="ml-2">円</span>
        </div>

        {/* 各ランクの入力欄 */}
        {ranks.map((rank, i) => {
          // モバイル時の表示判定
          // sm以上は常に表示
          // sm未満はvisibleCountまで表示
          // → CSSのhidden sm:flex を利用しつつJSX側で制御
          // モバイルで非表示の時はhiddenに
          const isVisibleOnMobile = isMobileRankVisible(rank, i);

          return (
            <div
              key={rank}
              className={`flex flex-col sm:flex-row items-center sm:space-x-3 space-y-2 sm:space-y-0
                ${!isVisibleOnMobile ? "hidden" : "flex"}
                sm:flex
              `}
            >
              <div className="w-full sm:w-6 font-bold text-center sm:text-left">
                {rank}
              </div>

              <input
                type="number"
                step="0.1"
                min="1"
                placeholder="重み"
                value={amounts[rank].weight}
                onChange={(e) => handleChange(rank, "weight", e.target.value)}
                className="w-full sm:w-20 p-2 border rounded text-right"
              />
              <span className="hidden sm:inline">×</span>

              <input
                type="number"
                placeholder="人数"
                min="0"
                value={amounts[rank].count}
                onChange={(e) => handleChange(rank, "count", e.target.value)}
                className="w-full sm:w-20 p-2 border rounded text-right"
              />
              <span className="hidden sm:inline">人</span>

              <div className="w-full sm:flex-grow text-right font-semibold">
                {result && result[rank] > 0 ? `${result[rank]} 円` : "-"}
              </div>
            </div>
          );
        })}

        {/* モバイル時だけ表示する「もっと見る」ボタン */}
        <div className="sm:hidden text-center">
          {visibleCount < ranks.length - 1 && (
            <button
              onClick={() => setVisibleCount((c) => c + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ランクを追加
            </button>
          )}
        </div>

        {/* 合計金額表示 */}
        <div className="text-right font-bold text-lg">
          合計: {totalResult > 0 ? `${totalResult} 円` : "-"}
        </div>

        <style jsx>{`
          input.no-spin::-webkit-outer-spin-button,
          input.no-spin::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input.no-spin {
            -moz-appearance: textfield;
          }
        `}</style>
      </div>
    </div>
  );
}
