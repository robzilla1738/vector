#155 pointer-list adaptation and precise source scroll oracle

Use explicit raw_ptr.get() values for pointer deduction in the two-element scroll list, as required by the actual361 compiler. Original3161a40 is GetScrollViewForContents, which checks the actual contents/viewport/scroll relationship;41290b0 wraps that oracle in a parent walk. Use that exact oracle inside the recovered loop rather than testing each ancestor itself as a ScrollView. The full unpinned proposal independently pins that identity. Neither change invents a scroll owner or geometry.
