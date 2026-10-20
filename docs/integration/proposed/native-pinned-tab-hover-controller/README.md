# Pass the actual region hover controller

The genuine saved-entry HoverCardAnchorTarget needs the region’s existing TabHoverCardController. Pass that actual controller to the real existing leaf constructor. No duplicated controller, hover fixture or replacement popup is created; lifecycle remains the base region’s actual controller ownership.
