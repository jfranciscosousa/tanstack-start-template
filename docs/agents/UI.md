# UI

**Styling:** Tailwind CSS v4 + DaisyUI v5 | **Icons:** Lucide React

No custom CSS except `src/styles/app.css` (Tailwind entry). All components via DaisyUI. All icons via Lucide React.

## References

- DaisyUI components: https://daisyui.com/components/
- Lucide icons: https://lucide.dev/icons/

## Example Pattern

```typescript
import { Mail, User } from 'lucide-react';

export function SettingsCard() {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          <User className="w-5 h-5" />
          Account Settings
        </h2>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <div className="input input-bordered flex items-center gap-2">
            <Mail className="w-4 h-4 opacity-70" />
            <input type="email" name="email" className="grow" />
          </div>
        </div>

        {/* Error state */}
        <div className="alert alert-error">Something went wrong</div>

        <div className="card-actions justify-end">
          <button className="btn btn-primary">Save</button>
          <button className="btn btn-outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}
```

## Common DaisyUI Classes

**Layout:** `card`, `card-body`, `card-title`, `card-actions`, `navbar`, `navbar-start/center/end`

**Forms:** `form-control`, `input`, `input-bordered`, `input-error`, `label`, `label-text`, `label-text-alt`, `select`, `textarea`, `checkbox`

**Buttons:** `btn`, `btn-primary`, `btn-error`, `btn-outline`, `btn-ghost`, `btn-sm`, `btn-xs`

**Feedback:** `alert`, `alert-error`, `alert-info`, `alert-success`, `loading`, `loading-spinner`

**Navigation:** `menu`, `menu-horizontal`, `menu-sm`, `dropdown`, `dropdown-content`, `dropdown-end`, `tabs`, `tab`

**Data:** `badge`, `badge-primary`, `badge-sm`, `stats`, `stat`, `stat-title`, `stat-value`, `avatar`

**Misc:** `divider`

## Color Tokens

`primary` `secondary` `accent` `neutral` `base-100/200/300` `info` `success` `warning` `error`

Use these for consistency — avoid hardcoded colors.
