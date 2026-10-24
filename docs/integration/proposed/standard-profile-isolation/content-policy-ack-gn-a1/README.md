# Native applied-policy registration

Three count-one GN changes expose the new native launch binding and header in their existing owners. The native Mac platform target reuses its existing CoreFoundation/Security frameworks and gains the content public dependency; no alternate implementation owner is introduced. No generated protocol or UI registration changes. This source-only proposal leaves actual GN generation, compile and link to the serialized root integration.
