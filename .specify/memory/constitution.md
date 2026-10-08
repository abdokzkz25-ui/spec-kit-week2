# Quote of the Day Constitution

## Core Principles

### I. Readable, Self-Explaining Code

Code MUST be written for the next reader first.

- Names MUST describe intent (`pickRandomQuote`, not `doIt`); abbreviations MUST NOT be used
  unless universally understood (`id`, `url`).
- Each function MUST do one thing and SHOULD stay under ~30 lines.
- Comments MUST explain *why* when the reason is not obvious; they MUST NOT restate *what* the
  code already says.
- Formatting MUST be consistent across the codebase (one indentation style, one quote style)
  and MUST be enforced by an automated formatter and linter, not by review alone.
- Logic MUST NOT be duplicated: the second copy of a non-trivial rule MUST be extracted into a
  shared function.
- Magic values (unexplained numbers, keys, strings) MUST be replaced by named constants.
- Nesting MUST NOT exceed three levels; early returns SHOULD be used to flatten conditionals.

Rationale: a small project stays maintainable only if any change can be understood in minutes.

### II. Test-First for Behavior (NON-NEGOTIABLE)

Every user-visible behavior in the spec MUST have an automated test that was written, and seen to
fail, before the code that makes it pass.

- Tests MUST cover each acceptance scenario in the feature spec.
- Tests MUST be deterministic: randomness and persistence MUST be injectable or stubbable so
  results do not depend on chance or on leftover state.
- Tests MUST be independent: each test MUST pass when run alone and in any order.
- Tests MUST exercise public interfaces (module exports, rendered output), not private internals,
  so refactoring does not break them.
- Test names MUST state the expected behavior (e.g., "shows a fallback quote when storage is
  empty").
- Error and edge paths (empty data, corrupt data, unavailable storage) MUST be tested, not only
  the happy path.
- Every bug fix MUST start with a regression test that reproduces the bug and fails.
- The full test suite MUST be runnable with a single documented command and SHOULD finish in
  under 10 seconds so it is run on every change.
- A change MUST NOT be considered done while any test fails.

Rationale: tests are the executable form of the spec; writing them first proves the spec was
precise enough to implement.

### III. Simplicity and Minimal Dependencies

The simplest design that satisfies the spec MUST be chosen.

- New third-party dependencies (runtime or build) MUST be justified in the plan by a concrete need
  the platform cannot meet; "convenience" alone is not a justification.
- Features, options, and abstractions not required by the current spec MUST NOT be added (YAGNI).
- Any deviation from these rules MUST be recorded in the plan's Complexity Tracking section.

Rationale: every dependency and abstraction is permanent maintenance cost for a tiny app.

### IV. Small, Cohesive Modules

Logic MUST be separated from presentation and from storage.

- Pure logic (e.g., choosing a quote, toggling a favorite) MUST live in functions with no direct
  DOM or storage access, so it can be tested in isolation.
- Storage access MUST go through one small module so the persistence mechanism can change in one
  place.
- UI code MUST only translate between user events, logic, and rendering.

Rationale: clear boundaries make each part independently testable and replaceable.

### V. Graceful Degradation

The app MUST keep working when its environment is imperfect.

- If persisted data is missing, corrupt, or storage is unavailable, the app MUST still render a
  quote and MUST NOT throw an uncaught error.
- User-facing failures MUST be silent fallbacks or clear messages, never a blank page.

Rationale: browser storage can be disabled, cleared, or full; the core experience must not depend
on it.

### VI. Maintainable by Default

The project MUST be easy for a newcomer to understand, run, and change safely.

- A README MUST document, at minimum: what the app does, how to run it, how to run the tests,
  and how to run lint/format checks, each as a single command.
- Lint, format, and test checks MUST be runnable together with one command, and that command
  MUST pass before any change is merged.
- A single behavior change SHOULD touch as few modules as possible; a change that ripples
  across many files is a signal to revisit module boundaries (Principle IV).
- Dependency versions MUST be pinned (lockfile or exact versions) so builds are reproducible.
- Non-obvious design decisions MUST be recorded briefly in the plan or a short code comment
  explaining why.

Rationale: maintainability is the cost of the next change; documenting how to run and verify the
project and keeping checks automated keeps that cost low.

## Quality Gates

A change is mergeable only when all of the following hold:

1. All automated tests pass with the documented test command.
2. Lint and format checks pass with zero errors.
3. Every acceptance scenario in the active spec maps to at least one test.
4. Every bug fix includes a regression test.
5. No unused code, debug logging, or commented-out code remains.
6. Any new dependency or extra complexity is justified in the plan.
7. The README still accurately describes how to run, test, and check the project.

## Development Workflow

- Work follows the Spec Kit sequence: constitution → specify → plan → tasks → implement →
  converge. Each artifact MUST be reviewed by a human before the next stage starts.
- When the implementation diverges from intent, the spec or plan MUST be corrected first and the
  code regenerated from it; fixing only the code is not allowed for spec-level problems.
- Commits SHOULD be small and describe the behavior they add or change.

## Governance

- This constitution supersedes conflicting practices, plans, and task lists. Plans MUST include a
  Constitution Check that confirms compliance or records justified exceptions.
- Amendments MUST be made through `/speckit-constitution`, include a Sync Impact Report, and bump
  the version using semantic versioning: MAJOR for removing or redefining a principle, MINOR for
  adding a principle or materially expanding guidance, PATCH for clarifications.
- Compliance is reviewed at each human review gate and again during `/speckit-converge`.

**Version**: 1.1.0 | **Ratified**: 2026-10-08 | **Last Amended**: 2026-10-08
