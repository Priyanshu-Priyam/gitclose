/**
 * Runs when an exception is created.
 * Checks memory for prior patterns and annotates the exception.
 */
export default function onException({ exception, memory }) {
  
  const memoryPatterns = memory.getPatterns({
    counterparty: exception.counterparty,
    amountRange: [exception.amount * 0.95, exception.amount * 1.05]
  });

  if (memoryPatterns.length > 0) {
    const mostRecent = memoryPatterns[0];
    exception.memory_match = {
      found: true,
      prior_instance: mostRecent.date,
      prior_resolution: mostRecent.resolution,
      prior_pr: mostRecent.pr_reference,
      confidence: 'HIGH',
      suggestion: `Similar pattern found in ${mostRecent.period}. ` +
                  `Previously resolved as: ${mostRecent.resolution}. ` +
                  `See PR #${mostRecent.pr_reference}.`
    };
  }

  return exception;
}
