# Anti-AI Writing Examples

Each example names the pattern and its tier. The "After" versions use only facts the "Before" already contained, or the surrounding post supplies (stated under "Context").

## Example 1: Hidden verbs [Evidenced: nominalisation]

### Before

The script performs validation of the basket and conducts an evaluation of shipping method availability.

### After

The script validates the basket and checks whether the selected shipping method is still available.

## Example 2: Corrective framing with no one to correct [Evidenced]

Context: the post has just shown two jobs uploading to the same path within one second.

### Before

This isn't a WebDAV problem. It's a timing problem.

### After

The upload failed because two jobs wrote the same path at once.

The contrast goes because no reader had blamed WebDAV. If the post had quoted a forum thread blaming WebDAV, the contrast would stay, with its owner named: "The forum thread blames WebDAV; the log shows two jobs writing the same path."

## Example 3: Trailing participial tail [Evidenced]

### Before

The deploy gate failed on the first run, highlighting the importance of pinning nested dependencies.

### After

The deploy gate failed on the first run. A nested dependency had moved to a new major version.

Context: the post's log excerpt shows the version bump. Without that excerpt, the honest fix is to cut the tail: "The deploy gate failed on the first run."

## Example 4: Mannered prose and a self-narrating adverb [Craft] / [Evidenced]

### Before

The cache key is genuinely the load-bearing decision here.

### After

The cache key decides whether shoppers see each other's baskets.

Context: the previous paragraph explains that personalised baskets share a cache entry when the key omits the customer group.

## Example 5: Vague praise with no fact to replace it [Craft]

### Before

SFCC provides a robust framework for managing promotions.

### After, when the post says what promotions do

SFCC promotions let merchandisers change pricing rules in Business Manager without a code deployment.

### After, when it does not

SFCC has a built-in promotions engine. <!-- TODO author: what does it do that matters for this post? -->

The second version is less vivid and correct. An invented capability would read better and be wrong.

## Example 6: Leave it alone

### Before

As far as I can tell, the retry never fires on staging. I have no logs from production, so I can't say whether it does there. Moreover, the timeout is shorter on staging.

### After

Unchanged. The hedges are motivated (the author lacks production logs), the first person is the author's voice, and *Moreover* marks a real addition. No pattern in this skill applies, so the correct output is no edit.
