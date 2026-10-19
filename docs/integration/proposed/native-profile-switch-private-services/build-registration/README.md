# Private-service public header build flags

The existing default-search and incognito-clear dialog public headers now include
browser build flags for their real profile migration hooks. Expose the generated
header through the two existing public GN targets. No service or target is added;
source pins match the actual shared inputs unchanged by the private-service port.
