# Git & Development Workflow

This document outlines our Version Control strategy. It covers our **current** setup, a **Mini Git Guide** for beginners, and how to handle code collisions (merge conflicts).

---

## 1. Mini Git Guide (The Basics)

If you are new to Git, these are the commands you will use 90% of the time.

| Command | Description |
| :--- | :--- |
| `git clone <url>` | Downloads the repository to your computer for the first time. |
| `git status` | Shows which files you have changed. Always check this before committing! |
| `git pull origin <branch>` | Downloads defaults from the server. **Do this before starting work.** |
| `git add .` | Stages all your changed files to be saved. |
| `git commit -m "message"` | Saves your changes locally with a descriptive message. |
| `git push origin <branch>` | Uploads your commits to the GitHub server. |
| `git switch -c <name>` | Creates and switches to a new branch (e.g., `feature/login`). |
| `git switch <name>` | Switches to an existing branch. |
| `git merge <branch>` | Combines another branch into your current one. |

---

## 2. Current Workflow (Small Team)
*Best for: A small team (1-3 people) physically co-located, communicating constantly, sharing one GitHub account.*

### Branch Structure
*   **main**: **Production**. Code here is live on the public URL.
*   **dev**: **Staging/Testing**. Deployed to a test server.
*   **Feature Branches**: `feature/new-login`, `fix/upload-bug`.

### The Daily Cycle
1.  **Sync**: `git switch dev` -> `git pull origin dev` (Always start fresh).
2.  **Branch**: `git switch -c feature/my-cool-feature`.
3.  **Code**: Work on your feature locally. Test it.
4.  **Merge**:
    *   Switch back: `git switch dev`.
    *   Merge: `git merge feature/my-cool-feature`.
5.  **Test Deployment**: Push to `dev`.
    *   `git push origin dev`.
    *   Wait for verification.
6.  **Production**:
    *   If `dev` is stable: `git switch main`.
    *   Merge: `git merge dev`.
    *   Push: `git push origin main`.

---

## 3. Handling Collisions (Merge Conflicts)
*What happens when two people change the same line of code?*

Scenario:
*   **Dev A** changes the Login Button to **Red** and pushes to `dev`.
*   **Dev B** changes the Login Button to **Blue** locally.
*   **Dev B** tries to `git pull origin dev` to get the latest updates.

**RESULT: CONFLICT.** Git cannot decide if the button should be Red or Blue.

### How to Fix It

#### Step 1: Don't Panic
Git puts "conflict markers" in the file. It looks like this:

```jsx
<<<<<<< HEAD
<button color="blue">Login</button>
=======
<button color="red">Login</button>
>>>>>>> dev
```

*   **HEAD (Current Change)**: What you wrote (Blue).
*   **dev (Incoming Change)**: What is on the server (Red).

#### Step 2: Choose
1.  Open the file in VS Code.
2.  You will see clickable buttons: "Accept Current Change", "Accept Incoming Change", or "Accept Both".
3.  **Talk to your teammate!** Decide which color is correct.
4.  Click the option you want. The markers will disappear.

#### Step 3: Finalize
After resolving all files:
```bash
git add .
git commit -m "Resolved merge conflict on Login Button"
git push origin dev
```

### Advanced: Rebase vs. Merge
*   **Merge (`git pull`)**: Creates a "merge commit". History looks like a braided rope. Safer for beginners.
*   **Rebase (`git pull --rebase`)**: Unwinds your changes, pulls the server updates, then replays your changes on top. History looks like a straight line. Cleaner, but slightly riskier if you not careful.
*   **Recommendation**: Stick to standard **Merge** until you are comfortable.

---

## 4. Scalable Workflow (The Future)
*Best for: Large teams to prevent bugs.*

When the team grows, stop pushing directly to `dev` or `main`.

1.  **Protect Branches**: Lock `main` and `dev` in GitHub settings.
2.  **Pull Requests (PR)**:
    *   Push your branch `feature/button` to GitHub.
    *   Open a **Pull Request** on the website.
    *   Teammates review the code online.
    *   If there is a conflict, GitHub will tell you. You must fix it locally and push again.
    *   Once approved, click **"Squash and Merge"** on GitHub.
