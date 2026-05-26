#!/usr/bin/env python3
"""RYAN's Tarot 反馈分析脚本.

读取导出的反馈 JSON 文件，分析各维度满意度并给出改进建议。
用法: python scripts/analyze-feedback.py 反馈文件.json
"""

import json
import sys
import os
from collections import Counter
from datetime import datetime

QUESTION_CATEGORIES = {
    "爱情/感情": ["爱情", "感情", "恋爱", "分手", "对象", "喜欢", "ta", "他", "她", "关系", "表白", "暗恋"],
    "工作/事业": ["工作", "事业", "职业", "跳槽", "创业", "面试", "老板", "同事", "升职", "辞职", "转行"],
    "财富/金钱": ["钱", "财富", "收入", "投资", "理财", "负债", "花销", "财务", "赚钱"],
    "决策/选择": ["选择", "决定", "怎么选", "哪个", "要不要", "该不该", "纠结", "犹豫"],
    "成长/自我": ["迷茫", "方向", "目标", "自己", "成长", "改变", "人生", "意义", "未来", "发展"],
    "家庭": ["家", "父母", "孩子", "婚姻", "结婚", "离婚", "家庭", "亲情"],
    "健康": ["健康", "身体", "病", "恢复", "精力", "睡眠"],
}

FEEDBACK_SIGNALS = {
    "太笼统": "解读不够具体，需要更针对性的牌面分析",
    "不准确": "解读与实际感受差异大，需检查牌义关键词或 persona",
    "太短": "生成的文字量不足，考虑增大 max_tokens",
    "重复": "解读中出现多次重复表述，提示词需要强调避免重复",
    "听不懂": "语言太术语化，应调整为更生活化的表达",
}


def categorize_question(question):
    if not question:
        return "未分类"
    for cat, terms in QUESTION_CATEGORIES.items():
        if any(t in question for t in terms):
            return cat
    return "其他"


