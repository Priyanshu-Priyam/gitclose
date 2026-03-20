# The Verification Model: Maker-Checker as Git Workflow

## The Regulatory Requirement

In every regulated financial environment, a fundamental control exists: the
person who prepares work must not be the same person who approves it. This is
variously called:

- **Maker-Checker** (banking)
- **Segregation of Duties / SOD** (SOX compliance)
- **Dual Control** (payments and treasury)
- **Four-Eyes Principle** (European regulation)

The purpose is simple: errors and fraud are harder when two independent people
are involved. The preparer might make a mistake; the reviewer catches it. The
preparer might act improperly; the reviewer blocks it.

## How It Works in Git

Git's pull request workflow implements this natively:

BRANCH PROTECTION RULES:

Authors cannot approve their own PRs
PRs require at least 1 approved review before merge
Merge to main requires reviewer from designated list (CODEOWNERS)
All commits on the branch are visible in the review
Merge creates an immutable record of who approved and when
Translated to finance:

GitClose configuration:

Agents cannot merge their own branches (structural: they don't have permission)
PRs require Controller or Senior Accountant approval
Only designated reviewers can merge to main (close.yaml)
Every commit the agent made is visible in the PR diff
Merge timestamp and reviewer name are permanent in git history
No additional mechanism is needed. The git workflow IS the maker-checker control.

## What the Auditor Verifies

Today, auditors verify maker-checker by:
1. Selecting a sample of reconciliations
2. Checking for a preparer signature and a reviewer signature
3. Verifying the two people are different
4. Verifying the reviewer is authorized
5. Checking the date (was the review timely?)

With git-native close:
1. `git log` shows every action and every merge
2. Author ≠ Merger is enforced by branch protection
3. CODEOWNERS or close.yaml defines authorized reviewers
4. Timestamps are cryptographically embedded in commit hashes

The auditor doesn't need to sample. They verify the branch protection rules
once and then trust the system for the entire population. This is **full
population testing** rather than sample-based testing — more rigorous, faster,
and less expensive for everyone.

## The Access Control Model

┌─────────────────────────────────────────────────────────┐ │ PERMISSIONS MATRIX │ │ │ │ Agent Sr Acct Controller Auditor │ │ (Atlas) (James) (Sarah) (Ext) │ │ ─────────────────────────────────────────────────────── │ │ Read GL data ✅ ✅ ✅ ✅ │ │ Create branch ✅ ✅ ✅ ❌ │ │ Commit to branch ✅ ✅ ✅ ❌ │ │ Open PR ✅ ✅ ✅ ❌ │ │ Review PR ❌ ✅ ✅ ❌ │ │ Approve PR ❌ ❌* ✅ ❌ │ │ Merge to main ❌ ❌* ✅ ❌ │ │ Tag close ❌ ❌ ✅ ❌ │ │ Read history ✅ ✅ ✅ ✅ │ │ Modify history ❌ ❌ ❌ ❌ │ │ │ │ * James can review but not approve his own work │ │ or the agent's work on tasks assigned to him │ └─────────────────────────────────────────────────────────┘

This matrix is enforceable through git's native access control mechanisms.
No additional permission system is required.
