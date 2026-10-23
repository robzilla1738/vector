/* Link entry only. The binary is never executed; real C wrappers are retained
   explicitly by the linker so dead stripping cannot conceal their dependencies. */
int main(void) { return 0; }
