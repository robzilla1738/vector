#!/usr/bin/env python3
"""Check the deletion proposal's literal/branch boundaries without a native build."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('retirement', Path(__file__).with_name('propose-shell-retirement.py'))
retirement = importlib.util.module_from_spec(spec)
spec.loader.exec_module(retirement)


class BranchBoundaries(unittest.TestCase):
    def test_cpp_keeps_literals_and_unknown_nested_branches(self):
        literal = 'const char* script = R"code(#if BUILDFLAG(ENABLE_AUX_SHELL)\nkeep literal\n#endif)code";\n'
        source = literal + '#if BUILDFLAG(ENABLE_AUX_SHELL)\nold();\n#else\n#if OTHER_FEATURE\ncurrent();\n#endif\n#endif\n'
        self.assertEqual(retirement.prune_cpp(source), literal + '#if OTHER_FEATURE\ncurrent();\n#endif\n')

    def test_cpp_selects_negative_guard_and_preserves_elif_semantics(self):
        source = '#if !BUILDFLAG(ENABLE_AUX_SHELL)\ncurrent();\n#else\nold();\n#endif\n'
        self.assertEqual(retirement.prune_cpp(source), 'current();\n')
        source = '#if BUILDFLAG(ENABLE_AUX_SHELL)\nold();\n#elif OTHER_FEATURE\ncurrent();\n#endif\n'
        self.assertEqual(retirement.prune_cpp(source), '#if OTHER_FEATURE\ncurrent();\n#endif\n')

    def test_cpp_refuses_unreviewed_disjunction(self):
        with self.assertRaisesRegex(ValueError, 'Unreviewed'):
            retirement.prune_cpp('#if BUILDFLAG(ENABLE_AUX_SHELL) || OTHER\ncode();\n#endif\n')

    def test_gn_preserves_string_braces_and_active_alternative(self):
        source = 'if (enable_aux_shell) {\n value = "old { escaped \\" }"\n} else {\n value = "current"\n}\n'
        self.assertEqual(retirement.prune_gn(source).strip(), 'value = "current"')
        source = 'if (enable_aux_browser || enable_aux_shell) {\n value = "current"\n}\n'
        self.assertEqual(retirement.prune_gn(source), 'if (enable_aux_browser) {\n value = "current"\n}\n')

    def test_gn_refuses_unreviewed_condition(self):
        with self.assertRaisesRegex(ValueError, 'Unreviewed'):
            retirement.prune_gn('if (enable_aux_shell || unrelated) { value = "x" }\n')


if __name__ == '__main__':
    unittest.main()
