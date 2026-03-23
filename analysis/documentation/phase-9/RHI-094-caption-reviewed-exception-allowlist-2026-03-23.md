# RHI-094 Caption Reviewed Exception Allowlist (2026-03-23)

## Change summary

This allowlist records the reviewed no-change exceptions from the corrected nearby-text recheck for already processed caption routes. Each entry was flagged by the candidate audit but was kept after manual review because the immediate post-figure paragraph advances the article instead of functioning as leftover caption text.

## Why this changed

The corrected recheck logic deliberately errs on the side of flagging short post-image paragraphs that may be leftover caption text. Without an explicit allowlist, legitimate narrative transitions and instructions are likely to be reopened repeatedly as false positives.

## Behavior details

### Old behavior

- Reviewed no-change exceptions were implicit in manual review notes and easy to relitigate later.
- The audit output alone did not distinguish between true leftover caption text and short but legitimate body prose.

### New behavior

- Every reviewed no-change exception is recorded explicitly with a keep rationale.
- The allowlist separates `post-figure paragraph: keep` decisions from caption rewrite or removal work.
- Future rechecks can compare against this report before treating the same paragraph pattern as a new defect.

## Impact

- Content reviewers now have a stable reference for the remaining reviewed exceptions in the corrected recheck scope.
- Recheck evidence is more auditable because each kept paragraph is tied to a specific route, figure index, and rationale token.
- Future batch work can focus on new failures rather than re-arguing the same borderline prose.

## Reviewed Exceptions

| Route | Figure | Post-figure paragraph kept | Rationale token | Why kept |
|---|---|---|---|---|
| `b2c-commerce-whats-new-in-22-4` | 1 | `But once you enable this option, how does it translate in the storefront? Let's have a look!` | `transition-question` | Introduces the forthcoming storefront comparison instead of labeling the image. |
| `delta-exports-in-salesforce-b2c-commerce-cloud` | 1 | `Let us open that "Test" configuration!` | `next-step-instruction` | Directs the reader to the next UI action after the overview figure. |
| `how-to-change-the-code-compatibility-mode-in-salesforce-b2c-commerce-cloud` | 2 | `As it turns out... no. There is server-side validation in place. So we need to find another way to hack the system!` | `result-explanation` | Explains the failed experiment and motivates the next workaround. |
| `how-to-change-the-code-compatibility-mode-in-salesforce-b2c-commerce-cloud` | 4 | `Click on the **active** Code Version (this is important)!` | `step-instruction` | Provides a required procedural instruction rather than an image label. |
| `how-to-extend-active-data-in-salesforce-b2c-commerce-cloud` | 5 | `And with this new addition, we can start creating new [Dynamic Customer Groups](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/active_merchandising/b2c_creating_a_dynamic_customer_group.html), for example!` | `next-step-transition` | Moves from import verification into the next implementation step instead of labeling the image. |
| `how-to-use-ocapi-scapi-hooks` | 4 | `This does have a slight nuance: It is not the case for all endpoints. Luckily this is documented for every hook!` | `nuance-explanation` | Adds endpoint-specific nuance not present in the figure caption. |
| `how-to-use-ocapi-scapi-hooks` | 5 | `Read the documentation carefully for each hook!` | `review-instruction` | Acts as imperative guidance tied to the upcoming discussion, not as a caption. |
| `ai-wont-steal-your-sfcc-job-but-a-developer-using-ai-will` | 1 | `And it's not just developers who experience this - every industry has its own story.` | `scope-broadening` | Broadens the argument beyond developers, which the figure caption does not do. |

## Verification

1. Reviewed-exception source of truth: `tmp/post-figure-paragraph-candidates.csv`
2. Audit command: `node tmp/check_post_figure_paragraphs.cjs`
3. Result after latest source cleanup: `candidates=8`
4. Each listed paragraph was manually reviewed and kept as legitimate body prose under the updated leftover-paragraph rule.
5. These entries are no-change exceptions only. They do not override future review if surrounding article context changes.

## Related files

- `tmp/post-figure-paragraph-candidates.csv`
- `tmp/check_post_figure_paragraphs.cjs`
- `src/content/posts/b2c-commerce-whats-new-in-22-4/index.md`
- `src/content/posts/delta-exports-in-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/how-to-change-the-code-compatibility-mode-in-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/how-to-extend-active-data-in-salesforce-b2c-commerce-cloud/index.md`
- `src/content/posts/how-to-use-ocapi-scapi-hooks/index.md`
- `src/content/posts/ai-wont-steal-your-sfcc-job-but-a-developer-using-ai-will/index.md`