def load_records(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        print("错误: JSON 文件应为数组格式")
        sys.exit(1)
    return data


def analyze(records):
    total = len(records)
    up_count = sum(1 for r in records if r.get("rating") == "up")
    down_count = sum(1 for r in records if r.get("rating") == "down")
    satisfaction = round((up_count / total) * 100) if total > 0 else 0

    # Per-deck stats
    deck_stats = {}  # deckName -> {total, up}
    for r in records:
        dn = r.get("deckName", "未知")
        if dn not in deck_stats:
            deck_stats[dn] = {"total": 0, "up": 0}
        deck_stats[dn]["total"] += 1
        if r.get("rating") == "up":
            deck_stats[dn]["up"] += 1

    # Per-category stats
    cat_stats = {}  # category -> {total, up}
    for r in records:
        cat = categorize_question(r.get("question", ""))
        if cat not in cat_stats:
            cat_stats[cat] = {"total": 0, "up": 0}
        cat_stats[cat]["total"] += 1
        if r.get("rating") == "up":
            cat_stats[cat]["up"] += 1

    # Per-spread-size stats
    size_stats = {}  # cardCount -> {total, up}
    for r in records:
        size = len(r.get("cards", [])) or r.get("spreadId", "?")
        if isinstance(size, int) or size == 0:
            key = f"{size}张"
        else:
            key = str(size)
        if key not in size_stats:
            size_stats[key] = {"total": 0, "up": 0}
        size_stats[key]["total"] += 1
        if r.get("rating") == "up":
            size_stats[key]["up"] += 1

    # Low-rated readings
    low_rated = [r for r in records if r.get("rating") == "down"]
    with_feedback = [r for r in low_rated if r.get("feedbackText")]

    # Feedback themes
    feedback_signals = Counter()
    for r in with_feedback:
        text = r.get("feedbackText", "")
        for keyword, meaning in FEEDBACK_SIGNALS.items():
            if keyword in text:
                feedback_signals[keyword] += 1

    return {
        "total": total,
        "up_count": up_count,
        "down_count": down_count,
        "satisfaction": satisfaction,
        "deck_stats": deck_stats,
        "cat_stats": cat_stats,
        "size_stats": size_stats,
        "low_rated": low_rated,
        "with_feedback": with_feedback,
        "feedback_signals": feedback_signals,
    }


def print_report(result):
    print("=" * 55)
    print("  RYAN's Tarot 反馈分析报告")
    print("=" * 55)
    print(f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"总解读数: {result['total']}")
    print(f"满意度: {result['satisfaction']}% (👍 {result['up_count']}  👎 {result['down_count']})")
    print()

    # Deck performance
    print("--- 牌组满意度 ---")
    for name, stats in sorted(result["deck_stats"].items(), key=lambda x: -x[1]["total"]):
        rate = round(stats["up"] / stats["total"] * 100) if stats["total"] > 0 else 0
        flag = " ⚠️ 低于阈值" if rate < 70 else ""
        print(f"  {name}: {rate}% ({stats['total']} 次){flag}")
    print()

    # Category performance
    print("--- 问题类型满意度 ---")
    for cat, stats in sorted(result["cat_stats"].items(), key=lambda x: -x[1]["total"]):
        rate = round(stats["up"] / stats["total"] * 100) if stats["total"] > 0 else 0
        flag = " ⚠️" if rate < 70 else ""
        print(f"  {cat}: {rate}% ({stats['total']} 次){flag}")
    print()

    # Spread size performance
    if len(result["size_stats"]) > 1:
        print("--- 牌阵大小满意度 ---")
        for size, stats in sorted(result["size_stats"].items()):
            rate = round(stats["up"] / stats["total"] * 100) if stats["total"] > 0 else 0
            flag = " ⚠️ 大牌阵满意度偏低，考虑优化 prompt 或增大 max_tokens" if rate < 70 else ""
            print(f"  {size}: {rate}% ({stats['total']} 次){' — ' + flag if flag else ''}")
        print()

    # Low-rated readings
    if result["low_rated"]:
        print(f"--- 低评分解读 (共 {len(result['low_rated'])} 条, 有文字反馈 {len(result['with_feedback'])} 条) ---")
        for r in result["with_feedback"][:10]:
            ts = r.get("timestamp", "")[:10]
            q = r.get("question", "")[:40]
            fb = r.get("feedbackText", "")
            print(f"  [{ts}] {r.get('deckName', '?')} — Q: {q}")
            print(f"    反馈: {fb}")
        print()

    # Improvement suggestions
    print("--- 改进建议 ---")
    suggestions = []

    for name, stats in result["deck_stats"].items():
        rate = round(stats["up"] / stats["total"] * 100) if stats["total"] > 0 else 0
        if rate < 70 and stats["total"] >= 3:
            suggestions.append(
                f"牌组 '{name}' 满意度仅 {rate}%，建议检查 deckMeta.js 中对应的 interpretationPersona，"
                f"查看是否风格描述与用户期望有偏差"
            )

    for cat, stats in result["cat_stats"].items():
        rate = round(stats["up"] / stats["total"] * 100) if stats["total"] > 0 else 0
        if rate < 70 and stats["total"] >= 3:
            suggestions.append(
                f"'{cat}' 类问题满意度仅 {rate}%，建议优化 buildPrompt.js 中针对该类型的引导语"
            )

    for keyword, count in result["feedback_signals"].most_common(5):
        meaning = FEEDBACK_SIGNALS.get(keyword, "")
        suggestions.append(f"用户反馈中出现 '{keyword}' {count} 次 — {meaning}")

    if not suggestions:
        suggestions.append("当前数据量较少，暂无明显改进信号。持续收集反馈后将出现有价值的改进方向。")

    for i, s in enumerate(suggestions, 1):
        print(f"  {i}. {s}")

    print()
    print("--- 下一步 ---")
    print(f"  将此报告中的建议应用于相应文件后，清除反馈数据重新开始收集，观察改进效果。")
    print(f"  (反馈数据文件: {sys.argv[1] if len(sys.argv) > 1 else '未指定'})")


def main():
    if len(sys.argv) < 2:
        # Try default path
        default = os.path.join(os.path.dirname(os.path.dirname(__file__)), "feedback_data.json")
        if os.path.exists(default):
            path = default
        else:
            print("用法: python scripts/analyze-feedback.py <反馈JSON文件>")
            print("提示: 在应用内 Review 面板点击 '导出反馈数据' 获取 JSON 文件")
            sys.exit(1)
    else:
        path = sys.argv[1]

    if not os.path.exists(path):
        print(f"错误: 文件不存在 — {path}")
        sys.exit(1)

    records = load_records(path)
    if not records:
        print("反馈数据为空，暂无分析内容。")
        return

    result = analyze(records)
    print_report(result)


if __name__ == "__main__":
    main()
