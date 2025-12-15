# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Run & Build (Windows)

If you're running on Windows (PowerShell), the `NODE_ENV=production` prefix used by some scripts is not supported natively. To ensure the `build` script works cross-platform we've added `cross-env` to `devDependencies` and updated the `build` script.

Commands (PowerShell):

```powershell
npm install
npm run dev        # start dev server (runs on port 9002 by default)
npm run build      # build for production (uses cross-env internally)
npm run start      # start the production server after build
```

If you prefer not to use `cross-env`, set the environment variable in PowerShell like:

```powershell
$env:NODE_ENV = 'production'; npm run build
```

If `npm install` fails, double-check Node.js and npm versions and paste the error here so we can help debug.

## PowerShell helper (with confirmation)

There's a small PowerShell helper script to run common commands with an interactive confirmation prompt. It's useful when you want to run commands "di samping" (side-by-side) with an easy confirmation step.

File: `scripts/run-with-confirm.ps1`

Usage (PowerShell):

```powershell
.\scripts\run-with-confirm.ps1 -action install  # runs npm install with confirmation
.\scripts\run-with-confirm.ps1 -action dev      # runs npm run dev with confirmation
.\scripts\run-with-confirm.ps1 -action build    # runs npm run build with confirmation
.\scripts\run-with-confirm.ps1 -action start    # runs npm run start with confirmation
```

The script will prompt `Proceed? (Y/N)` before executing the command. If you cancel, nothing will run.
