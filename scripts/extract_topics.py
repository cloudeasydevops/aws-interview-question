#!/usr/bin/env python3
"""Extract topic-wise content from the LibreOffice-exported HTML into topics.json."""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_HTML = os.path.join(ROOT, "AWS_DevOps_Interview_Questions_Topicwise.html")
OUT_JSON = os.path.join(ROOT, "src", "data", "topics.json")

HTML_ENTITIES = {
    "&amp;": "&",
    "&quot;": '"',
    "&lt;": "<",
    "&gt;": ">",
    "&nbsp;": " ",
}


def clean(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    for k, v in HTML_ENTITIES.items():
        text = text.replace(k, v)
    return text


def main() -> None:
    with open(SRC_HTML, encoding="utf-8") as fh:
        html = fh.read()

    title = "AWS DevOps Interview Questions — Topic-wise"
    m = re.search(r"<h1 class=\"western\">(.*?)</h1>", html, re.S)
    if m:
        title = clean(m.group(1))

    topics = []
    # Every topic begins with an <h2 class="western"> block.
    for part in re.split(r'<h2 class="western">', html)[1:]:
        head, _, body = part.partition("</h2>")
        topic_title = clean(head)
        questions = []
        for li in re.findall(r"<li>(.*?)</li>", body, re.S):
            q = clean(li)
            if q:
                questions.append(q)
        topics.append({"title": topic_title, "questions": questions})

    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as fh:
        json.dump({"title": title, "topics": topics}, fh, ensure_ascii=False, indent=2)

    total = sum(len(t["questions"]) for t in topics)
    print(f"Extracted {len(topics)} topics, {total} questions -> {OUT_JSON}")
    for i, t in enumerate(topics, 1):
        print(f"  {i:>2}. {t['title'][:70]} ({len(t['questions'])})")


if __name__ == "__main__":
    main()