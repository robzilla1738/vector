# A9a — observe the actual already-bound DOM controls

This three-file native seam lets the real browser controller reacquire its actual context's current Local/Session control pointers and the existing wrapper-owned control generation. It uses neither a private implementation downcast nor a lazy getter that manufactures a new service. Unsupported implementations return null; the actual wrapper also refuses missing partition, unbound controls or known disconnected transport. The same preexisting generation already changes on bind/rebind/shutdown.

The observation grants no native admission, source closure, write permission, backend success, durability or activation. Callers must reacquire it from the same actual Profile/partition context at every async boundary, compare generation and pointers, and retain their original request/lease for unknown outcomes. A successor service cannot inherit an old token.

The method is appended after existing public virtual methods. Root owns native registration/compiler checks; one exact replay/reverse/input/whitespace check passed here. No native tree mutation, product execution, provider call, signing, release or runtime acceptance occurred in this lane.
