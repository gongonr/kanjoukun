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
    let weightedCounts: { [key in Rank]: number } = {
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
          (total * (weightedCounts[rank] / totalWeightedCount)) / parseInt(amounts[rank].count, 10)
        );
      }
    }
    return perPersonAmounts;
  };

  const result = calculate();

  // 各ランクの「1人あたり金額 × 人数」の合計を計算
  const totalResult = result
    ? ranks.reduce((sum, rank) => {
        const count = parseInt(amounts[rank].count, 10);
        if (isNaN(count) || count <= 0) return sum;
        return sum + result[rank] * count;
      }, 0)
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 text-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-6 rounded shadow-md relative">
        <h1 className="text-xl font-bold text-center">勘定くん</h1>

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

        {ranks.map((rank) => (
          <div key={rank} className="flex items-center space-x-3">
            <div className="w-6 font-bold">{rank}</div>

            <input
              type="number"
              step="0.1"
              min="1"
              placeholder="重み"
              value={amounts[rank].weight}
              onChange={(e) => handleChange(rank, "weight", e.target.value)}
              className="w-20 p-2 border rounded text-right"
            />
            <span>×</span>

            <input
              type="number"
              placeholder="人数"
              min="0"
              value={amounts[rank].count}
              onChange={(e) => handleChange(rank, "count", e.target.value)}
              className="w-20 p-2 border rounded text-right"
            />
            <span>人</span>

            <div className="flex-grow text-right font-semibold">
              {result && result[rank] > 0 ? `${result[rank]} 円` : "-"}
            </div>
          </div>
        ))}

        {/* 右下に合計金額表示 */}
        <div className="absolute bottom-4 right-4 font-bold text-lg">
          合計: {totalResult > 0 ? `${totalResult} 円` : "-"}
        </div>

        <style jsx>{`
          /* 合計金額入力のスピンボタン非表示 */
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
