"""Unique-context source anchors for exact pinned native successors."""
import difflib


def counted_anchors(before, after):
    before_lines, after_lines = before.splitlines(True), after.splitlines(True)
    context = 3
    while True:
        matcher = difflib.SequenceMatcher(None, before_lines, after_lines, autojunk=False)
        anchors = []
        for group in matcher.get_grouped_opcodes(context):
            anchors.append(dict(before=''.join(before_lines[group[0][1]:group[-1][2]]),
                                after=''.join(after_lines[group[0][3]:group[-1][4]]), expectedCount=1))
        text = before
        for anchor in anchors:
            if not anchor['before'] or text.count(anchor['before']) != 1:
                break
            text = text.replace(anchor['before'], anchor['after'], 1)
        else:
            if text == after:
                return anchors
        context *= 2
        if context > max(len(before_lines), len(after_lines)) * 2:
            raise ValueError('No unique complete counted source replay')
