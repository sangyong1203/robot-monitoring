---
trigger: always_on
---

# AI Coding Rules v1.5 (Professional Version)

This document defines the rules that the AI coding assistant must follow when working on frontend projects.

---

# 1. Workflow Rules

* Analyze the task or requirement before coding.
* If design documents, plan images, UI images, or detailed explanations are provided, analyze them carefully.
* For non-trivial tasks, explain your understanding or implementation plan and wait for my confirmation before coding.
* For very small and clearly defined changes, proceed directly without a long explanation.
* If the requirement is unclear in a way that affects business logic, API contracts, data models, routing, architecture, dependencies, security, or user interaction flow, ask questions before coding.
* If only minor details are unclear, such as naming, small styling adjustments, or following an existing local pattern, proceed with a reasonable assumption and state it briefly.
* Explain the implementation plan when the task involves design decisions or architectural changes.
* If multiple implementation options exist, briefly explain them before choosing one.
* When a task can branch into multiple valid paths and assumptions are required, state those assumptions and confirm them with me before proceeding.

---

# 2. Common Rules

* After a meaningful change is finished, ask me whether I want to commit the changes to Git.
* Ask me whether `README.md` should be updated when setup, usage, environment variables, project structure, or major functionality changes.
* Use UTF-8 encoding for all code files.
* If you think we need to add a new coding rule or change an existing rule, ask me before modifying the rules.

---

# 3. Code Safety Rules

* Do not install new libraries or dependencies without my confirmation.
* Avoid modifying unrelated code when implementing a feature or fixing a bug.
* Prefer focused changes that solve the task clearly.
* Avoid unnecessary large rewrites, but refactor the directly affected code when it makes the logic simpler, safer, or easier to maintain.
* Do not preserve existing code at the cost of making the logic more complex.
* When editing files, show only the modified parts when possible, but include enough context to understand the change.
* When modifying existing code, preserve the local code style and project conventions unless I explicitly ask to change them.
* When changing existing logic, briefly explain the affected behavior and possible side effects.

---

# 4. Bug Fixing Rules

* If a bug occurs during coding or testing and the fix is within the directly modified files, you may fix it without asking for confirmation only when it does not change existing business logic or workflow behavior.
* If the fix requires changing business logic, workflow behavior, additional files, shared logic, or architecture, explain the situation and ask for confirmation first.
* Do not refactor unrelated code while fixing a bug.

---

# 5. Verification Rules

* For small changes such as CSS-only updates, text changes, simple UI adjustments, or simple computed-value cleanup, do not run a full build by default.
* For small changes, run lightweight checks such as `git diff --check` when needed.
* Run project-level type-check when the change affects TypeScript logic, props, data types, component interfaces, imports or exports, API contracts, stores, shared types, or reusable function signatures.
* If type-check errors appear in files outside the modified files, report the affected files and explain the likely relationship to the current change.
* Do not automatically modify affected files outside the current change scope.
* If other files are affected by the current change, ask whether to update those affected files or revise the original change to reduce the impact.
* Run a full build when the change affects build configuration, deployment, app-level structure, or when I explicitly request it.

---

# 6. Frontend Rules

* Ensure important HTML elements have class names so that specific parts can be easily identified for debugging, styling, or modification.
* Always use curly braces `{}` for control statements such as `if`, `else`, `for`, and `while`.
* Keep HTML, JavaScript, TypeScript, and component code clean and readable.

---

# 7. UI Development Rules

* Build components as meaningful reusable UI units, such as widgets or sections.
* Avoid splitting components into excessively small pieces.
* When creating UI, create reusable components first and then combine them to build the page.
* Do not create unnecessary abstraction layers.

---

# 8. Code Quality Rules

* Prefer readable code over overly clever or compact code.
* Use meaningful variable and function names.
* Prefer functions with one clear purpose.
* Avoid splitting functions into too many small pieces unless it improves readability, reuse, or maintenance.
* Avoid duplicate logic when it can be reasonably shared without over-engineering.

---

# 9. Documentation Rules

* Add comments for functions, props, and complex logic when they help people understand the code.
* Comments should explain what the function, props, or complex logic does in a clear and practical way.
* Explain why the approach is used only when the reason is not obvious.
* Add detailed comments only when the logic is complex or not immediately obvious.
* Do not add obvious comments that simply repeat the code.

---

# 10. Project Structure Rules

* Creating files inside existing folders and established project patterns is allowed.
* Creating files or folders that follow the structure defined in local documentation or existing project conventions is allowed.
* Ask for confirmation before introducing new structural folders, new folder conventions, or changing the project architecture.
* Follow the existing project folder structure whenever possible.

---

# 11. Framework Rules

* If the project has local documentation such as `README.md`, `AGENTS.md`, or design reference folders, follow them when relevant.
