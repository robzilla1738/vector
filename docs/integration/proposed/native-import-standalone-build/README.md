# Original standalone importer build ownership

Compile the actual popup creator/native appearance in the existing main UI target, which owns browser creation/navigation, avoiding an importer-to-UI dependency cycle. The PeopleHandler Settings implementation and UI target share a header-only declaration target, following existing native UI interface ownership. No source profile, runtime or native window operation is performed. GN generation and focused compilation are required after the original source proposal is mounted.
