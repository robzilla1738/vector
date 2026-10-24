struct ContextPage {
  base::WeakPtr<content::WebContents> contents;
  content::WeakDocumentPtr document;
  bool Current(Profile* profile) const {
    auto* frame = document.AsRenderFrameHostIfValid();
    return contents && frame && !frame->IsErrorDocument() &&
        contents->GetBrowserContext() == profile &&
        contents->GetPrimaryMainFrame() == frame &&
        !contents->GetController().GetPendingEntry() &&
        contents->GetLastCommittedURL().SchemeIsHTTPOrHTTPS();
  }
};

