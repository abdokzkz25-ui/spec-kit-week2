# Week 2 Writeup — Spec-Driven Development with Spec Kit

**Feature:** a quote-of-the-day page: one random quote from a built-in list, a "New quote" button,
and favorites that persist across reloads.

**Tools:** Spec Kit 1.1.2 (`specify init spec-kit-week2 --integration claude`) with Claude Code as
the coding agent. I ran every `/speckit-*` skill in the agent's chat inside the project directory
and reviewed each artifact before moving on. Each stage has its own commit, so the git history
shows the loop step by step.

## 1. Prompts given to each skill

| Stage        | Prompt                                                                                                                                               | Output                                                                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Constitution | `/speckit-constitution Create principles focused on code quality, testing, and maintainability`                                                      | `.specify/memory/constitution.md` v1.1.0: six principles (readable code, test-first, simplicity, small modules, graceful degradation, maintainable by default) and seven quality gates |
| Specify      | `/speckit-specify A quote-of-the-day page: one random quote from a built-in list, a "New quote" button, and favoriting that persists across reloads` | `specs/001-quote-of-the-day/spec.md`: 3 user stories, 11 requirements, edge cases, success criteria                                                                                    |
| Clarify      | `/speckit-clarify`, answering its 4 questions: **A**, **B**, **A**, **B** (see below)                                                                | Clarifications section added to the spec; FR-002 and FR-003 tightened; FR-012 to FR-015 added                                                                                          |
| (spec fix)   | `Fix US3 acceptance scenario 7 in spec.md: the Given should be "the displayed quote is not a favorite", since the visitor is favoriting it.`         | Fixed a contradictory scenario that clarify's own consistency check missed                                                                                                             |
| Plan         | `/speckit-plan Use plain HTML/CSS/JavaScript, no backend; persist favorites in localStorage`                                                         | `plan.md`, `research.md` (10 decisions), `data-model.md`, `quickstart.md`, `contracts/`                                                                                                |
| Tasks        | `/speckit-tasks`                                                                                                                                     | `tasks.md`: 31 tasks in 6 phases, with tests before code in every user story                                                                                                           |
| Implement    | `/speckit-implement`                                                                                                                                 | The working page, 56 tests, ESLint + Prettier, and a README                                                                                                                            |
| Converge     | `/speckit-converge`, then `/speckit-implement`, repeated 3 times                                                                                     | Converged after round 3 (details below)                                                                                                                                                |

My clarify answers:

1. New random quote on every load, or one fixed quote per day? **A:** random on every load. This
   matches the assignment and avoids date logic nobody asked for.
2. Show a list of favorited quotes? **B:** yes, a simple list on the same page with a Remove button
   and a "no favorites yet" message.
3. Can earlier quotes come back after "New quote"? **A:** yes. Each pick only avoids the quote on
   screen.
4. Tell the visitor when favorites can't be saved? **B:** yes, with a short notice, so favorites are
   never lost without the visitor knowing.

## 2. Before/after: refining the spec changed the output

The refinement was clarify question 2. I changed the **spec**, not the code. The diff is
`git diff 6025d13 12eb4b6 -- specs/`.

**Before** (`6025d13`), the spec's assumptions said:

> A separate "list of all favorites" view, sharing, and copying quotes are out of scope for this
> feature; favoriting marks quotes so the mark is shown whenever they appear.

The problem: you could favorite a quote, but the only way to see it again was to keep pressing
"New quote" until it happened to come up. The feature that had to persist had almost no visible
payoff, and the success criterion for persistence could only be checked by luck.

**After** (`12eb4b6`), the spec added:

> **FR-012**: System MUST show, on the same page as the main quote, a list of all favorited quotes
> with each quote's text and author, ordered with the most recently favorited first, and MUST
> show a short "no favorites yet" message when the list is empty.

It also added FR-013 (unfavorite from the list), FR-014 (clicking a list item doesn't change the
main quote) and four new acceptance scenarios.

**How the output changed:** the plan gained a `#favorites-list` element in the UI contract and
newest-first ordering in the data model. The tasks gained tests for the list. The built page now
has a Favorites section with Remove buttons. None of that would exist if I had stayed with the
original one-line prompt.

## 3. Convergence outcome

**Converged after 3 rounds.** Final state: 35/35 tasks done, 62/62 tests passing, and
`npm run check` (format + lint + tests) green.

| Round | Findings                            | Result                                                                                                                                                                                                                        |
| ----- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 0 missing, 2 partial, 1 unrequested | Added T032–T034: keyboard focus was lost after pressing "Remove" (it fell back to the top of the page); the can't-save notice might not be read by screen readers; and the lint/format exclusions weren't documented          |
| 2     | 1 partial                           | Added T035: the round 1 fix for the notice introduced a regression. The notice text was rewritten on every click, so a screen reader would announce it again each time. A `MutationObserver` test confirmed it before the fix |
| 3     | 0 findings                          | ✅ Converged                                                                                                                                                                                                                  |

Round 1 is the interesting one: all 56 tests passed and the page worked when I tried it in the
browser, but converge still found a real accessibility bug by checking the code against the spec.

## 4. What I learned

It felt great. The speed was impressive: in one session I went from a one-line idea to a tested,
working page. What I valued most was getting feedback at every step. Each stage gave me something
to review before moving on, and converge kept catching bugs that the tests and my own browser
testing had missed, including one that a previous fix had introduced. I also learned when to use
each skill, like clarify before planning and converge after implementing, even though I use
Claude regularly and had never used any of them before.
