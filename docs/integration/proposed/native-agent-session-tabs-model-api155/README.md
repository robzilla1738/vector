# Actual Chromium155 class lifetime declarations

The focused v347 compiler requires explicit out-of-line construction and destruction for the model owning two maps. Declare and default those members without changing parsing, ancestry or replacement behavior. The original proposal remains immutable.
