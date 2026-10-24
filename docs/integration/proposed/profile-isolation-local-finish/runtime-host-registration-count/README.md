# Native host descriptor-count correction

The selected protected-startup host declares seven immutable method descriptors but registers only six. The existing `noteUntrackedBrokerWork` descriptor is last and was omitted. This exact count-one change derives the registration length from the actual array using `std::size(properties)`. No new descriptor or authority is introduced.

Apply only to the input SHA in manifest.json and require the recorded output SHA. The historical host remains untouched. No product, native executable or library was run; the defect is directly evidenced by the selected source. Async runtime inspection is a separate follow-on overlay.
