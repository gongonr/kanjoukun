import { useState } from "react";
import Head from "next/head";

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
    A: { weight: "1", count: "1" },
    B: { weight: "0", count: "0" },
    C: { weight: "0", count: "0" },
    D: { weight: "0", count: "0" },
    E: { weight: "0", count: "0" },
  });
  const [totalAmount, setTotalAmount] = useState("");
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

  const handleRemoveRank = (index: number) => {
    if (index === 0) return; // Aは削除不可
    const rank = ranks[index];
    setAmounts((prev) => ({
      ...prev,
      [rank]: { weight: "0", count: "0" },
    }));
    setVisibleCount((prev) => (prev >= index ? prev - 1 : prev));
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

  const isMobileRankVisible = (rank: Rank, index: number) => {
    if (index === 0) return true;
    return index <= visibleCount;
  };

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>勘定くん - 重み付け割り勘計算アプリ</title>
        <meta
          name="description"
          content="勘定くんは合計金額を各ランクの重みと人数で割り勘計算できるシンプルなWebアプリです。"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="勘定くん - 割り勘計算アプリ" />
        <meta property="og:description" content="勘定くんは合計金額を各ランクの重みと人数で割り勘計算できるシンプルなWebアプリです。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kanjoukun-awog.vercel.app" />
        <meta property="og:image" content="https://kanjoukun-awog.vercel.app/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-100 text-black flex flex-col sm:flex-row items-center justify-start sm:justify-center p-4">
        {/* スマホヘッダー */}
        <div className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white py-4 rounded sm:hidden">
          <h1 className="text-2xl font-bold text-center">勘定くん</h1>
        </div>

        {/* メインパネル */}
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md space-y-6 mt-14 sm:mt-0">
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

          {/* ────── カード形式でランク表示 ────── */}
          <div className="space-y-4">
            {ranks.map((rank, i) => {
              const isVisibleOnMobile = isMobileRankVisible(rank, i);
              return (
                <div
                  key={rank}
                  className={`
                  ${!isVisibleOnMobile ? "hidden" : "flex"} sm:flex
                  flex-col sm:flex-row items-start sm:items-center
                  sm:space-x-3 space-y-2 sm:space-y-0
                  border border-gray-200 bg-white rounded-lg p-4
                  shadow-sm hover:shadow-md transition-shadow duration-150
                `}
                >
                  <div className="w-full sm:w-6 font-bold text-center sm:text-left">
                    {rank}
                  </div>

                  {/* モバイル用：スライダー入力 */}
                  <div className="w-full sm:hidden">
                    <label className="block text-sm text-gray-700 mb-1">
                      重み：
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={parseFloat(amounts[rank].weight) || 0}
                      onChange={(e) =>
                        handleChange(rank, "weight", e.target.value)
                      }
                      className="w-full"
                    />
                    <div className="text-right text-lg font-semibold text-blue-700">
                      {parseFloat(amounts[rank].weight) || 0}
                    </div>
                  </div>

                  <div className="w-full sm:hidden">
                    <label className="block text-sm text-gray-700 mb-1">
                      人数：
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={parseInt(amounts[rank].count, 10) || 0}
                      onChange={(e) =>
                        handleChange(rank, "count", e.target.value)
                      }
                      className="w-full"
                    />
                    <div className="text-right text-lg font-semibold text-blue-700">
                      {parseInt(amounts[rank].count, 10) || 0} 人
                    </div>
                  </div>

                  {/* 削除ボタン（モバイルのみ） */}
                  {i > 0 && (
                    <button
                      className="sm:hidden ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleRemoveRank(i)}
                      type="button"
                    >
                      削除
                    </button>
                  )}

                  {/* PC用：重み・人数入力 */}
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    placeholder="重み"
                    value={amounts[rank].weight}
                    onChange={(e) =>
                      handleChange(rank, "weight", e.target.value)
                    }
                    className="hidden sm:block w-20 p-2 border rounded text-right"
                  />
                  <span className="hidden sm:inline">×</span>
                  <input
                    type="number"
                    placeholder="人数"
                    min="0"
                    value={amounts[rank].count}
                    onChange={(e) =>
                      handleChange(rank, "count", e.target.value)
                    }
                    className="hidden sm:block w-20 p-2 border rounded text-right"
                  />
                  <span className="hidden sm:inline">人</span>

                  <div className="w-full sm:flex-grow text-right font-semibold">
                    {result && result[rank] > 0 ? `${result[rank]} 円` : "-"}
                  </div>
                </div>
              );
            })}
          </div>
          {/* ────── カード形式ここまで ────── */}

          {/* モバイルの「ランク追加」 */}
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
    </>
  );
}
