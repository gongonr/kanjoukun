// pages/index.tsx
import { useState } from "react";

export default function Home() {
  const [amounts, setAmounts] = useState({
    A: { weight: "", count: "" },
    B: { weight: "", count: "" },
    C: { weight: "", count: "" },
    D: { weight: "", count: "" },
    E: { weight: "", count: "" },
  });
  const [totalAmount, setTotalAmount] = useState("");

  const handleChange = (rank: string, field: "weight" | "count", value: string) => {
    setAmounts((prev) => ({
      ...prev,
      [rank]: { ...prev[rank], [field]: value },
    }));
  };

  const calculate = () => {
    const total = parseFloat(totalAmount);
    if (isNaN(total) || total <= 0) return null;

    let totalWeightedCount = 0;
    let weightedCounts: { [key: string]: number } = {};

    for (const rank of ["A", "B", "C", "D", "E"]) {
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

    const perPersonAmounts: { [key: string]: number } = {};
    for (const rank of ["A", "B", "C", "D", "E"]) {
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

  return (
    <div className="min-h-screen bg-gray-100 text-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-6 rounded shadow-md">
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

        {["A", "B", "C", "D", "E"].map((rank) => (
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
