---
tags: [pr-comments, communication]
---

# Good PR Comment Examples

## Flagging a bug, not just a style nit
> Nice fix overall. One thing though — `invoice.LineItems` could be null for invoices created before line items were required (pre-March migration). Worth a null check here to avoid an NRE on those legacy rows. Happy to pair on finding a repro if useful.

Specific, explains *why*, offers help — not just "this could break."

## Suggesting an alternative without being prescriptive
> This works, but have you considered using `Any()` instead of `Count() > 0` here? `Any()` short-circuits on the first match, `Count()` enumerates the whole thing. Probably negligible at current data volume but it's a good habit for anything that could grow. Not a blocker either way.

Explains the reasoning, explicitly says it's not a blocker — respects the author's judgment on whether it matters here.

## Asking instead of asserting when uncertain
> Genuine question — does this need to handle the case where the technician is unassigned, or is that guaranteed not to happen by this point in the flow? If it's guaranteed, might be worth a comment explaining why, since it wasn't obvious to me reading it cold.

Good for cases where you're not sure if something is a bug or an intentional invariant — asking avoids a wrong accusatory comment and often surfaces missing context/documentation either way.

#pr-comments #communication
