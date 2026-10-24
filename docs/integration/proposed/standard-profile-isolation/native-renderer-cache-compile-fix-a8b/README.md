# A8b — native compiler corrections

Root's actual renderer compiler found ambiguous lookup between `base::BindOnce` and Blink's GC-aware `BindOnce` at ten new binding sites, plus WTF Vector's inability to infer an aggregate initializer's type. This exact eleven-anchor successor qualifies the ten new calls as `blink::BindOnce` and spells the existing `AuxUiCacheSource` aggregate type explicitly. No normal code, captured values, cache phases, guard or authority changes.

The input is the exact committed A8 output. Source-only replay/reverse/hash/whitespace passed; root owns projection and actual compiler retry. Historical A8 evidence is retained unchanged.
