# UI

**Styling:** Tailwind CSS v4 + Base UI (`@base-ui/react`) | **Icons:** Lucide React

Component library lives in `src/components/ui/`. All components use Tailwind utility classes for styling. No CSS-in-JS, no class-based component frameworks.

## References

- Base UI components: https://base-ui.com/react/overview/quick-start
- Lucide icons: https://lucide.dev/icons/

## `cn()` utility

Combine Tailwind classes safely (merges conflicting utilities):

```ts
import { cn } from '~/lib/utils';

cn('p-4 text-sm', condition && 'text-destructive', className)
```

## Component Inventory

| File | Exports |
|---|---|
| `ui/button.tsx` | `Button`, `buttonVariants` |
| `ui/card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| `ui/input.tsx` | `Input` |
| `ui/label.tsx` | `Label` |
| `ui/alert.tsx` | `Alert`, `AlertDescription` |
| `ui/badge.tsx` | `Badge` |
| `ui/separator.tsx` | `Separator` |
| `ui/tabs.tsx` | `TabsRoot`, `TabsList`, `TabsTrigger`, `TabsContent` |
| `ui/dropdown-menu.tsx` | `DropdownMenuRoot`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuGroup` |
| `ui/avatar.tsx` | `Avatar` |

## Example Pattern

```tsx
import { Mail, User } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Alert, AlertDescription } from '~/components/ui/alert';

export function SettingsCard() {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={20} />
          Account Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="flex items-center gap-1.5">
            <Mail size={14} />
            Email
          </Label>
          <Input id="email" type="email" name="email" />
        </div>

        {/* Error state */}
        <Alert variant="destructive">
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Button Variants

```tsx
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="xs">Extra small</Button>
```

Use `buttonVariants()` to apply button styles to non-button elements (e.g., `Link`):

```tsx
import { buttonVariants } from '~/components/ui/button';
<Link to="/signup" className={buttonVariants({ variant: "outline", className: "w-full" })}>
  Sign up
</Link>
```

## Tabs (Base UI)

```tsx
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';

<TabsRoot defaultValue="profile">
  <TabsList>
    <TabsTrigger value="profile">Profile</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="profile"><ProfilePanel /></TabsContent>
  <TabsContent value="settings"><SettingsPanel /></TabsContent>
</TabsRoot>
```

## Dropdown Menu (Base UI)

```tsx
import {
  DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';

// Extract render prop to module-level constant to avoid jsx-no-jsx-as-prop lint warning
const trigger = <Button variant="ghost">Open menu</Button>;
const profileLink = <Link to="/profile" className="flex w-full items-center gap-2">Profile</Link>;

<DropdownMenuRoot>
  <DropdownMenuTrigger render={trigger} />
  <DropdownMenuContent>
    <DropdownMenuItem render={profileLink} />
    <DropdownMenuSeparator />
    <DropdownMenuItem>Action</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenuRoot>
```

## Color Tokens

Defined in `src/styles/app.css` via `@theme inline` (light + dark via `prefers-color-scheme`):

`background` `foreground` `card` `card-foreground` `muted` `muted-foreground` `border` `input` `primary` `primary-foreground` `secondary` `secondary-foreground` `destructive` `destructive-foreground` `accent` `accent-foreground` `ring`

Use as Tailwind classes: `bg-primary`, `text-muted-foreground`, `border-destructive`, etc.

## Avatar Variants

```tsx
import { Avatar } from '~/components/Avatar'; // re-exports from ui/avatar

<Avatar size="sm">TS</Avatar>
<Avatar size="lg" variant="destructive"><Icon /></Avatar>
```

Sizes: `xs` `sm` `md` `lg` `xl`
Variants: `default` `secondary` `destructive` `accent` `muted` `warning` `info` `success`
